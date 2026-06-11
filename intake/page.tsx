'use client';

import { FormEvent, ChangeEvent, useMemo, useState } from 'react';

type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
  textarea?: boolean;
  placeholder?: string;
  maxLength?: number;
};

type Section = {
  key: string;
  title: string;
  eyebrow: string;
  description: string;
  fields: Field[];
};

type PhotoSlot = 'profileImage' | 'actionPhoto1' | 'actionPhoto2' | 'actionPhoto3';

type PhotoPreview = {
  name: string;
  url: string;
};

const sections: Section[] = [
  {
    key: 'athlete',
    eyebrow: 'Section 1',
    title: 'Athlete Information',
    description: 'Core identity and contact details used to create the athlete dashboard and profile header.',
    fields: [
      { name: 'athleteFirstName', label: 'Athlete First Name', required: true },
      { name: 'athleteLastName', label: 'Athlete Last Name', required: true },
      { name: 'preferredName', label: 'Preferred Name' },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
      { name: 'graduationYear', label: 'Graduation Year', required: true, placeholder: '2026' },
      { name: 'gender', label: 'Gender' },
      { name: 'citizenship', label: 'Citizenship' },
      { name: 'city', label: 'City' },
      { name: 'province', label: 'Province' },
      { name: 'postalCode', label: 'Postal Code' },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'mobilePhone', label: 'Mobile Phone', type: 'tel' },
      { name: 'referralSource', label: 'How did you hear about CPR?', options: ['Coach', 'Parent', 'Athlete', 'Social Media', 'Camp / Showcase', 'Referral', 'Other'] },
    ],
  },
  {
    key: 'parent',
    eyebrow: 'Section 2',
    title: 'Parent / Guardian Information',
    description: 'Parent and guardian contacts for CPR communication and confirmation.',
    fields: [
      { name: 'parentOneName', label: 'Parent/Guardian Name #1', required: true },
      { name: 'parentOneRelationship', label: 'Relationship' },
      { name: 'parentOneEmail', label: 'Email', type: 'email' },
      { name: 'parentOnePhone', label: 'Phone', type: 'tel' },
      { name: 'parentTwoName', label: 'Parent/Guardian Name #2' },
      { name: 'parentTwoRelationship', label: 'Relationship' },
      { name: 'parentTwoEmail', label: 'Email', type: 'email' },
      { name: 'parentTwoPhone', label: 'Phone', type: 'tel' },
    ],
  },
  {
    key: 'academics',
    eyebrow: 'Section 3',
    title: 'Academic Information',
    description: 'Academic data used for eligibility, coach review, and the academic profile card.',
    fields: [
      { name: 'currentSchool', label: 'Current School', required: true },
      { name: 'schoolCity', label: 'School City' },
      { name: 'schoolProvince', label: 'School Province' },
      { name: 'gradeLevel', label: 'Grade Level' },
      { name: 'gpaUnweighted', label: 'GPA (Unweighted)' },
      { name: 'gpaWeighted', label: 'GPA (Weighted)' },
      { name: 'academicCoreGpa', label: 'Academic Core GPA' },
      { name: 'satScore', label: 'SAT Score' },
      { name: 'actScore', label: 'ACT Score' },
      { name: 'ncaaEligibilityStatus', label: 'NCAA Eligibility Status', options: ['Registered', 'Not Registered', 'In Progress'] },
      { name: 'intendedMajor', label: 'Intended Major' },
      { name: 'academicHonors', label: 'Academic Honors', textarea: true, placeholder: 'List honors, awards, academic recognition, or leadership roles.' },
    ],
  },
  {
    key: 'athletics',
    eyebrow: 'Section 4',
    title: 'Athletic Information',
    description: 'Measurements, position, and performance details used in the athletic profile panel.',
    fields: [
      { name: 'primarySport', label: 'Primary Sport', placeholder: 'Basketball' },
      { name: 'primaryPosition', label: 'Primary Position' },
      { name: 'secondaryPosition', label: 'Secondary Position' },
      { name: 'height', label: 'Height', placeholder: '6 ft 2 in' },
      { name: 'weight', label: 'Weight', placeholder: '175 lbs' },
      { name: 'wingspan', label: 'Wingspan' },
      { name: 'standingReach', label: 'Standing Reach' },
      { name: 'verticalJump', label: 'Vertical Jump' },
      { name: 'dominantHand', label: 'Dominant Hand', options: ['Right', 'Left', 'Both'] },
      { name: 'jerseyNumber', label: 'Jersey Number' },
      { name: 'classYear', label: 'Class Year' },
      { name: 'athleticHonors', label: 'Athletic Honors', textarea: true, placeholder: 'Awards, stats, camps, showcases, provincial teams, national team experience.' },
    ],
  },
  {
    key: 'team',
    eyebrow: 'Section 5',
    title: 'Team Information',
    description: 'Current team and coach details used in the team card and advisor review.',
    fields: [
      { name: 'currentTeamName', label: 'Current Team Name' },
      { name: 'league', label: 'League' },
      { name: 'headCoachName', label: 'Head Coach Name' },
      { name: 'coachEmail', label: 'Coach Email', type: 'email' },
      { name: 'coachPhone', label: 'Coach Phone', type: 'tel' },
      { name: 'teamWebsite', label: 'Team Website', type: 'url' },
      { name: 'trainerName', label: 'Trainer Name' },
      { name: 'trainerEmail', label: 'Trainer Email', type: 'email' },
      { name: 'trainerPhone', label: 'Trainer Phone', type: 'tel' },
    ],
  },
  {
    key: 'media',
    eyebrow: 'Section 6',
    title: 'Highlight Videos & Media Links',
    description: 'Video links automatically feed the highlight, mixtape, game film, and coach-view sections.',
    fields: [
      { name: 'primaryHighlightVideo', label: 'Primary Highlight Video', type: 'url', placeholder: 'YouTube, Hudl, Vimeo, or Google Drive link' },
      { name: 'fullGameFilmOne', label: 'Full Game Film #1', type: 'url' },
      { name: 'fullGameFilmTwo', label: 'Full Game Film #2', type: 'url' },
      { name: 'fullGameFilmThree', label: 'Full Game Film #3', type: 'url' },
      { name: 'hudlProfile', label: 'Hudl Profile', type: 'url' },
      { name: 'youtubeChannel', label: 'YouTube Channel', type: 'url' },
      { name: 'instagram', label: 'Instagram', type: 'url' },
      { name: 'xTwitter', label: 'X / Twitter', type: 'url' },
      { name: 'tiktok', label: 'TikTok', type: 'url' },
      { name: 'otherRecruitingLink', label: 'Other Recruiting Link', type: 'url' },
      { name: 'additionalVideoNotes', label: 'Additional Video Notes', textarea: true },
    ],
  },
  {
    key: 'documents',
    eyebrow: 'Section 8',
    title: 'Documents',
    description: 'Upload-ready document checklist for transcripts, report cards, awards, and eligibility files.',
    fields: [
      { name: 'transcriptUpload', label: 'Transcript Upload', type: 'file' },
      { name: 'reportCardUpload', label: 'Report Card Upload', type: 'file' },
      { name: 'awardsCertificates', label: 'Awards & Certificates', type: 'file' },
      { name: 'ncaaEligibilityDocuments', label: 'NCAA Eligibility Documents', type: 'file' },
      { name: 'additionalDocuments', label: 'Additional Documents', type: 'file' },
    ],
  },
  {
    key: 'bio',
    eyebrow: 'Section 9',
    title: 'Player Bio',
    description: 'This becomes the athlete bio coaches see on the profile.',
    fields: [
      { name: 'playerBio', label: 'Tell Coaches About Yourself', textarea: true, maxLength: 1000, placeholder: 'What makes you unique? What are your strengths? What are your goals? Why should a coach recruit you?' },
    ],
  },
  {
    key: 'recommendation',
    eyebrow: 'Section 11',
    title: 'Coach Recommendation',
    description: 'Optional recommendation information CPR can use during profile review.',
    fields: [
      { name: 'recommendationCoachName', label: 'Coach Name' },
      { name: 'recommendationTeam', label: 'School / Team' },
      { name: 'recommendationCoachEmail', label: 'Coach Email', type: 'email' },
      { name: 'recommendationText', label: 'Recommendation', textarea: true },
    ],
  },
];

