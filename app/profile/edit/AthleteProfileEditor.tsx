'use client';

import { useState } from 'react';
import type { AthleteAdmin } from '@/lib/athletes';

type Draft = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  position: string;
  gradYear: string;
  school: string;
  location: string;
  gpa: string;
  bio: string;
  strengths: string;
  videoUrl: string;
  photoUrl: string;
  transcriptUrl: string;
  gameplayVideoUrl: string;
};

function initial(a: AthleteAdmin): Draft {
  return {
    firstName: a.firstName,
    lastName: a.lastName,
    email: a.email,
    phone: a.phone,
    parentName: a.parentName,
    parentEmail: a.parentEmail,
    parentPhone: a.parentPhone,
    position: a.position,
    gradYear: a.gradYear,
    school: a.school,
    location: a.location,
    gpa: a.gpa,
    bio: a.bio,
    strengths: a.strengths.join(', '),
    videoUrl: a.videoUrl,
    photoUrl: a.photoUrl,
    transcriptUrl: a.transcriptUrl,
    gameplayVideoUrl: a.gameplayVideoUrl,
  };
}

export default function AthleteProfileEditor({ athlete, token }: { athlete: AthleteAdmin; token: string }) {
  const [draft, setDraft] = useState<Draft>(() => initial(athlete));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [message, setMessage] = useState('');

  const set = (key: keyof Draft, value: string) => {
    setMessage('');
    setDraft(d => ({ ...d, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/athlete-profile/${athlete.id}?token=${encodeURIComponent(token)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setMessage('Profile updates submitted for CPR review.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not submit profile updates.');
    } finally {
      setSaving(false);
    }
  };

  const upload = async (key: keyof Draft, file: File | undefined, kind: string) => {
    if (!file) return;
    setUploading(key);
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('recordId', athlete.id);
      form.append('token', token);
      form.append('kind', kind);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      set(key, data.url);
      setMessage('File uploaded. Submit changes when ready.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not upload file.');
    } finally {
      setUploading('');
    }
  };

  return (
    <section className="edit-card">
      <div className="edit-heading">
        <div>
          <p className="eyebrow">Private athlete profile editor</p>
          <h1 className="display">{athlete.firstName} {athlete.lastName}</h1>
        </div>
        {athlete.slug && <a className="open-profile" href={`/athletes/${athlete.slug}`} target="_blank">Open Public Profile</a>}
      </div>

      {message && <div className="edit-alert">{message}</div>}

      <div className="edit-section">
        <h2 className="display">Contact</h2>
        <div className="edit-grid two">
          <label>First name<input value={draft.firstName} onChange={e => set('firstName', e.target.value)} /></label>
          <label>Last name<input value={draft.lastName} onChange={e => set('lastName', e.target.value)} /></label>
          <label>Email<input type="email" value={draft.email} onChange={e => set('email', e.target.value)} /></label>
          <label>Phone<input value={draft.phone} onChange={e => set('phone', e.target.value)} /></label>
        </div>
      </div>

      <div className="edit-section">
        <h2 className="display">Parent / Guardian</h2>
        <div className="edit-grid three">
          <label>Name<input value={draft.parentName} onChange={e => set('parentName', e.target.value)} /></label>
          <label>Email<input type="email" value={draft.parentEmail} onChange={e => set('parentEmail', e.target.value)} /></label>
          <label>Phone<input value={draft.parentPhone} onChange={e => set('parentPhone', e.target.value)} /></label>
        </div>
      </div>

      <div className="edit-section">
        <h2 className="display">Profile</h2>
        <div className="edit-grid three">
          <label>Position<input value={draft.position} onChange={e => set('position', e.target.value)} /></label>
          <label>Graduation year<input inputMode="numeric" value={draft.gradYear} onChange={e => set('gradYear', e.target.value)} /></label>
          <label>GPA<input inputMode="decimal" value={draft.gpa} onChange={e => set('gpa', e.target.value)} /></label>
          <label>Current school<input value={draft.school} onChange={e => set('school', e.target.value)} /></label>
          <label>City / Province<input value={draft.location} onChange={e => set('location', e.target.value)} /></label>
          <label>Photo URL<input value={draft.photoUrl} onChange={e => set('photoUrl', e.target.value)} /></label>
        </div>
      </div>

      <div className="edit-section">
        <h2 className="display">Bio & Media</h2>
        <label>Bio<textarea rows={5} value={draft.bio} onChange={e => set('bio', e.target.value)} /></label>
        <label>Strengths<textarea rows={3} value={draft.strengths} onChange={e => set('strengths', e.target.value)} /></label>
        <label>Highlight video URL<input value={draft.videoUrl} onChange={e => set('videoUrl', e.target.value)} /></label>
        <label>Gameplay video URL<input value={draft.gameplayVideoUrl} onChange={e => set('gameplayVideoUrl', e.target.value)} /></label>
      </div>

      <div className="edit-section">
        <h2 className="display">Uploads</h2>
        <div className="edit-grid three">
          <label>Profile photo
            <input type="file" accept="image/*" onChange={e => upload('photoUrl', e.target.files?.[0], 'photos')} />
            <span>{uploading === 'photoUrl' ? 'Uploading...' : draft.photoUrl ? 'Photo uploaded/linked' : 'No photo uploaded'}</span>
          </label>
          <label>Transcript / report card
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => upload('transcriptUrl', e.target.files?.[0], 'documents')} />
            <span>{uploading === 'transcriptUrl' ? 'Uploading...' : draft.transcriptUrl ? 'Document uploaded/linked' : 'No document uploaded'}</span>
          </label>
          <label>Game film file
            <input type="file" accept="video/*" onChange={e => upload('gameplayVideoUrl', e.target.files?.[0], 'video')} />
            <span>{uploading === 'gameplayVideoUrl' ? 'Uploading...' : draft.gameplayVideoUrl ? 'Video uploaded/linked' : 'No video uploaded'}</span>
          </label>
        </div>
        <label>Transcript URL<input value={draft.transcriptUrl} onChange={e => set('transcriptUrl', e.target.value)} /></label>
      </div>

      <div className="edit-actions">
        <span>Changes are sent to CPR for review before they publish.</span>
        <button onClick={save} disabled={saving || Boolean(uploading)}>{saving ? 'Submitting...' : 'Submit for Review'}</button>
      </div>
    </section>
  );
}
