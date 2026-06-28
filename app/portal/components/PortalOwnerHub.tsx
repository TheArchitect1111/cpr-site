'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PortalContent, PortalSection } from '@/lib/portal-content';
import './portal-owner-hub.css';

type Tab = 'announcements' | 'sections' | 'content' | 'profiles' | 'amplifi';

type ProfileRow = {
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  status: string;
  gradYear: string;
  position: string;
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'announcements', label: 'Announcements' },
  { id: 'sections', label: 'Sections' },
  { id: 'content', label: 'Content & Images' },
  { id: 'profiles', label: 'Profiles' },
  { id: 'amplifi', label: 'Amplifi' },
];

export default function PortalOwnerHub({
  ownerName,
  content,
  amplifiUrl,
  athleteName,
}: {
  slug: string;
  portalType: 'athlete' | 'parent';
  ownerName: string;
  content: PortalContent;
  amplifiUrl: string;
  athleteName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('announcements');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');

  // ---- Sections ----
  const [sections, setSections] = useState<PortalSection[]>(content.sections);

  const moveSection = (index: number, dir: -1 | 1) => {
    setSections((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  };

  const saveSections = useCallback(async () => {
    setBusy('sections');
    setMessage('');
    try {
      const res = await fetch('/api/portal-admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: sections.map((s, i) => ({ ...s, order: i })) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setMessage('Sections updated.');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save sections.');
    } finally {
      setBusy('');
    }
  }, [sections, router]);

  // ---- Content / hero ----
  const [hero, setHero] = useState(content.hero);

  const uploadImage = async (file: File) => {
    setBusy('upload');
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', 'portal');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setHero((h) => ({ ...h, imageUrl: json.url }));
      setMessage('Image uploaded. Remember to Save.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy('');
    }
  };

  const saveContent = async () => {
    setBusy('content');
    setMessage('');
    try {
      const res = await fetch('/api/portal-admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setMessage('Content saved.');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save content.');
    } finally {
      setBusy('');
    }
  };

  // ---- Announcements ----
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annAudience, setAnnAudience] = useState('All');
  const [annPortal, setAnnPortal] = useState(true);
  const [annEmail, setAnnEmail] = useState(false);
  const [annEmails, setAnnEmails] = useState('');
  const [annPinned, setAnnPinned] = useState(false);
  const [annPublish, setAnnPublish] = useState(true);

  const submitAnnouncement = async () => {
    if (!annTitle.trim() || !annBody.trim()) {
      setMessage('Announcement needs a title and message.');
      return;
    }
    const channels = [annPortal && 'Portal', annEmail && 'Email'].filter(Boolean);
    if (channels.length === 0) {
      setMessage('Pick at least one channel (Portal or Email).');
      return;
    }
    setBusy('announce');
    setMessage('');
    try {
      const res = await fetch('/api/admin/communication/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: annTitle,
          body: annBody,
          audience: annAudience,
          channels,
          recipientEmails: annEmails,
          pinned: annPinned,
          publishNow: annPublish,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not post announcement');
      setMessage(annPublish ? 'Announcement published.' : 'Announcement saved as draft.');
      setAnnTitle('');
      setAnnBody('');
      setAnnEmails('');
      setAnnPinned(false);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not post announcement.');
    } finally {
      setBusy('');
    }
  };

  // ---- Profiles ----
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [profilesLoaded, setProfilesLoaded] = useState(false);
  const [pFirst, setPFirst] = useState('');
  const [pLast, setPLast] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pParentEmail, setPParentEmail] = useState('');
  const [pGrad, setPGrad] = useState('');
  const [pPosition, setPPosition] = useState('');

  const loadProfiles = useCallback(async () => {
    setBusy('profiles-load');
    try {
      const res = await fetch('/api/admin/athletes');
      const json = await res.json();
      if (res.ok) {
        setProfiles(json.athletes || []);
        setProfilesLoaded(true);
      } else {
        setMessage(json.error || 'Could not load profiles.');
      }
    } catch {
      setMessage('Could not load profiles.');
    } finally {
      setBusy('');
    }
  }, []);

  const addProfile = async () => {
    if (!pFirst.trim() || !pLast.trim()) {
      setMessage('First and last name are required.');
      return;
    }
    setBusy('profile-add');
    setMessage('');
    try {
      const res = await fetch('/api/admin/athletes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: pFirst,
          lastName: pLast,
          email: pEmail,
          parentEmail: pParentEmail,
          gradYear: pGrad,
          position: pPosition,
          status: 'Pending',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Create failed');
      setMessage(`Profile created for ${pFirst} ${pLast}.`);
      setPFirst(''); setPLast(''); setPEmail(''); setPParentEmail(''); setPGrad(''); setPPosition('');
      setProfilesLoaded(false);
      void loadProfiles();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not create profile.');
    } finally {
      setBusy('');
    }
  };

  const deleteProfile = async (p: ProfileRow) => {
    if (!window.confirm(`Remove ${p.firstName} ${p.lastName}'s public profile? The database record is kept.`)) return;
    setBusy(`profile-del-${p.id}`);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/athletes/${p.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');
      setProfiles((rows) => rows.filter((r) => r.id !== p.id));
      setMessage(`${p.firstName} ${p.lastName} removed from the public portal.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not delete profile.');
    } finally {
      setBusy('');
    }
  };

  // ---- Amplifi ----
  const shareText =
    `${athleteName || 'Our athlete'} is on the path to the next level with CPR Global Prospects. ` +
    `Follow the journey and see what's possible. #CanadianProspects #Recruiting #Basketball`;

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setMessage('Share text copied.');
    } catch {
      setMessage('Copy failed — select and copy manually.');
    }
  };

  return (
    <>
      <button
        type="button"
        className={`owner-fab${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="owner-fab-dot" aria-hidden="true" />
        {open ? 'Close Owner Tools' : 'Owner Tools'}
      </button>

      {open && (
        <div className="owner-panel" role="dialog" aria-label="Portal owner tools">
          <div className="owner-head">
            <div>
              <p className="owner-eyebrow">Owner Mode</p>
              <h2 className="owner-title">Update Hub</h2>
              <p className="owner-sub">Signed in as {ownerName}. Only you can see these controls.</p>
            </div>
            <button type="button" className="owner-x" onClick={() => setOpen(false)} aria-label="Close">&#10005;</button>
          </div>

          <div className="owner-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`owner-tab${tab === t.id ? ' active' : ''}`}
                onClick={() => {
                  setTab(t.id);
                  setMessage('');
                  if (t.id === 'profiles' && !profilesLoaded) void loadProfiles();
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {message && <p className="owner-message">{message}</p>}

          <div className="owner-body">
            {tab === 'announcements' && (
              <div className="owner-fields">
                <label>Title<input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="e.g. Summer showcase dates" /></label>
                <label>Message<textarea value={annBody} onChange={(e) => setAnnBody(e.target.value)} rows={4} placeholder="What do families need to know?" /></label>
                <label>Audience
                  <select value={annAudience} onChange={(e) => setAnnAudience(e.target.value)}>
                    {['All', 'Families', 'Athletes', 'Parents'].map((a) => <option key={a}>{a}</option>)}
                  </select>
                </label>
                <div className="owner-checks">
                  <label className="owner-check"><input type="checkbox" checked={annPortal} onChange={(e) => setAnnPortal(e.target.checked)} /> Portal</label>
                  <label className="owner-check"><input type="checkbox" checked={annEmail} onChange={(e) => setAnnEmail(e.target.checked)} /> Email</label>
                  <label className="owner-check"><input type="checkbox" checked={annPinned} onChange={(e) => setAnnPinned(e.target.checked)} /> Pin</label>
                  <label className="owner-check"><input type="checkbox" checked={annPublish} onChange={(e) => setAnnPublish(e.target.checked)} /> Publish now</label>
                </div>
                {annEmail && (
                  <label>Recipient emails (comma or newline separated)
                    <textarea value={annEmails} onChange={(e) => setAnnEmails(e.target.value)} rows={2} placeholder="parent@example.com, coach@example.com" />
                  </label>
                )}
                <button className="owner-primary" onClick={submitAnnouncement} disabled={busy === 'announce'}>
                  {busy === 'announce' ? 'Posting...' : annPublish ? 'Publish Announcement' : 'Save Draft'}
                </button>
              </div>
            )}

            {tab === 'sections' && (
              <div className="owner-sections">
                <p className="owner-hint">Show or hide, rename, and reorder the sections families see on the portal home.</p>
                <ul className="owner-section-list">
                  {sections.map((s, i) => (
                    <li key={s.id} className={s.hidden ? 'is-hidden' : ''}>
                      <div className="owner-section-order">
                        <button type="button" onClick={() => moveSection(i, -1)} disabled={i === 0} aria-label="Move up">&#9650;</button>
                        <button type="button" onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1} aria-label="Move down">&#9660;</button>
                      </div>
                      <input
                        value={s.label}
                        onChange={(e) => setSections((prev) => prev.map((x) => x.id === s.id ? { ...x, label: e.target.value } : x))}
                      />
                      <label className="owner-toggle">
                        <input
                          type="checkbox"
                          checked={!s.hidden}
                          onChange={(e) => setSections((prev) => prev.map((x) => x.id === s.id ? { ...x, hidden: !e.target.checked } : x))}
                        />
                        {s.hidden ? 'Hidden' : 'Visible'}
                      </label>
                    </li>
                  ))}
                </ul>
                <button className="owner-primary" onClick={saveSections} disabled={busy === 'sections'}>
                  {busy === 'sections' ? 'Saving...' : 'Save Sections'}
                </button>
              </div>
            )}

            {tab === 'content' && (
              <div className="owner-fields">
                <p className="owner-hint">Override the welcome headline, subtext, and banner image. Leave blank to use defaults.</p>
                <label>Welcome headline<input value={hero.title} onChange={(e) => setHero((h) => ({ ...h, title: e.target.value }))} placeholder="Default welcome message" /></label>
                <label>Welcome subtext<textarea value={hero.subtitle} onChange={(e) => setHero((h) => ({ ...h, subtitle: e.target.value }))} rows={3} placeholder="Default subtext" /></label>
                <label>Banner image
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadImage(f); }} />
                </label>
                {hero.imageUrl && (
                  <div className="owner-image-preview">
                    <img src={hero.imageUrl} alt="Banner preview" />
                    <button type="button" className="owner-link-btn" onClick={() => setHero((h) => ({ ...h, imageUrl: '' }))}>Remove image</button>
                  </div>
                )}
                <button className="owner-primary" onClick={saveContent} disabled={busy === 'content' || busy === 'upload'}>
                  {busy === 'content' ? 'Saving...' : busy === 'upload' ? 'Uploading...' : 'Save Content'}
                </button>
              </div>
            )}

            {tab === 'profiles' && (
              <div className="owner-profiles">
                <p className="owner-hint">Add a new athlete profile or remove one from the public portal.</p>
                <div className="owner-add-grid">
                  <input value={pFirst} onChange={(e) => setPFirst(e.target.value)} placeholder="First name" />
                  <input value={pLast} onChange={(e) => setPLast(e.target.value)} placeholder="Last name" />
                  <input value={pEmail} onChange={(e) => setPEmail(e.target.value)} placeholder="Athlete email" />
                  <input value={pParentEmail} onChange={(e) => setPParentEmail(e.target.value)} placeholder="Parent email" />
                  <input value={pGrad} onChange={(e) => setPGrad(e.target.value)} placeholder="Grad year" />
                  <input value={pPosition} onChange={(e) => setPPosition(e.target.value)} placeholder="Position" />
                </div>
                <button className="owner-primary" onClick={addProfile} disabled={busy === 'profile-add'}>
                  {busy === 'profile-add' ? 'Adding...' : 'Add Profile'}
                </button>

                <div className="owner-profile-list">
                  {busy === 'profiles-load' && <p className="owner-hint">Loading profiles...</p>}
                  {profilesLoaded && profiles.length === 0 && <p className="owner-hint">No profiles yet.</p>}
                  {profiles.map((p) => (
                    <div key={p.id} className="owner-profile-row">
                      <div>
                        <strong>{p.firstName} {p.lastName}</strong>
                        <span>{[p.position, p.gradYear && `Class of ${p.gradYear}`, p.status].filter(Boolean).join(' · ')}</span>
                      </div>
                      <button
                        type="button"
                        className="owner-danger"
                        onClick={() => deleteProfile(p)}
                        disabled={busy === `profile-del-${p.id}`}
                      >
                        {busy === `profile-del-${p.id}` ? 'Removing...' : 'Delete'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'amplifi' && (
              <div className="owner-fields">
                <p className="owner-hint">Amplifi turns portal moments into shareable social content. Open Amplifi to build a post, then share it out.</p>
                <a className="owner-primary owner-link-cta" href={amplifiUrl}>Open Amplifi</a>
                <label>Ready-to-post caption
                  <textarea readOnly value={shareText} rows={4} />
                </label>
                <button className="owner-secondary" onClick={copyShare}>Copy caption</button>
                <div className="owner-social-row">
                  <a className="owner-social" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">Share to X</a>
                  <a className="owner-social" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}&quote=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">Share to Facebook</a>
                </div>
                <p className="owner-hint owner-note">Note: automatic posting to your connected social accounts can be enabled once account credentials are added. For now this prepares and hands off the post.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
