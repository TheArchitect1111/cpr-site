import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateTempPassword, verifyAdminNonce } from '@/lib/hash';

const BASE = 'appvVr6MVrJvEY0YJ';
const TABLE = 'tblZwrZHi3WBR3NHZ';
const ENROLL_WEBHOOK = 'https://hook.us2.make.com/kyx4lg6myqybtwlbiaom91nzj3sjg8ul';
const FROM_EMAIL = 'mikecrpglobal@mississaugamagic.com';
const MIKE_EMAIL = 'mikecrpglobal@mississaugamagic.com';

// Field IDs for new portal fields
const PF = {
  athleteUsername:  'fldOXULQ3nVumBhHM',
  athletePassHash:  'fldn6o0Y6ZwhqWRAJ',
  athleteLastLogin: 'fld6k3ecTaipFVmfe',
  parentUsername:   'fld85cQzianodvKVN',
  parentPassHash:   'fldTWXPN3GNUvdS0N',
  parentLastLogin:  'fldpOrFhFJo8Fq7lv',
  packagePurchased: 'fldEQVfWP5OQ6Mjwm',
  enrollmentDate:   'fldBnpndceoFIg9y4',
  slug:             'fldGsG5znXJWUPAvc',
};

// Existing field IDs
const EF = {
  firstName:    'flduzR2GtsrnT7mIF',
  lastName:     'fldSpt1SLSr8KCl4P',
  email:        'fldgZ0kRnK1nPOzqb',
  parentName:   'fldJJ2xthmAQU0k8l',
  parentEmail:  'fldspIpyvbOycPBwX',
  gradYear:     'fldzSXdkJeLdkBrbT',
  sport:        'fldivx0pnW78OPKAQ',
  status:       'fldM1mJup7uxnaKfM',
  submittedAt:  'fldxY9CaMYia544vM',
};

function toSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function slugExists(token: string, slug: string): Promise<boolean> {
  const url = `https://api.airtable.com/v0/${BASE}/${TABLE}?maxRecords=1&filterByFormula=${encodeURIComponent(`{Slug}='${slug.replace(/'/g, "\\'")}'`)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!res.ok) return false;
  const data = (await res.json()) as { records: unknown[] };
  return (data.records?.length ?? 0) > 0;
}

async function uniqueSlug(token: string, firstName: string, lastName: string): Promise<string> {
  const base = toSlug(firstName, lastName);
  if (!(await slugExists(token, base))) return base;
  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}-${i}`;
    if (!(await slugExists(token, candidate))) return candidate;
  }
  return `${base}-${Date.now()}`;
}

async function sendResendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function emailParent(
  parentName: string,
  athleteName: string,
  parentUsername: string,
  parentTempPassword: string,
): string {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1A1A1A">
  <div style="background:#0C0C0A;padding:24px;text-align:center">
    <img src="https://canadianprospectrecruitment.vercel.app/cpr-logo.png" alt="CPR" style="width:58px;height:58px;border-radius:50%" />
    <div style="color:#C8102E;font-size:18px;font-weight:800;letter-spacing:1px;margin-top:10px">CANADIAN PROSPECTS RECRUITMENT</div>
  </div>
  <div style="padding:32px 24px;background:#fff">
    <h2 style="margin:0 0 16px;font-size:22px">Welcome to the CPR Parent Success Portal</h2>
    <p style="margin:0 0 12px">Hello ${parentName},</p>
    <p style="margin:0 0 20px">Your family has been enrolled in Canadian Prospects Recruitment for ${athleteName}. Your Parent Success Portal gives you visibility into your athlete's progress, onboarding checklist, and key milestones throughout the recruiting process.</p>
    <div style="background:#F7F7F7;border-left:4px solid #C8102E;padding:16px 20px;margin-bottom:24px">
      <div style="font-size:13px;font-weight:700;letter-spacing:.5px;margin-bottom:10px">YOUR LOGIN CREDENTIALS</div>
      <div style="margin-bottom:6px"><strong>Login page:</strong> <a href="https://canadianprospectrecruitment.vercel.app/portal/login">canadianprospectrecruitment.vercel.app/portal/login</a></div>
      <div style="margin-bottom:6px"><strong>Username:</strong> ${parentUsername}</div>
      <div><strong>Temporary password:</strong> ${parentTempPassword}</div>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#555">Please log in and change your password at your earliest convenience. If you have any questions, reply to this email or contact Mike directly.</p>
  </div>
  <div style="background:#F4F4F4;padding:14px;text-align:center;font-size:11px;color:#888">
    Canadian Prospects Recruitment &middot; mikecrpglobal@mississaugamagic.com
  </div>
</div>`;
}

