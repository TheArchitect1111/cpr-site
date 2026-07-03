import { NextRequest, NextResponse } from "next/server";
import { uniqueAthleteSlug } from "@/lib/slug";
import { profileUrl } from "@/lib/registrant-progress";
import { normalizePhotoUrl } from "@/lib/blob-upload";
import { sendApplyAdminAlert, sendApplyConfirmationEmail } from "@/lib/apply-notifications";
import { forwardPulseEvent } from "@/lib/ea-pulse-forward";
import { isProductionDeploy } from "@/lib/env";
import { findApplicantByEmail } from "@/lib/portal-credentials";
import { isOpenStaging } from "@/lib/staging";

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "appvVr6MVrJvEY0YJ";
const AIRTABLE_TABLE_ID = "tblZwrZHi3WBR3NHZ";
const ACTIVITY_PREFIX = "[CPR_ACTIVITY]";

// Field IDs for the Athlete Intake table. IDs survive renames, names do not.
const F = {
  firstName: "flduzR2GtsrnT7mIF",
  lastName: "fldSpt1SLSr8KCl4P",
  email: "fldgZ0kRnK1nPOzqb",
  phone: "fldVwoXoi8ZkCteCC",
  dateOfBirth: "fld521liSxX1tZBNE",
  sport: "fldivx0pnW78OPKAQ",
  position: "fldRV83rNpgxVJ60W",
  height: "fldovHp3v0YaHqIhG",
  weight: "fldib2VBmZIpCEwuk",
  wingspan: "flds34BtvJNRHpW6p",
  gpa: "fldMzCAvovhHj4cjB",
  satScore: "fldeKcKSpVLgfRrvI",
  currentSchool: "fldL1EmBdSCOWsO3X",
  gradYear: "fldzSXdkJeLdkBrbT",
  country: "fldorVoCEhLFWOCZR",
  stateProvince: "fldZHbY3FfoBDszom",
  city: "fldGyOOhlEMwbJhey",
  postalCode: "fldurxfDCSHX0o2zx",
  citizenship: "fldDAz7MEuYrZ4CDC",
  dualCitizenship: "fldgXgaP3NBWFEqH1",
  additionalCitizenship: "fldv7vQjhkMXfApMs",
  globalCities: "fldmC2cJ0u6eSVyof",
  parentName: "fldJJ2xthmAQU0k8l",
  parentEmail: "fldspIpyvbOycPBwX",
  parentPhone: "fldE00ro5IpP5n5L2",
  bio: "fldODAtRgFyaLrR8m",
  strengths: "fld8i0s3hOXAVPw6N",
  highlightVideoUrl: "fld43RH1X5KsaDMfs",
  photoUrl: "fldZtAJHuCIoq27MM",
  gameplayVideoUrl: "fldJKWz4vP3vk1oUo",
  feeStage1: "fldoi30EF4BI8m5g3",
  feeStage2: "fldqUAGfXBDrkeMgw",
  feeStage3: "flds19bdfw8p3qQtV",
  nilInterest: "fld1gXFOlmAb2w6rR",
  termsAgreed: "fldPmTQd6Q0X8sbVr",
  digitalSignature: "fld2Ldqqycn5OCGTl",
  submittedAt: "fldxY9CaMYia544vM",
  slug: "fldGsG5znXJWUPAvc",
  status: "fldM1mJup7uxnaKfM",
} as const;

