"use client";

import { useMemo, useState } from "react";
import { COUNTRIES, GLOBAL_CITIES } from "@/lib/countries";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  country: string;
  stateProvince: string;
  city: string;
  postalCode: string;
  citizenship: string;
  dualCitizenship: boolean;
  additionalCitizenship: string;
  globalCities: string[];
  sport: string;
  position: string;
  height: string;
  weight: string;
  wingspan: string;
  currentSchool: string;
  gradYear: string;
  gpa: string;
  satScore: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  bio: string;
  strengths: string;
  highlightVideoUrl: string;
  photoUrl: string;
  gameplayVideoUrl: string;
  feeStage1: boolean;
  feeStage2: boolean;
  feeStage3: boolean;
  nilInterest: boolean;
  termsAgreed: boolean;
};

const INITIAL: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  country: "",
  stateProvince: "",
  city: "",
  postalCode: "",
  citizenship: "",
  dualCitizenship: false,
  additionalCitizenship: "",
  globalCities: [],
  sport: "Basketball",
  position: "",
  height: "",
  weight: "",
  wingspan: "",
  currentSchool: "",
  gradYear: "",
  gpa: "",
  satScore: "",
  parentName: "",
  parentEmail: "",
  parentPhone: "",
  bio: "",
  strengths: "",
  highlightVideoUrl: "",
  photoUrl: "",
  gameplayVideoUrl: "",
  feeStage1: false,
  feeStage2: false,
  feeStage3: false,
  nilInterest: false,
  termsAgreed: false,
};

const STEPS = [
  "Personal Information",
  "Athletic Profile",
  "Academics",
  "Parent / Guardian",
  "Bio and Media",
  "Program Acknowledgments",
  "Review and Acknowledge",
];

const GRAD_YEARS = Array.from({ length: 7 }, (_, i) =>
  String(new Date().getFullYear() + i)
);

const URL_HINT = "Paste a link from YouTube, Vimeo, Google Drive, or Dropbox";

const inputCls =
  "w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]";