function emailAthlete(
  firstName: string,
  athleteUsername: string,
  athleteTempPassword: string,
): string {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1A1A1A">
  <div style="background:#0C0C0A;padding:24px;text-align:center">
    <img src="https://canadianprospectrecruitment.vercel.app/cpr-logo.png" alt="CPR" style="width:58px;height:58px;border-radius:50%" />
    <div style="color:#C8102E;font-size:18px;font-weight:800;letter-spacing:1px;margin-top:10px">CANADIAN PROSPECTS RECRUITMENT</div>
  </div>
  <div style="padding:32px 24px;background:#fff">
    <h2 style="margin:0 0 16px;font-size:22px">Welcome to Your CPR Recruiting Portal</h2>
    <p style="margin:0 0 12px">Hey ${firstName},</p>
    <p style="margin:0 0 20px">You are officially in the CPR system. Your recruiting portal is where Coach Mike tracks your progress and builds your profile for college coaches. Here is how to get started.</p>
    <div style="background:#F7F7F7;border-left:4px solid #C8102E;padding:16px 20px;margin-bottom:24px">
      <div style="font-size:13px;font-weight:700;letter-spacing:.5px;margin-bottom:10px">YOUR LOGIN CREDENTIALS</div>
      <div style="margin-bottom:6px"><strong>Login page:</strong> <a href="https://canadianprospectrecruitment.vercel.app/portal/login">canadianprospectrecruitment.vercel.app/portal/login</a></div>
      <div style="margin-bottom:6px"><strong>Username:</strong> ${athleteUsername}</div>
      <div><strong>Temporary password:</strong> ${athleteTempPassword}</div>
    </div>
    <div style="margin-bottom:20px">
      <div style="font-size:13px;font-weight:700;letter-spacing:.5px;margin-bottom:10px">YOUR FIRST STEPS</div>
      <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.8">
        <li>Complete your athlete profile (name, position, school, stats)</li>
        <li>Upload your highlight video link (YouTube preferred)</li>
        <li>Upload your photos (action shots and headshot)</li>
        <li>Upload your transcript (unofficial is fine to start)</li>
      </ol>
    </div>
    <p style="margin:0;font-size:13px;color:#555">Coach Mike will review your materials and reach out with next steps. Let us build your future together.</p>
  </div>
  <div style="background:#F4F4F4;padding:14px;text-align:center;font-size:11px;color:#888">
    Canadian Prospects Recruitment &middot; mikecrpglobal@mississaugamagic.com
  </div>
</div>`;
}

function emailMike(
  athleteName: string,
  parentName: string,
  parentEmail: string,
  athleteEmail: string,
  gradYear: string,
  sport: string,
  packagePurchased: string,
): string {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1A1A1A">
  <div style="background:#0C0C0A;padding:24px;text-align:center">
    <div style="color:#C8102E;font-size:18px;font-weight:800;letter-spacing:1px">CPR ADMIN NOTIFICATION</div>
  </div>
  <div style="padding:32px 24px;background:#fff">
    <h2 style="margin:0 0 20px;font-size:20px">New Client Enrolled</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:8px 0;border-bottom:1px solid #EEE;color:#666;width:140px">Athlete Name</td><td style="padding:8px 0;border-bottom:1px solid #EEE;font-weight:700">${athleteName}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #EEE;color:#666">Parent Name</td><td style="padding:8px 0;border-bottom:1px solid #EEE">${parentName}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #EEE;color:#666">Parent Email</td><td style="padding:8px 0;border-bottom:1px solid #EEE">${parentEmail}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #EEE;color:#666">Athlete Email</td><td style="padding:8px 0;border-bottom:1px solid #EEE">${athleteEmail}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #EEE;color:#666">Graduation Year</td><td style="padding:8px 0;border-bottom:1px solid #EEE">${gradYear}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #EEE;color:#666">Sport</td><td style="padding:8px 0;border-bottom:1px solid #EEE">${sport}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Package</td><td style="padding:8px 0;font-weight:700;color:#C8102E">${packagePurchased}</td></tr>
    </table>
  </div>
  <div style="background:#F4F4F4;padding:14px;text-align:center;font-size:11px;color:#888">
    Sent automatically by the CPR admin portal.
  </div>
</div>`;
}