function num(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function str(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const firstName = str(body.firstName);
    const lastName = str(body.lastName);
  const email = str(body.email);
  const termsAgreed = body.termsAgreed === true;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required." },
        { status: 400 }
      );
    }
    if (!termsAgreed) {
      return NextResponse.json(
        { error: "Terms must be acknowledged before the application can be submitted." },
        { status: 400 }
      );
    }
    if (isOpenStaging()) {
      const slug = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return NextResponse.json({
        ok: true,
        recordId: `staging_${Date.now()}`,
        slug,
        profileUrl: profileUrl(slug),
        confirmationSent: false,
        adminAlertSent: false,
        staging: true,
      });
    }

    if (!process.env.AIRTABLE_TOKEN) {
      return NextResponse.json(
        { error: "Server is not configured. Missing AIRTABLE_TOKEN." },
        { status: 500 }
      );
    }
    if (isProductionDeploy() && !process.env.PORTAL_SECRET?.trim()) {
      console.error("Missing PORTAL_SECRET in production.");
    }

    const existingApplicant = await findApplicantByEmail(email);
    if (existingApplicant) {
      console.warn(`Duplicate application attempt blocked for ${email} (record ${existingApplicant.id}).`);
      return NextResponse.json(
        {
          error:
            "An application with this email address already exists. If you need help accessing your profile or updating your application, please contact CPR support.",
        },
        { status: 409 }
      );
    }

    const token = process.env.AIRTABLE_TOKEN;
    const slug = await uniqueAthleteSlug(token, firstName, lastName);
    const activityLine = `${ACTIVITY_PREFIX} ${new Date().toISOString()} Application submitted online. Recruiting profile created.`;

    const normalizedPhotoUrl = await normalizePhotoUrl(str(body.photoUrl), slug);

    const fields: Record<string, unknown> = {
      [F.firstName]: firstName,
      [F.lastName]: lastName,
      [F.email]: email,
      [F.slug]: slug,
      [F.status]: "Pending",
      Notes: activityLine,
      [F.termsAgreed]: true,
      [F.submittedAt]: new Date().toISOString().slice(0, 10),
      [F.feeStage1]: body.feeStage1 === true,
      [F.feeStage2]: body.feeStage2 === true,
      [F.feeStage3]: body.feeStage3 === true,
      [F.nilInterest]: body.nilInterest === true,
    };

    const optionalText: Array<[keyof typeof F, unknown]> = [
      ["phone", body.phone],
      ["dateOfBirth", body.dateOfBirth],
      ["sport", body.sport],
      ["position", body.position],
      ["height", body.height],
      ["currentSchool", body.currentSchool],
      ["country", body.country],
      ["stateProvince", body.stateProvince],
      ["city", body.city],
      ["postalCode", body.postalCode],
      ["citizenship", body.citizenship],
      ["additionalCitizenship", body.additionalCitizenship],
      ["parentName", body.parentName],
      ["parentEmail", body.parentEmail],
      ["parentPhone", body.parentPhone],
      ["bio", body.bio],
      ["strengths", body.strengths],
      ["highlightVideoUrl", body.highlightVideoUrl],
      ["gameplayVideoUrl", body.gameplayVideoUrl],
    ];
    for (const [key, value] of optionalText) {
      const v = str(value);
      if (v) fields[F[key]] = v;
    }
    if (normalizedPhotoUrl) fields[F.photoUrl] = normalizedPhotoUrl;

    fields[F.dualCitizenship] = body.dualCitizenship === true;

    if (Array.isArray(body.globalCities) && body.globalCities.length > 0) {
      fields[F.globalCities] = body.globalCities.filter(
        (c: unknown) => typeof c === "string" && c.trim()
      );
    }

    const optionalNumbers: Array<[keyof typeof F, unknown]> = [
      ["weight", body.weight],
      ["wingspan", body.wingspan],
      ["gpa", body.gpa],
      ["satScore", body.satScore],
      ["gradYear", body.gradYear],
    ];
    for (const [key, value] of optionalNumbers) {
      const v = num(value);
      if (v !== undefined) fields[F[key]] = v;
    }

    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [{ fields }],
          typecast: true,
        }),
      }
    );

    if (!airtableRes.ok) {
      const detail = await airtableRes.text();
      console.error("Airtable create failed:", detail);
      return NextResponse.json(
        { error: "Your application could not be saved. Please try again." },
        { status: 502 }
      );
    }

    const airtableData = await airtableRes.json();
    const recordId: string | undefined = airtableData?.records?.[0]?.id;
    const publicProfileUrl = profileUrl(slug);

    const emailInput = {
      recordId: recordId || slug,
      firstName,
      lastName,
      email,
      slug,
      profileUrl: publicProfileUrl,
      sport: str(body.sport),
      position: str(body.position),
      currentSchool: str(body.currentSchool),
      gradYear: str(String(body.gradYear ?? "")),
      parentEmail: str(body.parentEmail),
    };

    const [confirmationSent, adminAlertSent] = recordId
      ? await Promise.all([
          sendApplyConfirmationEmail(emailInput),
          sendApplyAdminAlert(emailInput),
        ])
      : [false, false];

    // Optional Make automation (non-fatal). Keys match the scenario Set Variables module.
    if (process.env.MAKE_CPR_WEBHOOK && recordId) {
      try {
        await fetch(process.env.MAKE_CPR_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordId,
            firstName,
            lastName,
            email,
            position: str(body.position) || "",
            currentSchool: str(body.currentSchool) || "",
            gradYear: str(String(body.gradYear ?? "")) || "",
          }),
        });
      } catch (err) {
        // The record is saved; automation failure should not fail the athlete.
        console.error("Make webhook call failed:", err);
      }
    }

    if (recordId) {
      void forwardPulseEvent({
        product: "cpr",
        type: "apply.submitted",
        title: `CPR apply — ${firstName} ${lastName}`,
        detail: email,
        priority: "medium",
        href: publicProfileUrl,
        tenantId: slug,
        objectId: recordId,
      });
    }

    return NextResponse.json({
      ok: true,
      recordId,
      slug,
      profileUrl: publicProfileUrl,
      confirmationSent,
      adminAlertSent,
    });
  } catch (err) {
    console.error("Apply route error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