const labelCls =
  "mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-700";

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {required ? <span className="text-[#CC0000]"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  title,
  body,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start gap-4 border p-4 text-left transition-colors ${
        checked ? "border-[#CC0000] bg-red-50" : "border-neutral-300 bg-white"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${
          checked
            ? "border-[#CC0000] bg-[#CC0000] text-white"
            : "border-neutral-400 bg-white"
        }`}
        aria-hidden
      >
        {checked ? "✓" : ""}
      </span>
      <span>
        <span className="block text-sm font-bold text-neutral-900">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-neutral-600">
          {body}
        </span>
      </span>
    </button>
  );
}

function CityPill({
  city,
  selected,
  onToggle,
}: {
  city: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
        selected
          ? "bg-[#CC0000] text-white"
          : "border border-neutral-300 bg-white text-neutral-700 hover:border-[#CC0000]"
      }`}
    >
      {city}
    </button>
  );
}

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const toggleCity = (city: string) => {
    setData(d => ({
      ...d,
      globalCities: d.globalCities.includes(city)
        ? d.globalCities.filter(c => c !== city)
        : [...d.globalCities, city],
    }));
  };

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return (
          data.firstName.trim() &&
          data.lastName.trim() &&
          /\S+@\S+\.\S+/.test(data.email) &&
          data.phone.trim() &&
          data.dateOfBirth &&
          data.country.trim() &&
          data.stateProvince.trim() &&
          data.city.trim()
        );
      case 1:
        return (
          data.position.trim() &&
          data.height.trim() &&
          data.currentSchool.trim() &&
          data.gradYear.trim()
        );
      case 2:
        return data.gpa.trim().length > 0;
      case 3:
        return (
          data.parentName.trim() &&
          /\S+@\S+\.\S+/.test(data.parentEmail) &&
          data.parentPhone.trim()
        );
      case 4:
        return data.bio.trim() && data.highlightVideoUrl.trim();
      case 5:
        return data.feeStage1 && data.feeStage2 && data.feeStage3;
      case 6:
        return data.termsAgreed;
      default:
        return false;
    }
  }, [step, data]);

  const next = () => {
    if (!stepValid) {
      setError("Complete the required fields above to continue.");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0 });
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0 });
  };

  const submit = async () => {
    if (!stepValid) {
      setError(
        "Please review the acknowledgment and check the agreement box."
      );
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }
      if (json.profileUrl) setProfileUrl(String(json.profileUrl));
      setDone(true);
    } catch {
      setError("Network error. Check your connection and try again.");
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main className="min-h-screen bg-neutral-100">
        <div className="bg-[#0A0A0A] px-6 py-10 text-center">
          <img src="/cpr-logo.png" alt="Canadian Prospects Recruitment" className="mx-auto mb-4 h-24 w-24" />
          <h1 className="text-2xl font-extrabold uppercase tracking-widest text-[#CC0000]">
            Canadian Prospects
          </h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-white">
            Recruitment
          </p>
        </div>
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-[#CC0000] text-3xl text-white">
            ✓
          </div>
          <h2 className="text-2xl font-extrabold uppercase tracking-wide text-neutral-900">
            Application received, {data.firstName}.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            A confirmation is on its way to {data.email}. Your recruiting profile has been created and Coach Mike can see your registration in the admin portal immediately.
          </p>
          {profileUrl && (
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Your profile page:{" "}
              <a href={profileUrl} className="font-semibold text-[#CC0000] underline" target="_blank" rel="noopener noreferrer">
                {profileUrl}
              </a>
            </p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Our team reviews every application and you will hear from us within 2 to 3 business days with agreement and payment instructions.
          </p>
          <a
            href="/"
            className="mt-8 inline-block bg-[#0A0A0A] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white"
          >
            Back to home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 pb-20">
      <div className="bg-[#0A0A0A] px-6 py-10 text-center">
        <img src="/cpr-logo.png" alt="Canadian Prospects Recruitment" className="mx-auto mb-4 h-24 w-24" />
        <h1 className="text-2xl font-extrabold uppercase tracking-widest text-[#CC0000]">
          Athlete Application
        </h1>
        <p className="mt-1 text-xs uppercase tracking-widest text-white">
          Canadian Prospects Recruitment
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-6">
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Step {step + 1} of {STEPS.length}
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-[#CC0000]">
              {STEPS[step]}
            </p>
          </div>
          <div className="mt-3 h-1.5 w-full bg-neutral-300">
            <div
              className="h-1.5 bg-[#CC0000] transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-8 space-y-5 border border-neutral-200 bg-white p-6 sm:p-8">
          {step === 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="First name" required>
                  <input
                    className={inputCls}
                    value={data.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    autoComplete="given-name"
                  />
                </Field>
                <Field label="Last name" required>
                  <input
                    className={inputCls}
                    value={data.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    autoComplete="family-name"
                  />
                </Field>
              </div>
              <Field label="Email" required>
                <input
                  type="email"
                  className={inputCls}
                  value={data.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Phone" required>
                  <input
                    type="tel"
                    className={inputCls}
                    value={data.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    autoComplete="tel"
                  />
                </Field>
                <Field label="Date of birth" required>
                  <input
                    type="date"
                    className={inputCls}
                    value={data.dateOfBirth}
                    onChange={(e) => set("dateOfBirth", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Country" required>
                <select
                  className={inputCls}
                  value={data.country}
                  onChange={(e) => set("country", e.target.value)}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="State / Province / Region" required hint="Example: Ontario">
                  <input
                    className={inputCls}
                    value={data.stateProvince}
                    onChange={(e) => set("stateProvince", e.target.value)}
                    autoComplete="address-level1"
                  />
                </Field>
                <Field label="City" required hint="Example: Mississauga">
                  <input
                    className={inputCls}
                    value={data.city}
                    onChange={(e) => set("city", e.target.value)}
                    autoComplete="address-level2"
                  />
                </Field>
              </div>
              <Field label="Postal / ZIP Code">
                <input
                  className={inputCls}
                  value={data.postalCode}
                  onChange={(e) => set("postalCode", e.target.value)}
                  autoComplete="postal-code"
                />
              </Field>
              <div className="border-t border-neutral-200 pt-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Citizenship (optional)
                </p>
                <Field label="Citizenship / Nationality" hint="Example: Canadian">
                  <input
                    className={inputCls}
                    value={data.citizenship}
                    onChange={(e) => set("citizenship", e.target.value)}
                  />
                </Field>
                <div className="mt-4">
                  <CheckRow
                    checked={data.dualCitizenship}
                    onChange={(v) => set("dualCitizenship", v)}
                    title="I hold dual citizenship"
                    body="Check this if you hold citizenship in more than one country. This can affect recruiting eligibility in some programs."
                  />
                </div>
                {data.dualCitizenship && (
                  <div className="mt-4">
                    <Field label="Additional citizenship">
                      <input
                        className={inputCls}
                        value={data.additionalCitizenship}
                        onChange={(e) => set("additionalCitizenship", e.target.value)}
                        placeholder="Example: American"
                      />
                    </Field>
                  </div>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Sport" required>
                  <input
                    className={inputCls}
                    value={data.sport}
                    onChange={(e) => set("sport", e.target.value)}
                  />
                </Field>
                <Field label="Position" required hint="Example: Point Guard">
                  <input
                    className={inputCls}
                    value={data.position}
                    onChange={(e) => set("position", e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Height" required hint={'Example: 6\'4"'}>
                  <input
                    className={inputCls}
                    value={data.height}
                    onChange={(e) => set("height", e.target.value)}
                  />
                </Field>
                <Field label="Weight (lbs)">
                  <input
                    type="number"
                    inputMode="numeric"
                    className={inputCls}
                    value={data.weight}
                    onChange={(e) => set("weight", e.target.value)}
                  />
                </Field>
                <Field label="Wingspan (in)">
                  <input
                    type="number"
                    inputMode="numeric"
                    className={inputCls}
                    value={data.wingspan}
                    onChange={(e) => set("wingspan", e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Current school" required>
                  <input
                    className={inputCls}
                    value={data.currentSchool}
                    onChange={(e) => set("currentSchool", e.target.value)}
                  />
                </Field>
                <Field label="Graduation year" required>
                  <select
                    className={inputCls}
                    value={data.gradYear}
                    onChange={(e) => set("gradYear", e.target.value)}
                  >
                    <option value="">Select year</option>
                    {GRAD_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="GPA" required hint="On a 4.0 scale">
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    className={inputCls}
                    value={data.gpa}
                    onChange={(e) => set("gpa", e.target.value)}
                  />
                </Field>
                <Field label="SAT score" hint="Leave blank if not taken yet">
                  <input
                    type="number"
                    inputMode="numeric"
                    className={inputCls}
                    value={data.satScore}
                    onChange={(e) => set("satScore", e.target.value)}
                  />
                </Field>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Field label="Parent / guardian name" required>
                <input
                  className={inputCls}
                  value={data.parentName}
                  onChange={(e) => set("parentName", e.target.value)}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Parent email" required>
                  <input
                    type="email"
                    className={inputCls}
                    value={data.parentEmail}
                    onChange={(e) => set("parentEmail", e.target.value)}
                  />
                </Field>
                <Field label="Parent phone" required>
                  <input
                    type="tel"
                    className={inputCls}
                    value={data.parentPhone}
                    onChange={(e) => set("parentPhone", e.target.value)}
                  />
                </Field>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <Field
                label="Bio"
                required
                hint="Tell coaches who you are: your story, your game, your goals"
              >
                <textarea
                  rows={4}
                  className={inputCls}
                  value={data.bio}
                  onChange={(e) => set("bio", e.target.value)}
                />
              </Field>
              <Field
                label="Strengths"
                hint="What you do best on the court, in your own words"
              >
                <textarea
                  rows={3}
                  className={inputCls}
                  value={data.strengths}
                  onChange={(e) => set("strengths", e.target.value)}
                />
              </Field>
              <Field label="Highlight video link" required hint={URL_HINT}>
                <input
                  type="url"
                  placeholder="https://"
                  className={inputCls}
                  value={data.highlightVideoUrl}
                  onChange={(e) => set("highlightVideoUrl", e.target.value)}
                />
              </Field>
              <Field label="Photo link" hint={URL_HINT}>
                <input
                  type="url"
                  placeholder="https://"
                  className={inputCls}
                  value={data.photoUrl}
                  onChange={(e) => set("photoUrl", e.target.value)}
                />
              </Field>
              <Field label="Choose profile photo from phone gallery" hint="Mobile-friendly photo selection. If upload hosting is connected later, this image can be saved directly to the profile.">
                <input
                  type="file"
                  accept="image/*"
                  className={inputCls}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string") set("photoUrl", reader.result);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </Field>
              {data.photoUrl ? (
                <img
                  src={data.photoUrl}
                  alt="Selected profile preview"
                  className="h-28 w-28 object-cover"
                />
              ) : null}
              <Field label="Full gameplay video link" hint={URL_HINT}>
                <input
                  type="url"
                  placeholder="https://"
                  className={inputCls}
                  value={data.gameplayVideoUrl}
                  onChange={(e) => set("gameplayVideoUrl", e.target.value)}
                />
              </Field>
              <div>
                <label className={labelCls}>
                  Global Cities of Interest
                </label>
                <p className="mb-3 text-xs text-neutral-500">
                  Select cities where you are open to playing college basketball. Select all that apply.
                </p>
                <div className="flex flex-wrap gap-2">
                  {GLOBAL_CITIES.map((city) => (
                    <CityPill
                      key={city}
                      city={city}
                      selected={data.globalCities.includes(city)}
                      onToggle={() => toggleCity(city)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <p className="text-sm leading-relaxed text-neutral-600">
                Joining CPR is not one single payment. The program happens in
                three steps. Each step has its own fee, and you only pay for a
                step when we begin that step.
              </p>
              <div className="space-y-4 border-l-[3px] border-[#CC0000] pl-5">
                <div>
                  <p className="text-sm font-bold text-neutral-900">
                    Step 1 · We build your profile
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-neutral-600">
                    If your application is accepted, we build your professional
                    recruiting profile. The Step 1 fee is paid when this work
                    begins.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">
                    Step 2 · We contact coaches
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-neutral-600">
                    We send your profile directly to college coaches across
                    North America. The Step 2 fee is paid when this outreach
                    begins.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">
                    Step 3 · We manage your recruitment
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-neutral-600">
                    As coaches respond, we manage the conversations and guide
                    you and your family through every decision. The Step 3 fee
                    is paid when this stage begins.
                  </p>
                </div>
              </div>
              <CheckRow
                checked={data.feeStage1 && data.feeStage2 && data.feeStage3}
                onChange={(v) => {
                  set("feeStage1", v);
                  set("feeStage2", v);
                  set("feeStage3", v);
                }}
                title="I understand the three steps and their fees"
                body="I understand CPR's program has three steps, each step has its own fee, and each fee is paid only when that step begins."
              />
              <CheckRow
                checked={data.nilInterest}
                onChange={(v) => set("nilInterest", v)}
                title="NIL Interest (optional)"
                body="Check this if you want to learn how athletes can earn money from their Name, Image, and Likeness (NIL). This does not affect your application."
              />
            </>
          )}

          {step === 6 && (
            <>
              <div className="border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                <p className="font-bold uppercase tracking-wider text-neutral-900">
                  {data.firstName} {data.lastName}
                </p>
                <p className="mt-1">
                  {data.position} · {data.currentSchool} · Class of{" "}
                  {data.gradYear}
                </p>
                <p className="mt-1 text-neutral-500">
                  {data.email} · {data.city}{data.stateProvince ? `, ${data.stateProvince}` : ""}{data.country ? `, ${data.country}` : ""}
                </p>
              </div>
              <CheckRow
                checked={data.termsAgreed}
                onChange={(v) => set("termsAgreed", v)}
                title="Terms of Service"
                body="I confirm the information in this application is accurate, and I agree to CPR's terms of service. If I am under 18, my parent or guardian has reviewed this application with me."
              />
            </>
          )}

          {error ? (
            <p className="border border-[#CC0000] bg-red-50 px-4 py-3 text-sm text-[#CC0000]">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-between pt-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={back}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900"
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="bg-[#CC0000] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#a80000]"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="bg-[#CC0000] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#a80000] disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit application"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
