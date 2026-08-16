'use client';

import { useState } from 'react';
import type { AthleteAdmin } from '@/lib/athletes';
import { hasAthletePhoto } from '@/lib/athlete-photo';
import MediaLibraryPicker from './landing/MediaLibraryPicker';

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
  gpa: string;
  school: string;
  location: string;
  bio: string;
  strengths: string;
  videoUrl: string;
  gameplayVideoUrl: string;
  photoUrl: string;
};

function toDraft(athlete: AthleteAdmin): Draft {
  return {
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    email: athlete.email,
    phone: athlete.phone,
    parentName: athlete.parentName,
    parentEmail: athlete.parentEmail,
    parentPhone: athlete.parentPhone,
    position: athlete.position,
    gradYear: athlete.gradYear,
    gpa: athlete.gpa,
    school: athlete.school,
    location: athlete.location,
    bio: athlete.bio,
    strengths: athlete.strengths.join(', '),
    videoUrl: athlete.videoUrl,
    gameplayVideoUrl: athlete.gameplayVideoUrl,
    photoUrl: hasAthletePhoto(athlete.photoUrl) ? athlete.photoUrl : '',
  };
}

export default function AdminRegistrantProfileEditor({
  athlete,
  onCancel,
  onSaved,
}: {
  athlete: AthleteAdmin;
  onCancel: () => void;
  onSaved: (next: Partial<AthleteAdmin> & { photoUrl: string }) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(athlete));
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const set = (key: keyof Draft, value: string) => {
    setMessage('');
    setDraft((current) => ({ ...current, [key]: value }));
  };

  async function uploadPhoto(file?: File) {
    if (!file) return;
    setBusy('upload');
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('kind', 'admin-player-profile');
      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: form });
      const upload = await uploadResponse.json() as { url?: string; error?: string };
      if (!uploadResponse.ok || !upload.url) throw new Error(upload.error || 'Photo upload failed.');
      set('photoUrl', upload.url);
      setMessage('Photo uploaded. Save profile to publish it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Photo upload failed.');
    } finally {
      setBusy('');
    }
  }

  async function save() {
    setBusy('save');
    setMessage('');
    try {
      const response = await fetch(`/api/admin/athletes/${encodeURIComponent(athlete.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const result = await response.json() as { error?: string; athlete?: AthleteAdmin };
      if (!response.ok) throw new Error(result.error || 'Profile could not be saved.');
      if (!result.athlete) throw new Error('Profile save could not be verified.');
      onSaved({
        ...result.athlete,
        photoUrl: result.athlete.photoUrl,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Profile could not be saved.');
    } finally {
      setBusy('');
    }
  }

  const working = Boolean(busy);

  return (
    <div className="registrant-edit-panel">
      <div className="registrant-edit-heading">
        <strong>Edit profile — {athlete.firstName} {athlete.lastName}</strong>
        <span>Choose the player photo from the same CPR photo gallery used by the website editor, then save the profile.</span>
      </div>

      <div className="registrant-photo-row">
        {hasAthletePhoto(draft.photoUrl) ? (
          <img className="player-thumb player-thumb-lg" src={draft.photoUrl} alt="" />
        ) : (
          <div className="player-thumb-empty player-thumb-lg">No photo</div>
        )}
        <div className="action-row">
          <MediaLibraryPicker
            label={draft.photoUrl ? 'Replace from photo gallery' : 'Pick from photo gallery'}
            onPick={(url) => {
              set('photoUrl', url);
              setMessage('Photo selected from the gallery. Save profile to publish it.');
            }}
          />
          <label className="ghost" style={{ cursor: working ? 'wait' : 'pointer' }}>
            {busy === 'upload' ? 'Uploading…' : 'Upload new photo'}
            <input
              type="file"
              accept="image/*"
              disabled={working}
              style={{ display: 'none' }}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                void uploadPhoto(file);
              }}
            />
          </label>
          {draft.photoUrl ? (
            <button type="button" className="ghost" disabled={working} onClick={() => set('photoUrl', '')}>
              Remove photo
            </button>
          ) : null}
        </div>
      </div>

      <div className="registrant-edit-grid">
        <label>First name<input value={draft.firstName} onChange={(e) => set('firstName', e.target.value)} /></label>
        <label>Last name<input value={draft.lastName} onChange={(e) => set('lastName', e.target.value)} /></label>
        <label>Email<input type="email" value={draft.email} onChange={(e) => set('email', e.target.value)} /></label>
        <label>Phone<input value={draft.phone} onChange={(e) => set('phone', e.target.value)} /></label>
        <label>Parent name<input value={draft.parentName} onChange={(e) => set('parentName', e.target.value)} /></label>
        <label>Parent email<input type="email" value={draft.parentEmail} onChange={(e) => set('parentEmail', e.target.value)} /></label>
        <label>Parent phone<input value={draft.parentPhone} onChange={(e) => set('parentPhone', e.target.value)} /></label>
        <label>Position<input value={draft.position} onChange={(e) => set('position', e.target.value)} /></label>
        <label>Grad year<input value={draft.gradYear} onChange={(e) => set('gradYear', e.target.value)} /></label>
        <label>GPA<input value={draft.gpa} onChange={(e) => set('gpa', e.target.value)} /></label>
        <label>School<input value={draft.school} onChange={(e) => set('school', e.target.value)} /></label>
        <label>City / Province<input value={draft.location} onChange={(e) => set('location', e.target.value)} /></label>
        <label className="span-2">Highlight video URL<input value={draft.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} /></label>
        <label className="span-2">Gameplay video URL<input value={draft.gameplayVideoUrl} onChange={(e) => set('gameplayVideoUrl', e.target.value)} /></label>
        <label className="span-3">Bio<textarea rows={4} value={draft.bio} onChange={(e) => set('bio', e.target.value)} /></label>
        <label className="span-3">Strengths<textarea rows={2} value={draft.strengths} onChange={(e) => set('strengths', e.target.value)} /></label>
      </div>

      {message ? <p className="pm-message" role="status">{message}</p> : null}

      <div className="action-row">
        <button type="button" disabled={working} onClick={() => void save()}>
          {busy === 'save' ? 'Saving…' : 'Save profile'}
        </button>
        <button type="button" className="ghost" disabled={working} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