export async function POST(req: NextRequest) {
  const airtableToken = process.env.AIRTABLE_TOKEN;
  if (!airtableToken) {
    return NextResponse.json({ error: 'Server not configured.' }, { status: 503 });
  }

  // Verify admin nonce
  const nonce = req.headers.get('x-cpr-admin') ?? '';
  if (!verifyAdminNonce(nonce)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const s = (v: unknown) => String(v ?? '').trim();
  const athleteFirstName = s(body.athleteFirstName);
  const athleteLastName = s(body.athleteLastName);
  const athleteEmail = s(body.athleteEmail);
  const parentName = s(body.parentName);
  const parentEmail = s(body.parentEmail);
  const gradYear = s(body.gradYear);
  const sport = s(body.sport);
  const packagePurchased = s(body.packagePurchased);

  if (!athleteFirstName || !athleteLastName || !parentName || !parentEmail) {
    return NextResponse.json({ error: 'Athlete name, parent name, and parent email are required.' }, { status: 400 });
  }

  // 1. Generate unique slug
  const slug = await uniqueSlug(airtableToken, athleteFirstName, athleteLastName);

  // 2. Generate credentials
  const athleteUsername = slug; // e.g. jayden-thompson
  const parentUsername = `parent.${slug}`; // e.g. parent.jayden-thompson
  const athleteTempPassword = generateTempPassword();
  const parentTempPassword = generateTempPassword();

  // 3. Hash passwords
  const athletePassHash = hashPassword(athleteTempPassword);
  const parentPassHash = hashPassword(parentTempPassword);

  // 4. Create Airtable record
  const fields: Record<string, unknown> = {
    [EF.firstName]:    athleteFirstName,
    [EF.lastName]:     athleteLastName,
    [EF.parentName]:   parentName,
    [EF.parentEmail]:  parentEmail,
    [EF.status]:       'Active',
    [EF.submittedAt]:  new Date().toISOString().slice(0, 10),
    [PF.slug]:               slug,
    [PF.athleteUsername]:    athleteUsername,
    [PF.athletePassHash]:    athletePassHash,
    [PF.parentUsername]:     parentUsername,
    [PF.parentPassHash]:     parentPassHash,
    [PF.packagePurchased]:   packagePurchased,
    [PF.enrollmentDate]:     new Date().toISOString().slice(0, 10),
  };
  if (athleteEmail)    fields[EF.email]    = athleteEmail;
  if (gradYear)        fields[EF.gradYear] = Number(gradYear) || gradYear;
  if (sport)           fields[EF.sport]    = sport;

  const atRes = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${airtableToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  });

  if (!atRes.ok) {
    const detail = await atRes.text();
    console.error('Airtable create-client error:', detail);
    return NextResponse.json({ error: 'Failed to create Airtable record. Please try again.' }, { status: 502 });
  }

  const atData = (await atRes.json()) as { records: { id: string }[] };
  const recordId = atData.records?.[0]?.id;

  // 5. Fire Make.com webhook (non-fatal if it fails)
  try {
    await fetch(ENROLL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'new_client_enrolled',
        recordId,
        slug,
        athleteFirstName,
        athleteLastName,
        athleteEmail,
        parentName,
        parentEmail,
        gradYear,
        sport,
        packagePurchased,
        submittedAt: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error('Make webhook error (non-fatal):', err);
  }

  // 6. Send welcome emails via Resend
  const athleteFullName = `${athleteFirstName} ${athleteLastName}`;
  const [parentOk, athleteOk, mikeOk] = await Promise.all([
    parentEmail
      ? sendResendEmail(
          parentEmail,
          'Welcome to CPR Parent Success Portal',
          emailParent(parentName, athleteFullName, parentUsername, parentTempPassword),
        )
      : Promise.resolve(false),
    athleteEmail
      ? sendResendEmail(
          athleteEmail,
          'Welcome to Your CPR Recruiting Portal',
          emailAthlete(athleteFirstName, athleteUsername, athleteTempPassword),
        )
      : Promise.resolve(false),
    sendResendEmail(
      MIKE_EMAIL,
      'New CPR Client Enrolled',
      emailMike(athleteFullName, parentName, parentEmail, athleteEmail, gradYear, sport, packagePurchased),
    ),
  ]);

  const emailsSent = parentOk || athleteOk || mikeOk;

  return NextResponse.json({
    ok: true,
    recordId,
    slug,
    emailsSent,
    // Always return credentials so admin can share manually if email failed
    credentials: {
      athleteUsername,
      athleteTempPassword,
      parentUsername,
      parentTempPassword,
    },
  });
}