const strengths = [
  'Basketball IQ',
  'Leadership',
  'Playmaking',
  'Court Vision',
  'Defense',
  'Shooting',
  'Rebounding',
  'Transition',
  'Athleticism',
  'Communication',
  'Work Ethic',
  'Coachability',
  'Competitive Drive',
];

const photoSlots: { key: PhotoSlot; label: string; destination: string }[] = [
  { key: 'profileImage', label: 'Profile Image', destination: 'Main hero image' },
  { key: 'actionPhoto1', label: 'Action Photo #1', destination: 'Player Photos Gallery' },
  { key: 'actionPhoto2', label: 'Action Photo #2', destination: 'Player Photos Gallery' },
  { key: 'actionPhoto3', label: 'Action Photo #3', destination: 'Player Photos Gallery' },
];

const initialPhotos: Record<PhotoSlot, PhotoPreview | null> = {
  profileImage: null,
  actionPhoto1: null,
  actionPhoto2: null,
  actionPhoto3: null,
};

export default function IntakePage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Record<PhotoSlot, PhotoPreview | null>>(initialPhotos);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const profileId = useMemo(() => {
    const last = (form.athleteLastName || 'ATH').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');
    const grad = (form.graduationYear || '2026').slice(-2);
    return `CPR-${last}-${grad}-${String(Math.max(1, Object.keys(form).length)).padStart(3, '0')}`;
  }, [form]);

  const completion = useMemo(() => {
    const required = ['athleteFirstName', 'athleteLastName', 'dateOfBirth', 'graduationYear', 'email', 'parentOneName', 'currentSchool'];
    const requiredDone = required.filter((key) => Boolean(form[key])).length;
    const mediaDone = ['primaryHighlightVideo', 'fullGameFilmOne', 'hudlProfile'].filter((key) => Boolean(form[key])).length;
    const photoDone = Object.values(photos).filter(Boolean).length;
    return Math.min(100, Math.round(((requiredDone / required.length) * 55) + (mediaDone * 7) + (photoDone * 6) + (selectedStrengths.length ? 10 : 0)));
  }, [form, photos, selectedStrengths]);

  function updateField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handlePhoto(slot: PhotoSlot, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload JPG or PNG images only for photo slots.');
      setStatus('error');
      return;
    }
    setPhotos((current) => ({
      ...current,
      [slot]: { name: file.name, url: URL.createObjectURL(file) },
    }));
  }

  function toggleStrength(strength: string) {
    setSelectedStrengths((current) => {
      if (current.includes(strength)) return current.filter((item) => item !== strength);
      if (current.length >= 10) return current;
      return [...current, strength];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setMessage('');

    const payload = {
      ...form,
      profileId,
      profileCompletion: completion,
      strengthTags: selectedStrengths,
      imagePlacement: Object.fromEntries(Object.entries(photos).map(([slot, photo]) => [slot, photo?.name || ''])),
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Submission failed');
      setStatus('success');
      setMessage(data?.message || 'Your CPR intake has been received. Confirmation details have been sent.');
    } catch (error) {
      const fallback = error instanceof Error ? error.message : 'Something went wrong.';
      setStatus('error');
      setMessage(fallback);
    }
  }

  return (
    <main className="intake-page">
      <style>{styles}</style>
      <header className="intake-header">
        <a href="/" className="back-link">← Back to CPR</a>
        <div className="brand-row">
          <img src="/cpr-logo.png" alt="Canadian Prospects Recruitment" className="brand-logo" />
          <div>
            <p className="brand-kicker">Canadian Prospects Recruitment</p>
            <h1>Athlete Intake Form</h1>
            <p className="header-copy">One submission builds the athlete record, profile draft, dashboard checklist, media map, and confirmation workflow.</p>
          </div>
        </div>
      </header>

      <form className="intake-shell" onSubmit={handleSubmit}>
        <aside className="progress-card">
          <p className="mini-label">Profile Build Preview</p>
          <div className="profile-card">
            <div className="hero-preview">
              {photos.profileImage ? <img src={photos.profileImage.url} alt="Profile preview" /> : <span>Profile Image</span>}
            </div>
            <h2>{form.athleteFirstName || 'Athlete'} {form.athleteLastName || 'Name'}</h2>
            <p>{form.primaryPosition || 'Position'} · {form.height || 'Height'} · Class of {form.graduationYear || 'Year'}</p>
            <div className="meter"><span style={{ width: `${completion}%` }} /></div>
            <strong>{completion}% Complete</strong>
            <small>{profileId}</small>
          </div>
          <div className="preview-grid">
            {photoSlots.slice(1).map((slot) => (
              <div className="thumb" key={slot.key}>
                {photos[slot.key] ? <img src={photos[slot.key]!.url} alt={slot.label} /> : <span>{slot.label}</span>}
              </div>
            ))}
          </div>
          <p className="preview-note">Image limit: 4 total. Each upload is mapped to a specific profile location.</p>
        </aside>

        <section className="form-stack">
          {sections.map((section) => (
            <article className="form-section" key={section.key}>
              <p className="eyebrow">{section.eyebrow}</p>
              <h2>{section.title}</h2>
              <p className="section-copy">{section.description}</p>
              <div className="field-grid">
                {section.fields.map((field) => (
                  <label className={field.textarea ? 'field full' : 'field'} key={field.name}>
                    <span>{field.label}{field.required ? <b> *</b> : null}</span>
                    {field.options ? (
                      <select required={field.required} value={form[field.name] || ''} onChange={(e) => updateField(field.name, e.target.value)}>
                        <option value="">Select one</option>
                        {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : field.textarea ? (
                      <textarea required={field.required} maxLength={field.maxLength} placeholder={field.placeholder} value={form[field.name] || ''} onChange={(e) => updateField(field.name, e.target.value)} />
                    ) : field.type === 'file' ? (
                      <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => updateField(field.name, e.target.files?.[0]?.name || '')} />
                    ) : (
                      <input required={field.required} type={field.type || 'text'} placeholder={field.placeholder} value={form[field.name] || ''} onChange={(e) => updateField(field.name, e.target.value)} />
                    )}
                  </label>
                ))}
              </div>
            </article>
          ))}

          <article className="form-section">
            <p className="eyebrow">Section 7</p>
            <h2>Image Placement System</h2>
            <p className="section-copy">Upload up to four images and choose exactly where each image appears on the generated athlete profile.</p>
            <div className="photo-upload-grid">
              {photoSlots.map((slot) => (
                <label className="photo-field" key={slot.key}>
                  <span>{slot.label}</span>
                  <small>Used for: {slot.destination}</small>
                  <input type="file" accept="image/png,image/jpeg" onChange={(event) => handlePhoto(slot.key, event)} />
                  {photos[slot.key] ? <em>{photos[slot.key]!.name}</em> : <em>No image selected</em>}
                </label>
              ))}
            </div>
          </article>

          <article className="form-section">
            <p className="eyebrow">Section 10</p>
            <h2>Strength Tags</h2>
            <p className="section-copy">Select up to 10 tags that should appear on the athlete profile.</p>
            <div className="tag-grid">
              {strengths.map((strength) => (
                <button className={selectedStrengths.includes(strength) ? 'tag selected' : 'tag'} type="button" key={strength} onClick={() => toggleStrength(strength)}>
                  {strength}
                </button>
              ))}
            </div>
            <p className="preview-note">Selected: {selectedStrengths.length}/10</p>
          </article>

          <article className="form-section agreement-card">
            <p className="eyebrow">Section 12</p>
            <h2>CPR Agreement</h2>
            <label className="check-row">
              <input type="checkbox" required />
              <span>I authorize Canadian Prospects Recruitment to build my recruiting profile, display approved information, share my profile with coaches, and use submitted photos and videos.</span>
            </label>
            <div className="field-grid">
              <label className="field"><span>Athlete Signature *</span><input required value={form.athleteSignature || ''} onChange={(e) => updateField('athleteSignature', e.target.value)} /></label>
              <label className="field"><span>Parent Signature *</span><input required value={form.parentSignature || ''} onChange={(e) => updateField('parentSignature', e.target.value)} /></label>
              <label className="field"><span>Date *</span><input required type="date" value={form.signatureDate || ''} onChange={(e) => updateField('signatureDate', e.target.value)} /></label>
            </div>
          </article>

          <div className="submit-bar">
            <div>
              <strong>Ready to generate the CPR intake record?</strong>
              <p>This creates the submission payload for Airtable, profile generation, PDF generation, and confirmation emails.</p>
            </div>
            <button type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? 'Submitting...' : 'Submit Intake'}</button>
          </div>

          {message ? <div className={status === 'success' ? 'notice success' : 'notice error'}>{message}</div> : null}
        </section>
      </form>
    </main>
  );
}

const styles = `
  :root { --red:#d71920; --dark:#050505; --ink:#111; --muted:#60646c; --line:#e6e6e6; --soft:#f8f8f8; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #f4f4f4; color: var(--ink); font-family: Inter, Arial, sans-serif; }
  .intake-page { min-height: 100vh; }
  .intake-header { background: linear-gradient(135deg, #050505, #151515); color: white; padding: 28px clamp(18px, 4vw, 56px) 36px; border-bottom: 4px solid var(--red); }
  .back-link { color: white; text-decoration: none; font-weight: 700; opacity: .85; }
  .brand-row { display: flex; align-items: center; gap: 22px; max-width: 1180px; margin: 28px auto 0; }
  .brand-logo { width: 86px; height: 86px; object-fit: contain; }
  .brand-kicker, .eyebrow, .mini-label { color: var(--red); font-weight: 900; text-transform: uppercase; letter-spacing: .12em; font-size: 12px; margin: 0 0 8px; }
  h1, h2 { font-family: 'Barlow Condensed', Impact, sans-serif; text-transform: uppercase; letter-spacing: .03em; margin: 0; }
  h1 { font-size: clamp(42px, 7vw, 76px); line-height: .92; }
  h2 { font-size: 32px; }
  .header-copy { max-width: 760px; color: #d9d9d9; font-size: 17px; line-height: 1.6; }
  .intake-shell { display: grid; grid-template-columns: 330px minmax(0, 1fr); gap: 24px; max-width: 1280px; margin: 28px auto; padding: 0 18px 60px; align-items: start; }
  .progress-card { position: sticky; top: 18px; background: #080808; color: white; border-radius: 18px; padding: 18px; box-shadow: 0 18px 45px rgba(0,0,0,.16); }
  .profile-card { background: #fff; color: #111; border-radius: 14px; padding: 14px; }
  .hero-preview { height: 220px; border-radius: 12px; background: #f0f0f0; border: 1px dashed #c9c9c9; display: grid; place-items: center; overflow: hidden; color: #777; font-weight: 800; }
  .hero-preview img, .thumb img { width: 100%; height: 100%; object-fit: cover; }
  .profile-card h2 { margin-top: 14px; font-size: 30px; }
  .profile-card p { color: #555; margin: 4px 0 14px; }
  .meter { height: 12px; background: #e7e7e7; border-radius: 20px; overflow: hidden; margin-bottom: 8px; }
  .meter span { display: block; height: 100%; background: linear-gradient(90deg, #1d8f3a, #62c96b); }
  .profile-card small { display: block; color: #777; margin-top: 8px; }
  .preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
  .thumb { height: 84px; border-radius: 12px; border: 1px dashed rgba(255,255,255,.45); display: grid; place-items: center; overflow: hidden; font-size: 11px; text-align: center; color: #ddd; padding: 8px; }
  .preview-note { color: #777; line-height: 1.5; font-size: 13px; }
  .progress-card .preview-note { color: #d5d5d5; }
  .form-stack { display: grid; gap: 18px; }
  .form-section { background: white; border: 1px solid var(--line); border-radius: 18px; padding: clamp(18px, 3vw, 30px); box-shadow: 0 12px 30px rgba(0,0,0,.04); }
  .section-copy { color: var(--muted); line-height: 1.6; margin: 8px 0 20px; }
  .field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .field { display: grid; gap: 7px; font-weight: 800; font-size: 13px; }
  .field.full { grid-column: 1 / -1; }
  .field b { color: var(--red); }
  input, select, textarea { width: 100%; border: 1px solid #d8d8d8; border-radius: 10px; padding: 12px 13px; font: inherit; background: #fff; color: #111; }
  textarea { min-height: 132px; resize: vertical; }
  input:focus, select:focus, textarea:focus { outline: 2px solid rgba(215,25,32,.22); border-color: var(--red); }
  .photo-upload-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
  .photo-field { border: 1px solid #ddd; background: #fafafa; border-radius: 14px; padding: 14px; display: grid; gap: 8px; }
  .photo-field span { font-weight: 900; }
  .photo-field small { color: #666; line-height: 1.4; }
  .photo-field em { font-size: 12px; color: #777; font-style: normal; overflow-wrap: anywhere; }
  .tag-grid { display: flex; flex-wrap: wrap; gap: 10px; }
  .tag { border: 1px solid #ddd; background: #fff; color: #222; border-radius: 999px; padding: 10px 14px; font-weight: 800; cursor: pointer; }
  .tag.selected { background: #e4f5e5; color: #1f7d35; border-color: #bfe3c2; }
  .check-row { display: flex; gap: 12px; color: #333; line-height: 1.6; margin: 10px 0 18px; }
  .check-row input { width: auto; margin-top: 5px; }
  .agreement-card { border: 2px solid #111; }
  .submit-bar { background: #080808; color: white; border-radius: 18px; padding: 20px; display: flex; gap: 18px; align-items: center; justify-content: space-between; }
  .submit-bar p { color: #ccc; margin: 5px 0 0; }
  .submit-bar button { background: var(--red); color: white; border: 0; border-radius: 10px; padding: 14px 22px; font-weight: 900; cursor: pointer; min-width: 170px; }
  .submit-bar button:disabled { opacity: .6; cursor: not-allowed; }
  .notice { border-radius: 12px; padding: 16px; font-weight: 800; }
  .notice.success { background: #e8f8ec; color: #176b2a; border: 1px solid #b9e6c2; }
  .notice.error { background: #fff0f0; color: #a40000; border: 1px solid #ffc3c3; }
  @media (max-width: 980px) { .intake-shell { grid-template-columns: 1fr; } .progress-card { position: static; } .photo-upload-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 640px) { .brand-row { align-items: flex-start; } .brand-logo { width: 64px; height: 64px; } .field-grid, .photo-upload-grid { grid-template-columns: 1fr; } .submit-bar { display: grid; } }
`;
