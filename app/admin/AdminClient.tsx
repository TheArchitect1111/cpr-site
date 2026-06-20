'use client';
import { useMemo, useState } from 'react';
import type { Outreach } from '@/lib/outreach';
import type { AthleteAdmin } from '@/lib/athletes';
import type { CoachContact } from '@/lib/coaches';

const RESPONSES = ['All Responses', 'Interested', 'Maybe', 'Not Interested', 'Follow Up', 'No Response'];
const STATUSES = ['All Statuses', 'Active', 'Coach-only', 'Draft', 'Private', 'Pending', 'Closed', 'Waiting', 'Archived'];
const PROFILE_STATUSES = ['Pending', 'Active', 'Coach-only', 'Draft', 'Private', 'Waiting', 'Closed', 'Archived'];
const OUTREACH_TEMPLATES = {
  initial: {
    name: 'Initial Outreach',
    subject: '{athleteName} - Canadian Prospects recruiting profile',
    message: 'Canadian Prospects Recruitment is sharing {athleteName}\'s private recruiting profile for your review{schoolText}. If you would like transcripts, full game film, or an introduction, reply to this email and we will coordinate the next step.',
  },
  follow_up: {
    name: 'Follow Up',
    subject: 'Follow up: {athleteName} recruiting profile',
    message: 'Following up on {athleteName}\'s recruiting profile. CPR can provide additional film, academic details, and a direct introduction if this student-athlete fits your recruiting board.',
  },
  tournament: {
    name: 'Tournament Update',
    subject: 'Tournament update: {athleteName}',
    message: '{athleteName} has new recruiting material available after recent competition. Please review the private CPR profile and reply if you would like the latest film or schedule details.',
  },
};
type TemplateKey = keyof typeof OUTREACH_TEMPLATES;
const cls = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '-');
type PlayerDraft = Partial<AthleteAdmin & { strengthsText: string }>;
type OutreachDraft = Partial<Outreach>;
type CoachDraft = Partial<CoachContact>;
type CsvRow = Record<string, string | number | boolean | undefined>;
type SystemCheck = { name: string; ok: boolean; detail: string };

const csvEscape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

function downloadCsv(filename: string, rows: CsvRow[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(csvEscape).join(','),
    ...rows.map(row => headers.map(header => csvEscape(row[header])).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminClient({ rows, players, coaches }: { rows: Outreach[]; players: AthleteAdmin[]; coaches: CoachContact[] }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(STATUSES[0]);
  const [resp, setResp] = useState(RESPONSES[0]);
  const [sel, setSel] = useState<Outreach | null>(null);
  const [outreachRows, setOutreachRows] = useState(rows);
  const [editingOutreach, setEditingOutreach] = useState('');
  const [outreachDraft, setOutreachDraft] = useState<Record<string, OutreachDraft>>({});
  const [showCreateOutreach, setShowCreateOutreach] = useState(false);
  const [createOutreachDraft, setCreateOutreachDraft] = useState<OutreachDraft>({ response: 'No Response', status: 'Waiting' });
  const [busyOutreach, setBusyOutreach] = useState('');
  const [outreachMessage, setOutreachMessage] = useState('');
  const [selectedOutreach, setSelectedOutreach] = useState<string[]>([]);
  const [outreachTemplate, setOutreachTemplate] = useState<TemplateKey>('initial');
  const [outreachSubject, setOutreachSubject] = useState(OUTREACH_TEMPLATES.initial.subject);
  const [outreachBody, setOutreachBody] = useState(OUTREACH_TEMPLATES.initial.message);
  const [playerRows, setPlayerRows] = useState(players);
  const [coachRows, setCoachRows] = useState(coaches);
  const [coachQ, setCoachQ] = useState('');
  const [editingCoach, setEditingCoach] = useState('');
  const [coachDraft, setCoachDraft] = useState<Record<string, CoachDraft>>({});
  const [showCreateCoach, setShowCreateCoach] = useState(false);
  const [createCoachDraft, setCreateCoachDraft] = useState<CoachDraft>({ sport: 'Basketball', status: 'Active' });
  const [busyCoach, setBusyCoach] = useState('');
  const [coachMessage, setCoachMessage] = useState('');
  const [playerQ, setPlayerQ] = useState('');
  const [playerStatus, setPlayerStatus] = useState('All Statuses');
  const [playerClass, setPlayerClass] = useState('All Classes');
  const [playerPosition, setPlayerPosition] = useState('All Positions');
  const [admissionFilter, setAdmissionFilter] = useState('Needs Action');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [detailPlayer, setDetailPlayer] = useState<AthleteAdmin | null>(null);
  const [draft, setDraft] = useState<Record<string, PlayerDraft>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [createDraft, setCreateDraft] = useState<PlayerDraft>({ status: 'Pending' });
  const [busyPlayer, setBusyPlayer] = useState('');
  const [playerMessage, setPlayerMessage] = useState('');
  const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([]);
  const [systemMessage, setSystemMessage] = useState('');
  const [systemBusy, setSystemBusy] = useState(false);

  const filtered = useMemo(() => outreachRows.filter(r => {
    const text = `${r.school} ${r.coach} ${r.prospect}`.toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (status !== STATUSES[0] && r.status !== status) return false;
    if (resp !== RESPONSES[0] && r.response !== resp) return false;
    return true;
  }), [outreachRows, q, status, resp]);
  const selectedRows = useMemo(() => outreachRows.filter(r => selectedOutreach.includes(r.id)), [outreachRows, selectedOutreach]);

  const sent = outreachRows.length;
  const opened = outreachRows.filter(r => r.opened).length;
  const viewed = outreachRows.filter(r => r.viewed).length;
  const responded = outreachRows.filter(r => r.response && r.response !== 'No Response').length;
  const interested = outreachRows.filter(r => r.response === 'Interested').length;
  const followUps = outreachRows.filter(r => r.response === 'Follow Up').length;
  const pct = (n: number) => (sent ? Math.round((n / sent) * 100) : 0);

  const breakdown = ['Interested', 'Maybe', 'Not Interested', 'No Response'].map(k => ({
    k, n: outreachRows.filter(r => (k === 'No Response' ? !r.response || r.response === 'No Response' || r.response === 'Follow Up' && false : r.response === k)).length,
  }));
  const bdTotal = breakdown.reduce((a, b) => a + b.n, 0) || 1;
  const colors: Record<string, string> = { Interested: '#2BA84A', Maybe: '#E8B931', 'Not Interested': '#C8102E', 'No Response': '#9A9A9A' };

  // donut segments
  const segs = (() => {
    const out: { k: string; n: number; start: number; end: number }[] = [];
    breakdown.reduce((acc, b) => { out.push({ ...b, start: acc / bdTotal, end: (acc + b.n) / bdTotal }); return acc + b.n; }, 0);
    return out;
  })();

  // responses over time (by date)
  const byDate = useMemo(() => {
    const m = new Map<string, number>();
    outreachRows.forEach(r => { if (r.dateSent) m.set(r.dateSent, (m.get(r.dateSent) || 0) + (r.response && r.response !== 'No Response' ? 1 : 0)); });
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [outreachRows]);
  const series = useMemo(() => {
    const out: { d: string; v: number }[] = [];
    byDate.reduce((acc, [d, n]) => { const v = acc + n; out.push({ d, v }); return v; }, 0);
    return out;
  }, [byDate]);
  const maxV = Math.max(1, ...series.map(p => p.v));

  const topSchools = useMemo(() => {
    const m = new Map<string, number>();
    outreachRows.forEach(r => m.set(r.school, (m.get(r.school) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [outreachRows]);

  const stats = [
    { k: 'OUTREACH SENT', v: sent, s: 'All time' },
    { k: 'OPENED', v: opened, s: `${pct(opened)}%` },
    { k: 'VIEWED PROFILE', v: viewed, s: `${pct(viewed)}%` },
    { k: 'RESPONSES', v: responded, s: `${pct(responded)}%` },
    { k: 'INTERESTED', v: interested, s: `${pct(interested)}%` },
    { k: 'FOLLOW UPS', v: followUps, s: 'Pending' },
  ];
  const recentActivity = useMemo(() => [
    ...playerRows.flatMap(p => p.activity.map(item => ({
      ...item,
      label: `${p.firstName} ${p.lastName}`.trim() || 'Player profile',
      type: 'Player',
    }))),
    ...outreachRows.flatMap(r => r.activity.map(item => ({
      ...item,
      label: [r.school, r.coach].filter(Boolean).join(' / ') || 'Coach outreach',
      type: 'Outreach',
    }))),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10), [playerRows, outreachRows]);

  const playerClasses = useMemo(() => ['All Classes', ...Array.from(new Set(playerRows.map(p => p.gradYear).filter(Boolean))).sort()], [playerRows]);
  const playerPositions = useMemo(() => ['All Positions', ...Array.from(new Set(playerRows.map(p => p.position).filter(Boolean))).sort()], [playerRows]);
  const filteredCoachRows = useMemo(() => coachRows.filter(c => {
    const haystack = `${c.school} ${c.coach} ${c.coachEmail} ${c.coachRole} ${c.conference} ${c.region} ${c.status}`.toLowerCase();
    return !coachQ || haystack.includes(coachQ.toLowerCase());
  }), [coachRows, coachQ]);
  const filteredPlayerRows = useMemo(() => playerRows.filter(p => {
    const haystack = `${p.firstName} ${p.lastName} ${p.email} ${p.parentName} ${p.parentEmail} ${p.position} ${p.school} ${p.location} ${p.gradYear} ${p.status}`.toLowerCase();
    if (playerQ && !haystack.includes(playerQ.toLowerCase())) return false;
    if (playerStatus !== 'All Statuses' && p.status !== playerStatus) return false;
    if (playerClass !== 'All Classes' && p.gradYear !== playerClass) return false;
    if (playerPosition !== 'All Positions' && p.position !== playerPosition) return false;
    if (pendingOnly && p.pendingUpdates.length === 0) return false;
    return true;
  }), [playerRows, playerQ, playerStatus, playerClass, playerPosition, pendingOnly]);
  const admissionRows = useMemo(() => playerRows.filter(p => {
    const needsAgreement = !p.termsAgreed && !p.agreementSubmitted;
    const missingFiles = !p.transcriptUrl || !p.gameplayVideoUrl;
    const unpaid = !p.feeStage1 && !p.feeStage2 && !p.feeStage3;
    if (admissionFilter === 'Needs Agreement') return needsAgreement;
    if (admissionFilter === 'Needs Files') return missingFiles;
    if (admissionFilter === 'Payment Due') return unpaid;
    if (admissionFilter === 'Ready') return !needsAgreement && !missingFiles && p.feeStage1;
    if (admissionFilter === 'Needs Action') return needsAgreement || missingFiles || unpaid || p.pendingUpdates.length > 0;
    return true;
  }), [playerRows, admissionFilter]);

  const admissionStats = {
    applicants: playerRows.length,
    agreements: playerRows.filter(p => p.termsAgreed || p.agreementSubmitted).length,
    filesReady: playerRows.filter(p => p.transcriptUrl && p.gameplayVideoUrl).length,
    stage1Paid: playerRows.filter(p => p.feeStage1).length,
  };

  const startEdit = (p: AthleteAdmin) => {
    setPlayerMessage('');
    setEditing(p.id);
    setDraft(d => ({ ...d, [p.id]: playerDraftFrom(p) }));
  };

  const setPlayerField = (id: string, key: keyof AthleteAdmin | 'strengthsText', value: string | boolean) => {
    setDraft(d => ({ ...d, [id]: { ...d[id], [key]: value } }));
  };

  const playerDraftFrom = (p: AthleteAdmin): PlayerDraft => ({
    ...p,
    strengthsText: p.strengths.join(', '),
  });

  const playerPayload = (d: PlayerDraft) => ({
    slug: d.slug,
    firstName: d.firstName,
    lastName: d.lastName,
    email: d.email,
    phone: d.phone,
    parentName: d.parentName,
    parentEmail: d.parentEmail,
    parentPhone: d.parentPhone,
    position: d.position,
    height: d.height,
    weight: d.weight,
    gradYear: d.gradYear,
    sat: d.sat,
    act: d.act,
    school: d.school,
    location: d.location,
    gpa: d.gpa,
    status: d.status,
    bio: d.bio,
    strengths: d.strengthsText,
    videoUrl: d.videoUrl,
    photoUrl: d.photoUrl,
    team: d.team,
    jersey: d.jersey,
    vertical: d.vertical,
    reach: d.reach,
    hand: d.hand,
    ncaa: d.ncaa,
    profileViews: d.profileViews,
    offers: d.offers,
    visits: d.visits,
    transcriptUrl: d.transcriptUrl,
    gameplayVideoUrl: d.gameplayVideoUrl,
    feeStage1: d.feeStage1,
    feeStage2: d.feeStage2,
    feeStage3: d.feeStage3,
    nilInterest: d.nilInterest,
    termsAgreed: d.termsAgreed,
  });

  const mergePlayer = (p: AthleteAdmin, d: PlayerDraft): AthleteAdmin => ({
    ...p,
    slug: String(d.slug ?? p.slug ?? ''),
    firstName: String(d.firstName ?? ''),
    lastName: String(d.lastName ?? ''),
    email: String(d.email ?? ''),
    phone: String(d.phone ?? ''),
    parentName: String(d.parentName ?? ''),
    parentEmail: String(d.parentEmail ?? ''),
    parentPhone: String(d.parentPhone ?? ''),
    position: String(d.position ?? ''),
    height: String(d.height ?? ''),
    weight: String(d.weight ?? ''),
    gradYear: String(d.gradYear ?? ''),
    sat: String(d.sat ?? ''),
    act: String(d.act ?? ''),
    school: String(d.school ?? ''),
    location: String(d.location ?? ''),
    gpa: String(d.gpa ?? ''),
    status: String(d.status ?? ''),
    bio: String(d.bio ?? ''),
    strengths: String(d.strengthsText ?? '').split(/[,\n]/).map(s => s.trim()).filter(Boolean),
    videoUrl: String(d.videoUrl ?? ''),
    photoUrl: String(d.photoUrl ?? ''),
    team: String(d.team ?? ''),
    jersey: String(d.jersey ?? ''),
    vertical: String(d.vertical ?? ''),
    reach: String(d.reach ?? ''),
    hand: String(d.hand ?? ''),
    ncaa: String(d.ncaa ?? ''),
    profileViews: String(d.profileViews ?? ''),
    offers: String(d.offers ?? ''),
    visits: String(d.visits ?? ''),
    transcriptUrl: String(d.transcriptUrl ?? ''),
    gameplayVideoUrl: String(d.gameplayVideoUrl ?? ''),
    feeStage1: d.feeStage1 === true,
    feeStage2: d.feeStage2 === true,
    feeStage3: d.feeStage3 === true,
    nilInterest: d.nilInterest === true,
    termsAgreed: d.termsAgreed === true,
  });

  const openDetails = (p: AthleteAdmin) => {
    setPlayerMessage('');
    setDetailPlayer(p);
    setEditing(p.id);
    setDraft(d => ({ ...d, [p.id]: playerDraftFrom(p) }));
  };

  const editUrl = (p: AthleteAdmin) => {
    if (!p.editToken) return '';
    const path = `/profile/edit?id=${encodeURIComponent(p.id)}&token=${encodeURIComponent(p.editToken)}`;
    if (typeof window === 'undefined') return path;
    return `${window.location.origin}${path}`;
  };

  const copyEditLink = async (p: AthleteAdmin) => {
    const url = editUrl(p);
    if (!url) {
      setPlayerMessage('Private edit links require ATHLETE_ACCESS_SECRET or ADMIN_PASSWORD.');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setPlayerMessage(`Private edit link copied for ${p.firstName} ${p.lastName}.`);
    } catch {
      setPlayerMessage(url);
    }
  };

  const agreementUrl = (p: AthleteAdmin) => {
    const path = `/agreement?email=${encodeURIComponent(p.email || p.parentEmail || '')}`;
    if (typeof window === 'undefined') return path;
    return `${window.location.origin}${path}`;
  };

  const copyAgreementLink = async (p: AthleteAdmin) => {
    const url = agreementUrl(p);
    try {
      await navigator.clipboard.writeText(url);
      setPlayerMessage(`Agreement link copied for ${p.firstName} ${p.lastName}.`);
    } catch {
      setPlayerMessage(url);
    }
  };

  const paymentUrl = (p: AthleteAdmin, stage: 'stage1' | 'stage2' | 'stage3') => {
    if (!p.editToken) return '';
    const path = `/pay?id=${encodeURIComponent(p.id)}&stage=${stage}&token=${encodeURIComponent(p.editToken)}`;
    if (typeof window === 'undefined') return path;
    return `${window.location.origin}${path}`;
  };

  const copyPaymentLink = async (p: AthleteAdmin, stage: 'stage1' | 'stage2' | 'stage3') => {
    const url = paymentUrl(p, stage);
    if (!url) {
      setPlayerMessage('Payment links require ATHLETE_ACCESS_SECRET or ADMIN_PASSWORD.');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setPlayerMessage(`${stage === 'stage1' ? 'Stage 1' : stage === 'stage2' ? 'Stage 2' : 'Stage 3'} payment link copied for ${p.firstName} ${p.lastName}.`);
    } catch {
      setPlayerMessage(url);
    }
  };

  const runSystemChecks = async () => {
    setSystemBusy(true);
    setSystemMessage('');
    try {
      const res = await fetch('/api/admin/system-checks');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'System check failed.');
      setSystemChecks(json.checks || []);
      setSystemMessage('System checks refreshed.');
    } catch (err) {
      setSystemMessage(err instanceof Error ? err.message : 'System check failed.');
    } finally {
      setSystemBusy(false);
    }
  };

  const exportPlayers = () => downloadCsv('cpr-player-profiles.csv', playerRows.map(p => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    parentName: p.parentName,
    parentEmail: p.parentEmail,
    status: p.status,
    position: p.position,
    gradYear: p.gradYear,
    school: p.school,
    submittedAt: p.submittedAt,
    termsAgreed: p.termsAgreed,
    agreementSubmitted: p.agreementSubmitted,
    programOption: p.programOption,
    feeStage1: p.feeStage1,
    feeStage2: p.feeStage2,
    feeStage3: p.feeStage3,
    transcriptUrl: p.transcriptUrl,
    gameplayVideoUrl: p.gameplayVideoUrl,
  })));

  const exportOutreach = () => downloadCsv('cpr-coach-outreach.csv', outreachRows.map(r => ({
    id: r.id,
    school: r.school,
    coach: r.coach,
    coachEmail: r.coachEmail,
    prospect: r.prospect,
    prospectSlug: r.prospectSlug,
    dateSent: r.dateSent,
    opened: r.opened,
    viewed: r.viewed,
    response: r.response,
    status: r.status,
  })));

  const exportCoaches = () => downloadCsv('cpr-coach-directory.csv', coachRows.map(c => ({
    id: c.id,
    school: c.school,
    coach: c.coach,
    coachEmail: c.coachEmail,
    coachRole: c.coachRole,
    sport: c.sport,
    conference: c.conference,
    region: c.region,
    status: c.status,
  })));

  const coachShareUrl = (r: Outreach) => {
    if (!r.shareToken || !r.prospectSlug) return '';
    const path = `/coach/${encodeURIComponent(r.id)}?token=${encodeURIComponent(r.shareToken)}`;
    if (typeof window === 'undefined') return path;
    return `${window.location.origin}${path}`;
  };

  const copyCoachLink = async (r: Outreach) => {
    const url = coachShareUrl(r);
    if (!url) {
      setOutreachMessage('Coach share links require a linked athlete slug and COACH_SHARE_SECRET or ADMIN_PASSWORD.');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setOutreachMessage(`Coach share link copied for ${r.school || r.coach}.`);
    } catch {
      setOutreachMessage(url);
    }
  };

  const sendCoachLink = async (r: Outreach) => {
    setBusyOutreach(`send-${r.id}`);
    setOutreachMessage('');
    try {
      const res = await fetch(`/api/admin/outreach/${r.id}/send-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: r.coachEmail, template: outreachTemplate, subject: outreachSubject, message: outreachBody }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Send failed');
      const activity = [{ date: new Date().toISOString(), message: `Admin sent coach share link to ${r.coachEmail}.` }, ...r.activity];
      setOutreachRows(rows => rows.map(row => row.id === r.id ? { ...row, activity } : row));
      setSel(s => s?.id === r.id ? { ...s, activity } : s);
      setOutreachMessage(`Coach share link sent to ${r.coachEmail}.`);
    } catch (err) {
      setOutreachMessage(err instanceof Error ? err.message : 'Could not send coach share link.');
    } finally {
      setBusyOutreach('');
    }
  };

  const toggleOutreach = (id: string, checked: boolean) => {
    setSelectedOutreach(rows => checked ? [...new Set([...rows, id])] : rows.filter(row => row !== id));
  };

  const toggleFilteredOutreach = (checked: boolean) => {
    setSelectedOutreach(checked ? filtered.map(row => row.id) : []);
  };

  const setTemplate = (key: TemplateKey) => {
    setOutreachTemplate(key);
    setOutreachSubject(OUTREACH_TEMPLATES[key].subject);
    setOutreachBody(OUTREACH_TEMPLATES[key].message);
  };

  const sendSelectedCoachLinks = async () => {
    const targets = selectedRows.filter(row => row.coachEmail && row.prospectSlug);
    if (targets.length === 0) {
      setOutreachMessage('Select outreach rows with coach email and athlete slug before bulk sending.');
      return;
    }
    setBusyOutreach('bulk-send');
    setOutreachMessage('');
    let sent = 0;
    const errors: string[] = [];
    try {
      for (const row of targets) {
        const res = await fetch(`/api/admin/outreach/${row.id}/send-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: row.coachEmail, template: outreachTemplate, subject: outreachSubject, message: outreachBody }),
        });
        const json = await res.json();
        if (!res.ok) {
          errors.push(`${row.school || row.coach}: ${json.error || 'send failed'}`);
          continue;
        }
        sent += 1;
        const activity = [{ date: new Date().toISOString(), message: `Admin bulk sent coach share link to ${row.coachEmail}.` }, ...row.activity];
        setOutreachRows(rows => rows.map(item => item.id === row.id ? { ...item, activity } : item));
      }
      setSelectedOutreach([]);
      setOutreachMessage(`${sent} coach link${sent === 1 ? '' : 's'} sent.${errors.length ? ` ${errors.length} failed.` : ''}`);
    } catch (err) {
      setOutreachMessage(err instanceof Error ? err.message : 'Bulk send failed.');
    } finally {
      setBusyOutreach('');
    }
  };

  const setCreateField = (key: keyof AthleteAdmin | 'strengthsText', value: string | boolean) => {
    setCreateDraft(d => ({ ...d, [key]: value }));
  };

  const setOutreachField = (id: string, key: keyof Outreach, value: string | boolean) => {
    setOutreachDraft(d => ({ ...d, [id]: { ...d[id], [key]: value } }));
  };

  const setCreateOutreachField = (key: keyof Outreach, value: string | boolean) => {
    setCreateOutreachDraft(d => ({ ...d, [key]: value }));
  };

  const startOutreachEdit = (r: Outreach) => {
    setOutreachMessage('');
    setSel(r);
    setEditingOutreach(r.id);
    setOutreachDraft(d => ({ ...d, [r.id]: { ...r } }));
  };

  const createOutreach = async () => {
    if (!createOutreachDraft.school || !createOutreachDraft.coach) {
      setOutreachMessage('School and coach are required.');
      return;
    }
    setBusyOutreach('new');
    setOutreachMessage('');
    try {
      const res = await fetch('/api/admin/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createOutreachDraft),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Create failed');
      setOutreachRows(rows => [json.outreach, ...rows]);
      setCreateOutreachDraft({ response: 'No Response', status: 'Waiting' });
      setShowCreateOutreach(false);
      setOutreachMessage('Coach outreach record created.');
    } catch (err) {
      setOutreachMessage(err instanceof Error ? err.message : 'Could not create coach outreach record.');
    } finally {
      setBusyOutreach('');
    }
  };

  const saveOutreach = async (id: string) => {
    const d = outreachDraft[id];
    if (!d) return;
    setBusyOutreach(id);
    setOutreachMessage('');
    try {
      const res = await fetch(`/api/admin/outreach/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setOutreachRows(rows => rows.map(r => r.id === id ? { ...r, ...d } as Outreach : r));
      setSel(s => s && s.id === id ? { ...s, ...d } as Outreach : s);
      setEditingOutreach('');
      setOutreachMessage('Coach outreach record saved.');
    } catch (err) {
      setOutreachMessage(err instanceof Error ? err.message : 'Could not save coach outreach record.');
    } finally {
      setBusyOutreach('');
    }
  };

  const deleteOutreach = async (r: Outreach) => {
    if (!window.confirm(`Delete outreach record for ${r.school} / ${r.coach}?`)) return;
    setBusyOutreach(r.id);
    setOutreachMessage('');
    try {
      const res = await fetch(`/api/admin/outreach/${r.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');
      setOutreachRows(rows => rows.filter(row => row.id !== r.id));
      setSel(s => s?.id === r.id ? null : s);
      setOutreachMessage('Coach outreach record deleted.');
    } catch (err) {
      setOutreachMessage(err instanceof Error ? err.message : 'Could not delete coach outreach record.');
    } finally {
      setBusyOutreach('');
    }
  };

  const setCoachField = (id: string, key: keyof CoachContact, value: string) => {
    setCoachDraft(d => ({ ...d, [id]: { ...d[id], [key]: value } }));
  };

  const setCreateCoachField = (key: keyof CoachContact, value: string) => {
    setCreateCoachDraft(d => ({ ...d, [key]: value }));
  };

  const startCoachEdit = (c: CoachContact) => {
    setCoachMessage('');
    setEditingCoach(c.id);
    setCoachDraft(d => ({ ...d, [c.id]: { ...c } }));
  };

  const createCoach = async () => {
    if (!createCoachDraft.school || !createCoachDraft.coach) {
      setCoachMessage('School and coach name are required.');
      return;
    }
    setBusyCoach('new');
    setCoachMessage('');
    try {
      const res = await fetch('/api/admin/coaches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createCoachDraft),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Create failed');
      setCoachRows(rows => [json.coach, ...rows]);
      setCreateCoachDraft({ sport: 'Basketball', status: 'Active' });
      setShowCreateCoach(false);
      setCoachMessage('Coach contact created.');
    } catch (err) {
      setCoachMessage(err instanceof Error ? err.message : 'Could not create coach contact.');
    } finally {
      setBusyCoach('');
    }
  };

  const saveCoach = async (id: string) => {
    const d = coachDraft[id];
    if (!d) return;
    setBusyCoach(id);
    setCoachMessage('');
    try {
      const res = await fetch(`/api/admin/coaches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setCoachRows(rows => rows.map(c => c.id === id ? { ...c, ...d } as CoachContact : c));
      setEditingCoach('');
      setCoachMessage('Coach contact saved.');
    } catch (err) {
      setCoachMessage(err instanceof Error ? err.message : 'Could not save coach contact.');
    } finally {
      setBusyCoach('');
    }
  };

  const deleteCoach = async (c: CoachContact) => {
    if (!window.confirm(`Delete ${c.coach} at ${c.school}?`)) return;
    setBusyCoach(c.id);
    setCoachMessage('');
    try {
      const res = await fetch(`/api/admin/coaches/${c.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');
      setCoachRows(rows => rows.filter(row => row.id !== c.id));
      setCoachMessage('Coach contact deleted.');
    } catch (err) {
      setCoachMessage(err instanceof Error ? err.message : 'Could not delete coach contact.');
    } finally {
      setBusyCoach('');
    }
  };

  const fillOutreachFromCoach = (c: CoachContact) => {
    setShowCreateOutreach(true);
    setCreateOutreachDraft(d => ({
      ...d,
      school: c.school,
      coach: c.coach,
      coachEmail: c.coachEmail,
      coachRole: c.coachRole,
      status: 'Waiting',
      response: 'No Response',
      dateSent: new Date().toISOString().slice(0, 10),
    }));
    setCoachMessage(`Outreach form pre-filled for ${c.school}.`);
  };

  const createPlayer = async () => {
    if (!createDraft.firstName || !createDraft.lastName) {
      setPlayerMessage('First and last name are required.');
      return;
    }
    setBusyPlayer('new');
    setPlayerMessage('');
    try {
      const res = await fetch('/api/admin/athletes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerPayload({ ...createDraft, status: createDraft.status || 'Pending' })),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Create failed');
      setPlayerRows(rows => [json.athlete, ...rows]);
      setCreateDraft({ status: 'Pending' });
      setShowCreate(false);
      setPlayerMessage('New player profile created.');
    } catch (err) {
      setPlayerMessage(err instanceof Error ? err.message : 'Could not create player profile.');
    } finally {
      setBusyPlayer('');
    }
  };

  const savePlayer = async (id: string) => {
    const d = draft[id];
    if (!d) return;
    setBusyPlayer(id);
    setPlayerMessage('');
    try {
      const res = await fetch(`/api/admin/athletes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerPayload(d)),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setPlayerRows(rows => rows.map(p => p.id === id ? mergePlayer(p, d) : p));
      setDetailPlayer(p => p?.id === id ? mergePlayer(p, d) : p);
      if (!detailPlayer || detailPlayer.id !== id) setEditing(null);
      setPlayerMessage('Player profile saved.');
    } catch (err) {
      setPlayerMessage(err instanceof Error ? err.message : 'Could not save player profile.');
    } finally {
      setBusyPlayer('');
    }
  };

  const quickSavePlayer = async (p: AthleteAdmin, patch: PlayerDraft, success: string) => {
    const nextDraft = { ...playerDraftFrom(p), ...patch };
    setBusyPlayer(`quick-${p.id}`);
    setPlayerMessage('');
    try {
      const res = await fetch(`/api/admin/athletes/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerPayload(nextDraft)),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setPlayerRows(rows => rows.map(row => row.id === p.id ? mergePlayer(row, nextDraft) : row));
      setDetailPlayer(current => current?.id === p.id ? mergePlayer(current, nextDraft) : current);
      setPlayerMessage(success);
    } catch (err) {
      setPlayerMessage(err instanceof Error ? err.message : 'Could not update applicant.');
    } finally {
      setBusyPlayer('');
    }
  };

  const deletePlayer = async (p: AthleteAdmin) => {
    if (!window.confirm(`Archive ${p.firstName} ${p.lastName}? This removes the public profile link but keeps the database record for Mike.`)) return;
    setBusyPlayer(p.id);
    setPlayerMessage('');
    try {
      const res = await fetch(`/api/admin/athletes/${p.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');
      setPlayerRows(rows => rows.map(row => row.id === p.id ? { ...row, status: 'Archived', slug: `archived-${p.id}` } : row));
      setDetailPlayer(d => d?.id === p.id ? { ...d, status: 'Archived', slug: `archived-${p.id}` } : d);
      setPlayerMessage('Player profile archived and removed from the public portal.');
    } catch (err) {
      setPlayerMessage(err instanceof Error ? err.message : 'Could not archive player profile.');
    } finally {
      setBusyPlayer('');
    }
  };

  const reviewPendingUpdate = async (player: AthleteAdmin, updateId: string, action: 'approve' | 'reject') => {
    setBusyPlayer(`${action}-${updateId}`);
    setPlayerMessage('');
    try {
      const res = await fetch(`/api/admin/athletes/${player.id}/pending/${updateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Review failed');
      const approved = player.pendingUpdates.find(update => update.id === updateId);
      setPlayerRows(rows => rows.map(row => {
        if (row.id !== player.id) return row;
        const pendingUpdates = row.pendingUpdates.filter(update => update.id !== updateId);
        if (action !== 'approve' || !approved) return { ...row, pendingUpdates };
        const { strengths, ...fields } = approved.fields;
        return mergePlayer({ ...row, pendingUpdates }, { ...fields, strengthsText: strengths });
      }));
      setDetailPlayer(current => {
        if (!current || current.id !== player.id) return current;
        const pendingUpdates = current.pendingUpdates.filter(update => update.id !== updateId);
        if (action !== 'approve' || !approved) return { ...current, pendingUpdates };
        const { strengths, ...fields } = approved.fields;
        return mergePlayer({ ...current, pendingUpdates }, { ...fields, strengthsText: strengths });
      });
      setPlayerMessage(`${action === 'approve' ? 'Profile update approved and published.' : 'Profile update rejected.'}${json.emailError ? ` Email notice issue: ${json.emailError}` : ''}`);
    } catch (err) {
      setPlayerMessage(err instanceof Error ? err.message : 'Could not review pending update.');
    } finally {
      setBusyPlayer('');
    }
  };

  return (
    <>
      <div className="stat-row">
        {stats.map(s => (
          <div className="stat-card" key={s.k}>
            <div className="sk">{s.k}</div>
            <div className="sv display">{s.v}</div>
            <div className="ss">{s.s}</div>
          </div>
        ))}
      </div>

      <section className="recent-activity">
        <div className="pm-head">
          <div>
            <h2 className="display">RECENT ACTIVITY</h2>
            <p>Latest applicant reviews, coach share sends, profile views, and archive actions.</p>
          </div>
        </div>
        {recentActivity.length > 0 ? (
          <ul className="activity-feed">
            {recentActivity.map((item, i) => (
              <li key={`${item.type}-${item.date}-${i}`}>
                <span>{item.type}</span>
                <b>{item.label}</b>
                <em>{item.message}</em>
                <time>{new Date(item.date).toLocaleString()}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty activity-empty">No tracked activity yet.</p>
        )}
      </section>

      <section className="system-readiness">
        <div className="pm-head">
          <div>
            <h2 className="display">SYSTEM READINESS</h2>
            <p>Admin accounts, Airtable schema, and Stripe payment configuration.</p>
          </div>
          <div className="pm-tools">
            {systemMessage && <span className="pm-message">{systemMessage}</span>}
            <button onClick={runSystemChecks} disabled={systemBusy}>{systemBusy ? 'Checking...' : 'Run Checks'}</button>
          </div>
        </div>
        {systemChecks.length > 0 ? (
          <div className="check-grid">
            {systemChecks.map(check => (
              <div className={`check-card ${check.ok ? 'ok-card' : 'bad-card'}`} key={check.name}>
                <span>{check.ok ? 'READY' : 'ACTION'}</span>
                <b>{check.name}</b>
                <p>{check.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty activity-empty">Run checks after changing Vercel or Airtable settings.</p>
        )}
      </section>

      <section className="admissions-board">
        <div className="pm-head">
          <div>
            <h2 className="display">APPLICATIONS &amp; PAYMENTS</h2>
            <p>Review intake records, agreements, files, and CPR fee stages.</p>
          </div>
          <div className="pm-tools">
            <button className="ghost-tool" onClick={exportPlayers}>Export Players</button>
            <button className="ghost-tool" onClick={exportOutreach}>Export Outreach</button>
            <button className="ghost-tool" onClick={exportCoaches}>Export Coaches</button>
          </div>
        </div>
        <div className="admission-stats">
          <div><span>Applicants</span><b>{admissionStats.applicants}</b></div>
          <div><span>Agreements</span><b>{admissionStats.agreements}</b></div>
          <div><span>Files Ready</span><b>{admissionStats.filesReady}</b></div>
          <div><span>Stage 1 Paid</span><b>{admissionStats.stage1Paid}</b></div>
        </div>
        <div className="table-wrap">
          <div className="filters">
            <select value={admissionFilter} onChange={e => setAdmissionFilter(e.target.value)}>
              {['Needs Action', 'Needs Agreement', 'Needs Files', 'Payment Due', 'Ready', 'All'].map(item => <option key={item}>{item}</option>)}
            </select>
          </div>
          <table className="otable admissions-table">
            <thead><tr><th>Applicant</th><th>Profile</th><th>Agreement</th><th>Files</th><th>Payments</th><th>Next Action</th><th>Actions</th></tr></thead>
            <tbody>
              {admissionRows.map(p => {
                const needsAgreement = !p.termsAgreed && !p.agreementSubmitted;
                const missingFiles = !p.transcriptUrl || !p.gameplayVideoUrl;
                const unpaid = !p.feeStage1 && !p.feeStage2 && !p.feeStage3;
                const nextAction = needsAgreement ? 'Send fee agreement' : missingFiles ? 'Collect transcript / film' : unpaid ? 'Collect first payment' : p.pendingUpdates.length > 0 ? 'Review profile update' : 'Ready for outreach';
                return (
                  <tr key={`admission-${p.id}`}>
                    <td>
                      <span className="bold">{p.firstName} {p.lastName}</span>
                      <div className="sub">{p.email || p.parentEmail || 'No email'} {p.submittedAt ? `- ${p.submittedAt}` : ''}</div>
                    </td>
                    <td>
                      {p.slug ? (
                        <a href={`/athletes/${p.slug}`} target="_blank" rel="noopener noreferrer" className="profile-link-btn">View →</a>
                      ) : (
                        <span className="no">Pending</span>
                      )}
                    </td>
                    <td>
                      <span className={`pill st ${needsAgreement ? 'pending' : 'active'}`}>{needsAgreement ? 'NEEDED' : 'ON FILE'}</span>
                      <div className="sub">{p.programOption || 'No fee option logged'}</div>
                    </td>
                    <td>
                      <span className={p.transcriptUrl ? 'ok' : 'no'}>Transcript</span>
                      <div><span className={p.gameplayVideoUrl ? 'ok' : 'no'}>Game film</span></div>
                    </td>
                    <td>
                      <div className="pay-checks">
                        <label><input type="checkbox" checked={p.feeStage1} disabled={busyPlayer === `quick-${p.id}`} onChange={e => quickSavePlayer(p, { feeStage1: e.target.checked }, 'Stage 1 payment updated.')} /> Stage 1</label>
                        <label><input type="checkbox" checked={p.feeStage2} disabled={busyPlayer === `quick-${p.id}`} onChange={e => quickSavePlayer(p, { feeStage2: e.target.checked }, 'Stage 2 payment updated.')} /> Stage 2</label>
                        <label><input type="checkbox" checked={p.feeStage3} disabled={busyPlayer === `quick-${p.id}`} onChange={e => quickSavePlayer(p, { feeStage3: e.target.checked }, 'Stage 3 payment updated.')} /> Stage 3</label>
                      </div>
                    </td>
                    <td>{nextAction}</td>
                    <td>
                      <div className="action-row">
                        <button className="ghost" onClick={() => copyAgreementLink(p)}>Copy Agreement</button>
                        <button className="ghost" onClick={() => copyPaymentLink(p, 'stage1')}>Pay 1</button>
                        <button className="ghost" onClick={() => copyPaymentLink(p, 'stage2')}>Pay 2</button>
                        <button className="ghost" onClick={() => copyPaymentLink(p, 'stage3')}>Pay 3</button>
                        <button onClick={() => openDetails(p)}>Details</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {admissionRows.length === 0 && <tr><td colSpan={6} className="empty">No applicants match this filter.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="player-manager">
        <div className="pm-head">
          <div>
            <h2 className="display">PLAYER PROFILES</h2>
            <p>Edit player information, open public profiles, or remove names from the portal.</p>
          </div>
          <div className="pm-tools">
            {playerMessage && <span className="pm-message">{playerMessage}</span>}
            <button onClick={() => setShowCreate(v => !v)}>{showCreate ? 'Close' : 'New Player'}</button>
          </div>
        </div>
        {showCreate && (
          <div className="create-player">
            <div className="create-grid">
              <input value={String(createDraft.firstName || '')} onChange={e => setCreateField('firstName', e.target.value)} placeholder="First name" />
              <input value={String(createDraft.lastName || '')} onChange={e => setCreateField('lastName', e.target.value)} placeholder="Last name" />
              <input value={String(createDraft.email || '')} onChange={e => setCreateField('email', e.target.value)} placeholder="Athlete email" />
              <input value={String(createDraft.phone || '')} onChange={e => setCreateField('phone', e.target.value)} placeholder="Athlete phone" />
              <input value={String(createDraft.parentName || '')} onChange={e => setCreateField('parentName', e.target.value)} placeholder="Parent name" />
              <input value={String(createDraft.parentEmail || '')} onChange={e => setCreateField('parentEmail', e.target.value)} placeholder="Parent email" />
              <input value={String(createDraft.position || '')} onChange={e => setCreateField('position', e.target.value)} placeholder="Position" />
              <input value={String(createDraft.gradYear || '')} onChange={e => setCreateField('gradYear', e.target.value)} placeholder="Grad year" />
              <input value={String(createDraft.school || '')} onChange={e => setCreateField('school', e.target.value)} placeholder="Current school" />
              <input value={String(createDraft.location || '')} onChange={e => setCreateField('location', e.target.value)} placeholder="City / Province" />
              <input value={String(createDraft.gpa || '')} onChange={e => setCreateField('gpa', e.target.value)} placeholder="GPA" />
              <select value={String(createDraft.status || 'Pending')} onChange={e => setCreateField('status', e.target.value)}>
                {['Pending', 'Active', 'Waiting', 'Closed', 'Archived'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <textarea value={String(createDraft.bio || '')} onChange={e => setCreateField('bio', e.target.value)} placeholder="Bio" />
            <div className="create-grid two">
              <input value={String(createDraft.strengthsText || '')} onChange={e => setCreateField('strengthsText', e.target.value)} placeholder="Strengths, comma separated" />
              <input value={String(createDraft.videoUrl || '')} onChange={e => setCreateField('videoUrl', e.target.value)} placeholder="Highlight video URL" />
              <input value={String(createDraft.photoUrl || '')} onChange={e => setCreateField('photoUrl', e.target.value)} placeholder="Photo URL" />
              <input value={String(createDraft.parentPhone || '')} onChange={e => setCreateField('parentPhone', e.target.value)} placeholder="Parent phone" />
            </div>
            <div className="create-actions">
              <button onClick={createPlayer} disabled={busyPlayer === 'new'}>{busyPlayer === 'new' ? 'Creating...' : 'Create Player'}</button>
              <button className="ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        )}
        <div className="table-wrap">
          <div className="filters player-filters">
            <input placeholder="Search players, parents, school, email..." value={playerQ} onChange={e => setPlayerQ(e.target.value)} />
            <select value={playerStatus} onChange={e => setPlayerStatus(e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
            <select value={playerClass} onChange={e => setPlayerClass(e.target.value)}>{playerClasses.map(s => <option key={s}>{s}</option>)}</select>
            <select value={playerPosition} onChange={e => setPlayerPosition(e.target.value)}>{playerPositions.map(s => <option key={s}>{s}</option>)}</select>
            <label className="filter-check"><input type="checkbox" checked={pendingOnly} onChange={e => setPendingOnly(e.target.checked)} /> Needs review</label>
          </div>
          <table className="otable player-table">
            <thead><tr><th>Player</th><th>Profile</th><th>School</th><th>Status</th><th>Photo</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredPlayerRows.map((p) => {
                const isEditing = editing === p.id;
                const d = draft[p.id] || {};
                return (
                  <tr key={p.id}>
                    <td>
                      {isEditing ? (
                        <div className="inline-grid">
                          <input value={String(d.firstName || '')} onChange={e => setPlayerField(p.id, 'firstName', e.target.value)} placeholder="First name" />
                          <input value={String(d.lastName || '')} onChange={e => setPlayerField(p.id, 'lastName', e.target.value)} placeholder="Last name" />
                        </div>
                      ) : (
                        <span className="bold">{p.firstName} {p.lastName}</span>
                      )}
                      {p.pendingUpdates.length > 0 && <div className="review-badge">{p.pendingUpdates.length} pending review</div>}
                      <div className="sub">{p.parentName ? `Parent: ${p.parentName}` : 'No parent listed'}</div>
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="inline-grid">
                          <input value={String(d.position || '')} onChange={e => setPlayerField(p.id, 'position', e.target.value)} placeholder="Position" />
                          <input value={String(d.gradYear || '')} onChange={e => setPlayerField(p.id, 'gradYear', e.target.value)} placeholder="Grad year" />
                          <input value={String(d.gpa || '')} onChange={e => setPlayerField(p.id, 'gpa', e.target.value)} placeholder="GPA" />
                        </div>
                      ) : (
                        <>
                          <span>{p.position || 'No position'}</span>
                          <div className="sub">{p.gradYear ? `Class of ${p.gradYear}` : 'No grad year'} {p.gpa ? `· GPA ${p.gpa}` : ''}</div>
                        </>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="inline-grid">
                          <input value={String(d.school || '')} onChange={e => setPlayerField(p.id, 'school', e.target.value)} placeholder="Current school" />
                          <input value={String(d.location || '')} onChange={e => setPlayerField(p.id, 'location', e.target.value)} placeholder="City / Province" />
                        </div>
                      ) : (
                        <>
                          <span>{p.school || '-'}</span>
                          <div className="sub">{p.location}</div>
                        </>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select value={String(d.status || '')} onChange={e => setPlayerField(p.id, 'status', e.target.value)}>
                          {PROFILE_STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className={`pill st ${cls(p.status || 'pending')}`}>{(p.status || 'Pending').toUpperCase()}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input value={String(d.photoUrl || '')} onChange={e => setPlayerField(p.id, 'photoUrl', e.target.value)} placeholder="Photo URL" />
                      ) : (
                        p.photoUrl ? <img className="player-thumb" src={p.photoUrl} alt="" /> : <span className="sub">No photo</span>
                      )}
                    </td>
                    <td>
                      <div className="action-row">
                        {isEditing ? (
                          <>
                            <button onClick={() => savePlayer(p.id)} disabled={busyPlayer === p.id}>{busyPlayer === p.id ? 'Saving...' : 'Save'}</button>
                            <button className="ghost" onClick={() => setEditing(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(p)}>Edit</button>
                            <button className="ghost" onClick={() => openDetails(p)}>Details</button>
                            {p.slug && p.status === 'Active' && <a href={`/athletes/${p.slug}`} target="_blank">Open</a>}
                            <button className="ghost" onClick={() => copyEditLink(p)}>Copy Edit Link</button>
                            <button className="danger" onClick={() => deletePlayer(p)} disabled={busyPlayer === p.id}>{busyPlayer === p.id ? 'Archiving...' : 'Archive'}</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPlayerRows.length === 0 && <tr><td colSpan={6} className="empty">No player profiles found.</td></tr>}
            </tbody>
          </table>
          <div className="count">Showing {filteredPlayerRows.length} of {playerRows.length} player records</div>
        </div>
        {detailPlayer && (
          <div className="full-editor">
            <div className="full-head">
              <div>
                <h3 className="display">FULL PLAYER RECORD</h3>
                <p>{detailPlayer.firstName} {detailPlayer.lastName} · Airtable ID {detailPlayer.id}</p>
              </div>
              <div className="action-row">
                <button onClick={() => savePlayer(detailPlayer.id)} disabled={busyPlayer === detailPlayer.id}>{busyPlayer === detailPlayer.id ? 'Saving...' : 'Save Full Record'}</button>
                <button className="ghost" onClick={() => { setDetailPlayer(null); setEditing(null); }}>Close</button>
              </div>
            </div>
            {detailPlayer.pendingUpdates.length > 0 && (
              <div className="review-panel">
                <h4 className="display">PENDING PROFILE UPDATES</h4>
                {detailPlayer.pendingUpdates.map(update => (
                  <div className="review-card" key={update.id}>
                    <div className="review-top">
                      <strong>{new Date(update.submittedAt).toLocaleString()}</strong>
                      <div className="action-row">
                        <button onClick={() => reviewPendingUpdate(detailPlayer, update.id, 'approve')} disabled={busyPlayer === `approve-${update.id}`}>{busyPlayer === `approve-${update.id}` ? 'Approving...' : 'Approve'}</button>
                        <button className="danger" onClick={() => reviewPendingUpdate(detailPlayer, update.id, 'reject')} disabled={busyPlayer === `reject-${update.id}`}>{busyPlayer === `reject-${update.id}` ? 'Rejecting...' : 'Reject'}</button>
                      </div>
                    </div>
                    <div className="review-fields">
                      {Object.entries(update.fields).map(([key, value]) => (
                        <div key={key}><span>{key}</span><b>{String(value || '-')}</b></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {detailPlayer.activity.length > 0 && (
              <div className="activity-panel">
                <h4 className="display">ACTIVITY LOG</h4>
                <ul className="activity-list">
                  {detailPlayer.activity.slice(0, 8).map((item, i) => (
                    <li key={`${item.date}-${i}`}>
                      <span>{new Date(item.date).toLocaleString()}</span>
                      <b>{item.message}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="full-grid">
              <label>Slug<input value={String(draft[detailPlayer.id]?.slug || '')} onChange={e => setPlayerField(detailPlayer.id, 'slug', e.target.value)} /></label>
              <label>First Name<input value={String(draft[detailPlayer.id]?.firstName || '')} onChange={e => setPlayerField(detailPlayer.id, 'firstName', e.target.value)} /></label>
              <label>Last Name<input value={String(draft[detailPlayer.id]?.lastName || '')} onChange={e => setPlayerField(detailPlayer.id, 'lastName', e.target.value)} /></label>
              <label>Status<select value={String(draft[detailPlayer.id]?.status || '')} onChange={e => setPlayerField(detailPlayer.id, 'status', e.target.value)}>{PROFILE_STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
              <label>Email<input value={String(draft[detailPlayer.id]?.email || '')} onChange={e => setPlayerField(detailPlayer.id, 'email', e.target.value)} /></label>
              <label>Phone<input value={String(draft[detailPlayer.id]?.phone || '')} onChange={e => setPlayerField(detailPlayer.id, 'phone', e.target.value)} /></label>
              <label>Parent Name<input value={String(draft[detailPlayer.id]?.parentName || '')} onChange={e => setPlayerField(detailPlayer.id, 'parentName', e.target.value)} /></label>
              <label>Parent Email<input value={String(draft[detailPlayer.id]?.parentEmail || '')} onChange={e => setPlayerField(detailPlayer.id, 'parentEmail', e.target.value)} /></label>
              <label>Parent Phone<input value={String(draft[detailPlayer.id]?.parentPhone || '')} onChange={e => setPlayerField(detailPlayer.id, 'parentPhone', e.target.value)} /></label>
              <label>Position<input value={String(draft[detailPlayer.id]?.position || '')} onChange={e => setPlayerField(detailPlayer.id, 'position', e.target.value)} /></label>
              <label>Height<input value={String(draft[detailPlayer.id]?.height || '')} onChange={e => setPlayerField(detailPlayer.id, 'height', e.target.value)} /></label>
              <label>Weight<input value={String(draft[detailPlayer.id]?.weight || '')} onChange={e => setPlayerField(detailPlayer.id, 'weight', e.target.value)} /></label>
              <label>Grad Year<input value={String(draft[detailPlayer.id]?.gradYear || '')} onChange={e => setPlayerField(detailPlayer.id, 'gradYear', e.target.value)} /></label>
              <label>GPA<input value={String(draft[detailPlayer.id]?.gpa || '')} onChange={e => setPlayerField(detailPlayer.id, 'gpa', e.target.value)} /></label>
              <label>SAT<input value={String(draft[detailPlayer.id]?.sat || '')} onChange={e => setPlayerField(detailPlayer.id, 'sat', e.target.value)} /></label>
              <label>ACT<input value={String(draft[detailPlayer.id]?.act || '')} onChange={e => setPlayerField(detailPlayer.id, 'act', e.target.value)} /></label>
              <label>School<input value={String(draft[detailPlayer.id]?.school || '')} onChange={e => setPlayerField(detailPlayer.id, 'school', e.target.value)} /></label>
              <label>City / Province<input value={String(draft[detailPlayer.id]?.location || '')} onChange={e => setPlayerField(detailPlayer.id, 'location', e.target.value)} /></label>
              <label>Club Team<input value={String(draft[detailPlayer.id]?.team || '')} onChange={e => setPlayerField(detailPlayer.id, 'team', e.target.value)} /></label>
              <label>Jersey<input value={String(draft[detailPlayer.id]?.jersey || '')} onChange={e => setPlayerField(detailPlayer.id, 'jersey', e.target.value)} /></label>
              <label>Vertical<input value={String(draft[detailPlayer.id]?.vertical || '')} onChange={e => setPlayerField(detailPlayer.id, 'vertical', e.target.value)} /></label>
              <label>Standing Reach<input value={String(draft[detailPlayer.id]?.reach || '')} onChange={e => setPlayerField(detailPlayer.id, 'reach', e.target.value)} /></label>
              <label>Dominant Hand<input value={String(draft[detailPlayer.id]?.hand || '')} onChange={e => setPlayerField(detailPlayer.id, 'hand', e.target.value)} /></label>
              <label>NCAA Eligibility<input value={String(draft[detailPlayer.id]?.ncaa || '')} onChange={e => setPlayerField(detailPlayer.id, 'ncaa', e.target.value)} /></label>
              <label>Profile Views<input value={String(draft[detailPlayer.id]?.profileViews || '')} onChange={e => setPlayerField(detailPlayer.id, 'profileViews', e.target.value)} /></label>
              <label>Offers<input value={String(draft[detailPlayer.id]?.offers || '')} onChange={e => setPlayerField(detailPlayer.id, 'offers', e.target.value)} /></label>
              <label>Visits<input value={String(draft[detailPlayer.id]?.visits || '')} onChange={e => setPlayerField(detailPlayer.id, 'visits', e.target.value)} /></label>
              <label>Photo URL<input value={String(draft[detailPlayer.id]?.photoUrl || '')} onChange={e => setPlayerField(detailPlayer.id, 'photoUrl', e.target.value)} /></label>
              <label>Video URL<input value={String(draft[detailPlayer.id]?.videoUrl || '')} onChange={e => setPlayerField(detailPlayer.id, 'videoUrl', e.target.value)} /></label>
              <label>Transcript URL<input value={String(draft[detailPlayer.id]?.transcriptUrl || '')} onChange={e => setPlayerField(detailPlayer.id, 'transcriptUrl', e.target.value)} /></label>
              <label>Gameplay URL<input value={String(draft[detailPlayer.id]?.gameplayVideoUrl || '')} onChange={e => setPlayerField(detailPlayer.id, 'gameplayVideoUrl', e.target.value)} /></label>
              <label className="full-check"><input type="checkbox" checked={draft[detailPlayer.id]?.termsAgreed === true} onChange={e => setPlayerField(detailPlayer.id, 'termsAgreed', e.target.checked)} /> Terms Agreed</label>
              <label className="full-check"><input type="checkbox" checked={draft[detailPlayer.id]?.feeStage1 === true} onChange={e => setPlayerField(detailPlayer.id, 'feeStage1', e.target.checked)} /> Fee Stage 1</label>
              <label className="full-check"><input type="checkbox" checked={draft[detailPlayer.id]?.feeStage2 === true} onChange={e => setPlayerField(detailPlayer.id, 'feeStage2', e.target.checked)} /> Fee Stage 2</label>
              <label className="full-check"><input type="checkbox" checked={draft[detailPlayer.id]?.feeStage3 === true} onChange={e => setPlayerField(detailPlayer.id, 'feeStage3', e.target.checked)} /> Fee Stage 3</label>
              <label className="full-check"><input type="checkbox" checked={draft[detailPlayer.id]?.nilInterest === true} onChange={e => setPlayerField(detailPlayer.id, 'nilInterest', e.target.checked)} /> NIL Interest</label>
            </div>
            <div className="full-text">
              <label>Bio<textarea value={String(draft[detailPlayer.id]?.bio || '')} onChange={e => setPlayerField(detailPlayer.id, 'bio', e.target.value)} /></label>
              <label>Strengths<textarea value={String(draft[detailPlayer.id]?.strengthsText || '')} onChange={e => setPlayerField(detailPlayer.id, 'strengthsText', e.target.value)} /></label>
            </div>
          </div>
        )}
      </section>

      <section className="coach-directory">
        <div className="pm-head">
          <div>
            <h2 className="display">COACH DIRECTORY</h2>
            <p>Reusable school and coach contacts for faster outreach.</p>
          </div>
          <div className="pm-tools">
            {coachMessage && <span className="pm-message">{coachMessage}</span>}
            <button onClick={() => setShowCreateCoach(v => !v)}>{showCreateCoach ? 'Close' : 'New Coach'}</button>
          </div>
        </div>
        {showCreateCoach && (
          <div className="create-player">
            <div className="create-grid">
              <input value={String(createCoachDraft.school || '')} onChange={e => setCreateCoachField('school', e.target.value)} placeholder="School" />
              <input value={String(createCoachDraft.coach || '')} onChange={e => setCreateCoachField('coach', e.target.value)} placeholder="Coach name" />
              <input type="email" value={String(createCoachDraft.coachEmail || '')} onChange={e => setCreateCoachField('coachEmail', e.target.value)} placeholder="Coach email" />
              <input value={String(createCoachDraft.coachRole || '')} onChange={e => setCreateCoachField('coachRole', e.target.value)} placeholder="Coach role" />
              <input value={String(createCoachDraft.sport || '')} onChange={e => setCreateCoachField('sport', e.target.value)} placeholder="Sport" />
              <input value={String(createCoachDraft.conference || '')} onChange={e => setCreateCoachField('conference', e.target.value)} placeholder="Conference" />
              <input value={String(createCoachDraft.region || '')} onChange={e => setCreateCoachField('region', e.target.value)} placeholder="Region" />
              <select value={String(createCoachDraft.status || 'Active')} onChange={e => setCreateCoachField('status', e.target.value)}>
                {['Active', 'Do Not Contact', 'Research', 'Archived'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <textarea value={String(createCoachDraft.notes || '')} onChange={e => setCreateCoachField('notes', e.target.value)} placeholder="Notes" />
            <div className="create-actions">
              <button onClick={createCoach} disabled={busyCoach === 'new'}>{busyCoach === 'new' ? 'Creating...' : 'Create Coach'}</button>
              <button className="ghost" onClick={() => setShowCreateCoach(false)}>Cancel</button>
            </div>
          </div>
        )}
        <div className="table-wrap">
          <div className="filters">
            <input placeholder="Search schools, coaches, email, conference..." value={coachQ} onChange={e => setCoachQ(e.target.value)} />
          </div>
          <table className="otable">
            <thead><tr><th>School</th><th>Coach</th><th>Email</th><th>Conference</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredCoachRows.map(c => {
                const isEditingCoach = editingCoach === c.id;
                const d = coachDraft[c.id] || {};
                return (
                  <tr key={c.id}>
                    <td className="bold">{isEditingCoach ? <input value={String(d.school || '')} onChange={e => setCoachField(c.id, 'school', e.target.value)} /> : c.school}</td>
                    <td>{isEditingCoach ? (
                      <div className="inline-grid">
                        <input value={String(d.coach || '')} onChange={e => setCoachField(c.id, 'coach', e.target.value)} placeholder="Coach" />
                        <input value={String(d.coachRole || '')} onChange={e => setCoachField(c.id, 'coachRole', e.target.value)} placeholder="Role" />
                      </div>
                    ) : <>{c.coach}<div className="sub">{c.coachRole}</div></>}</td>
                    <td>{isEditingCoach ? <input type="email" value={String(d.coachEmail || '')} onChange={e => setCoachField(c.id, 'coachEmail', e.target.value)} /> : c.coachEmail || '-'}</td>
                    <td>{isEditingCoach ? (
                      <div className="inline-grid">
                        <input value={String(d.conference || '')} onChange={e => setCoachField(c.id, 'conference', e.target.value)} placeholder="Conference" />
                        <input value={String(d.region || '')} onChange={e => setCoachField(c.id, 'region', e.target.value)} placeholder="Region" />
                      </div>
                    ) : <>{c.conference || '-'}<div className="sub">{c.region}</div></>}</td>
                    <td>{isEditingCoach ? <select value={String(d.status || '')} onChange={e => setCoachField(c.id, 'status', e.target.value)}>{['Active', 'Do Not Contact', 'Research', 'Archived'].map(s => <option key={s}>{s}</option>)}</select> : <span className={`pill st ${cls(c.status || 'active')}`}>{(c.status || 'Active').toUpperCase()}</span>}</td>
                    <td>
                      <div className="action-row">
                        {isEditingCoach ? (
                          <>
                            <button onClick={() => saveCoach(c.id)} disabled={busyCoach === c.id}>{busyCoach === c.id ? 'Saving...' : 'Save'}</button>
                            <button className="ghost" onClick={() => setEditingCoach('')}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => fillOutreachFromCoach(c)}>Use for Outreach</button>
                            <button className="ghost" onClick={() => startCoachEdit(c)}>Edit</button>
                            <button className="danger" onClick={() => deleteCoach(c)} disabled={busyCoach === c.id}>{busyCoach === c.id ? 'Deleting...' : 'Delete'}</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCoachRows.length === 0 && <tr><td colSpan={6} className="empty">No coach contacts found.</td></tr>}
            </tbody>
          </table>
          <div className="count">Showing {filteredCoachRows.length} of {coachRows.length} coach contacts</div>
        </div>
      </section>

      <section className="outreach-manager">
        <div className="pm-head">
          <div>
            <h2 className="display">COACH OUTREACH</h2>
            <p>Add coach contacts, update responses, or remove outreach rows.</p>
          </div>
          <div className="pm-tools">
            {outreachMessage && <span className="pm-message">{outreachMessage}</span>}
            <button onClick={() => setShowCreateOutreach(v => !v)}>{showCreateOutreach ? 'Close' : 'New Outreach'}</button>
          </div>
        </div>
        <div className="template-editor">
          <div className="template-row">
            <select value={outreachTemplate} onChange={e => setTemplate(e.target.value as TemplateKey)}>
              {(Object.entries(OUTREACH_TEMPLATES) as [TemplateKey, typeof OUTREACH_TEMPLATES[TemplateKey]][]).map(([key, template]) => (
                <option key={key} value={key}>{template.name}</option>
              ))}
            </select>
            <input value={outreachSubject} onChange={e => setOutreachSubject(e.target.value)} placeholder="Email subject" />
          </div>
          <textarea value={outreachBody} onChange={e => setOutreachBody(e.target.value)} placeholder="Email message. Available placeholders: {athleteName}, {coachName}, {school}, {schoolText}, {shareUrl}" />
          <div className="template-hint">Placeholders: {'{athleteName}'}, {'{coachName}'}, {'{school}'}, {'{schoolText}'}, {'{shareUrl}'}</div>
        </div>
        {showCreateOutreach && (
          <div className="create-player">
            <div className="create-grid">
              <input value={String(createOutreachDraft.school || '')} onChange={e => setCreateOutreachField('school', e.target.value)} placeholder="School" />
              <input value={String(createOutreachDraft.coach || '')} onChange={e => setCreateOutreachField('coach', e.target.value)} placeholder="Coach name" />
              <input type="email" value={String(createOutreachDraft.coachEmail || '')} onChange={e => setCreateOutreachField('coachEmail', e.target.value)} placeholder="Coach email" />
              <input value={String(createOutreachDraft.coachRole || '')} onChange={e => setCreateOutreachField('coachRole', e.target.value)} placeholder="Coach role" />
              <input value={String(createOutreachDraft.prospect || '')} onChange={e => setCreateOutreachField('prospect', e.target.value)} placeholder="Prospect name" />
              <input value={String(createOutreachDraft.prospectSlug || '')} onChange={e => setCreateOutreachField('prospectSlug', e.target.value)} placeholder="Athlete slug" />
              <input value={String(createOutreachDraft.positionYear || '')} onChange={e => setCreateOutreachField('positionYear', e.target.value)} placeholder="Position / Year" />
              <input type="date" value={String(createOutreachDraft.dateSent || '')} onChange={e => setCreateOutreachField('dateSent', e.target.value)} />
              <select value={String(createOutreachDraft.response || 'No Response')} onChange={e => setCreateOutreachField('response', e.target.value)}>
                {RESPONSES.filter(r => r !== 'All Responses').map(r => <option key={r}>{r}</option>)}
              </select>
              <select value={String(createOutreachDraft.status || 'Waiting')} onChange={e => setCreateOutreachField('status', e.target.value)}>
                {STATUSES.filter(s => s !== 'All Statuses').map(s => <option key={s}>{s}</option>)}
              </select>
              <label className="check-field"><input type="checkbox" checked={createOutreachDraft.opened === true} onChange={e => setCreateOutreachField('opened', e.target.checked)} /> Opened</label>
              <label className="check-field"><input type="checkbox" checked={createOutreachDraft.viewed === true} onChange={e => setCreateOutreachField('viewed', e.target.checked)} /> Viewed</label>
            </div>
            <textarea value={String(createOutreachDraft.notes || '')} onChange={e => setCreateOutreachField('notes', e.target.value)} placeholder="Notes" />
            <div className="create-actions">
              <button onClick={createOutreach} disabled={busyOutreach === 'new'}>{busyOutreach === 'new' ? 'Creating...' : 'Create Outreach'}</button>
              <button className="ghost" onClick={() => setShowCreateOutreach(false)}>Cancel</button>
            </div>
          </div>
        )}
      </section>

      <div className={`work ${sel ? 'with-panel' : ''}`}>
        <div className="table-wrap">
          <div className="filters">
            <input placeholder="Search by school, coach or prospect..." value={q} onChange={e => setQ(e.target.value)} />
            <select value={status} onChange={e => setStatus(e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
            <select value={resp} onChange={e => setResp(e.target.value)}>{RESPONSES.map(s => <option key={s}>{s}</option>)}</select>
            <button className="bulk-send" onClick={sendSelectedCoachLinks} disabled={busyOutreach === 'bulk-send' || selectedOutreach.length === 0}>
              {busyOutreach === 'bulk-send' ? 'Sending...' : `Send Selected (${selectedOutreach.length})`}
            </button>
          </div>
          <table className="otable">
            <thead><tr><th><input type="checkbox" checked={filtered.length > 0 && filtered.every(row => selectedOutreach.includes(row.id))} onChange={e => toggleFilteredOutreach(e.target.checked)} aria-label="Select all outreach rows" /></th><th>School</th><th>Coach</th><th>Prospect</th><th>Date Sent</th><th>Opened</th><th>Viewed</th><th>Response</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((r) => {
                const isEditingOutreach = editingOutreach === r.id;
                const d = outreachDraft[r.id] || {};
                return (
                <tr key={r.id} className={sel === r ? 'selrow' : ''} onClick={() => setSel(r)}>
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedOutreach.includes(r.id)} onChange={e => toggleOutreach(r.id, e.target.checked)} aria-label={`Select ${r.school || r.coach}`} /></td>
                  <td className="bold">{isEditingOutreach ? <input value={String(d.school || '')} onChange={e => setOutreachField(r.id, 'school', e.target.value)} /> : r.school}</td>
                  <td>{isEditingOutreach ? (
                    <div className="inline-grid">
                      <input value={String(d.coach || '')} onChange={e => setOutreachField(r.id, 'coach', e.target.value)} placeholder="Coach" />
                      <input type="email" value={String(d.coachEmail || '')} onChange={e => setOutreachField(r.id, 'coachEmail', e.target.value)} placeholder="Email" />
                      <input value={String(d.coachRole || '')} onChange={e => setOutreachField(r.id, 'coachRole', e.target.value)} placeholder="Role" />
                    </div>
                  ) : <>{r.coach}<div className="sub">{[r.coachRole, r.coachEmail].filter(Boolean).join(' · ')}</div></>}</td>
                  <td>{isEditingOutreach ? (
                    <div className="inline-grid">
                      <input value={String(d.prospect || '')} onChange={e => setOutreachField(r.id, 'prospect', e.target.value)} placeholder="Prospect" />
                      <input value={String(d.positionYear || '')} onChange={e => setOutreachField(r.id, 'positionYear', e.target.value)} placeholder="Position / Year" />
                      <input value={String(d.prospectSlug || '')} onChange={e => setOutreachField(r.id, 'prospectSlug', e.target.value)} placeholder="Slug" />
                    </div>
                  ) : <>{r.prospect}<div className="sub">{r.positionYear}</div></>}</td>
                  <td>{isEditingOutreach ? <input type="date" value={String(d.dateSent || '')} onChange={e => setOutreachField(r.id, 'dateSent', e.target.value)} /> : r.dateSent}</td>
                  <td>{isEditingOutreach ? <input type="checkbox" checked={d.opened === true} onChange={e => setOutreachField(r.id, 'opened', e.target.checked)} /> : r.opened ? <span className="ok">&#10004;</span> : <span className="no">&ndash;</span>}</td>
                  <td>{isEditingOutreach ? <input type="checkbox" checked={d.viewed === true} onChange={e => setOutreachField(r.id, 'viewed', e.target.checked)} /> : r.viewed ? <span className="ok">&#10004;</span> : <span className="no">&ndash;</span>}</td>
                  <td>{isEditingOutreach ? <select value={String(d.response || '')} onChange={e => setOutreachField(r.id, 'response', e.target.value)}>{RESPONSES.filter(x => x !== 'All Responses').map(x => <option key={x}>{x}</option>)}</select> : <span className={`pill ${cls(r.response)}`}>{r.response.toUpperCase()}</span>}</td>
                  <td>{isEditingOutreach ? <select value={String(d.status || '')} onChange={e => setOutreachField(r.id, 'status', e.target.value)}>{STATUSES.filter(x => x !== 'All Statuses').map(x => <option key={x}>{x}</option>)}</select> : <span className={`pill st ${cls(r.status)}`}>{r.status.toUpperCase()}</span>}</td>
                  <td>
                    <div className="action-row" onClick={e => e.stopPropagation()}>
                      {isEditingOutreach ? (
                        <>
                          <button onClick={() => saveOutreach(r.id)} disabled={busyOutreach === r.id}>{busyOutreach === r.id ? 'Saving...' : 'Save'}</button>
                          <button className="ghost" onClick={() => setEditingOutreach('')}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startOutreachEdit(r)}>Edit</button>
                          <button className="ghost" onClick={() => copyCoachLink(r)}>Copy Coach Link</button>
                          <button className="ghost" onClick={() => sendCoachLink(r)} disabled={busyOutreach === `send-${r.id}`}>{busyOutreach === `send-${r.id}` ? 'Sending...' : 'Send Link'}</button>
                          <button className="danger" onClick={() => deleteOutreach(r)} disabled={busyOutreach === r.id}>{busyOutreach === r.id ? 'Deleting...' : 'Delete'}</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={10} className="empty">No outreach matches these filters.</td></tr>}
            </tbody>
          </table>
          <div className="count">Showing {filtered.length} of {outreachRows.length} entries</div>
        </div>

        {sel && (
          <aside className="detail">
            <div className="dhead">
              <h3 className="display">OUTREACH DETAILS</h3>
              <button onClick={() => setSel(null)}>&#10005;</button>
            </div>
            <div className="dschool">
              <div className="dname">{sel.school}</div>
              <div className="dsub">{sel.coach} &middot; {sel.coachRole}</div>
            </div>
            <table className="dtable"><tbody>
              <tr><td>Prospect</td><td>{sel.prospect}</td></tr>
              <tr><td>Coach Email</td><td>{sel.coachEmail || '-'}</td></tr>
              <tr><td>Position / Year</td><td>{sel.positionYear}</td></tr>
              <tr><td>Date Sent</td><td>{sel.dateSent}</td></tr>
              <tr><td>Email Status</td><td>{sel.opened ? 'Opened' : 'Not opened'}</td></tr>
              <tr><td>Profile Viewed</td><td>{sel.viewed ? 'Yes' : 'No'}</td></tr>
              <tr><td>Response</td><td><span className={`pill ${cls(sel.response)}`}>{sel.response.toUpperCase()}</span></td></tr>
              <tr><td>Status</td><td><span className={`pill st ${cls(sel.status)}`}>{sel.status.toUpperCase()}</span></td></tr>
            </tbody></table>
            <div className="dlabel">Notes from Coach</div>
            {editingOutreach === sel.id ? (
              <textarea className="detail-notes-input" value={String(outreachDraft[sel.id]?.notes || '')} onChange={e => setOutreachField(sel.id, 'notes', e.target.value)} />
            ) : (
              <p className="dnotes">{sel.notes || 'No notes yet.'}</p>
            )}
            {sel.activity.length > 0 && (
              <div className="activity-panel compact">
                <h4 className="display">ACTIVITY</h4>
                <ul className="activity-list">
                  {sel.activity.slice(0, 6).map((item, i) => (
                    <li key={`${item.date}-${i}`}>
                      <span>{new Date(item.date).toLocaleString()}</span>
                      <b>{item.message}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="action-row detail-actions">
              {editingOutreach === sel.id ? (
                <>
                  <button onClick={() => saveOutreach(sel.id)} disabled={busyOutreach === sel.id}>{busyOutreach === sel.id ? 'Saving...' : 'Save Details'}</button>
                  <button className="ghost" onClick={() => setEditingOutreach('')}>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => startOutreachEdit(sel)}>Edit Details</button>
                  <button className="ghost" onClick={() => copyCoachLink(sel)}>Copy Coach Link</button>
                  <button className="ghost" onClick={() => sendCoachLink(sel)} disabled={busyOutreach === `send-${sel.id}`}>{busyOutreach === `send-${sel.id}` ? 'Sending...' : 'Send Link'}</button>
                </>
              )}
            </div>
            {coachShareUrl(sel) && <a className="btn dbtn" href={coachShareUrl(sel)} target="_blank">VIEW COACH SHARE &#8599;</a>}
          </aside>
        )}
      </div>

      <div className="charts">
        <div className="chart-card">
          <h4 className="display">RESPONSE BREAKDOWN</h4>
          <div className="donut-wrap">
            <svg viewBox="0 0 42 42" className="donut">
              {segs.map(s => (
                <circle key={s.k} cx="21" cy="21" r="15.9" fill="transparent" stroke={colors[s.k]} strokeWidth="6"
                  strokeDasharray={`${(s.end - s.start) * 100} ${100 - (s.end - s.start) * 100}`}
                  strokeDashoffset={String(25 - s.start * 100)} />
              ))}
              <text x="21" y="21" textAnchor="middle" dominantBaseline="central" className="donut-num">{responded}</text>
            </svg>
            <ul className="legend">
              {breakdown.map(b => (
                <li key={b.k}><span style={{ background: colors[b.k] }} />{b.k} <b>{b.n}</b> ({Math.round((b.n / bdTotal) * 100)}%)</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="chart-card">
          <h4 className="display">RESPONSES OVER TIME</h4>
          {series.length > 1 ? (
            <svg viewBox="0 0 300 120" className="line">
              <polyline fill="none" stroke="#2BA84A" strokeWidth="2.5"
                points={series.map((p, i) => `${10 + (i * 280) / (series.length - 1)},${110 - (p.v / maxV) * 95}`).join(' ')} />
              {series.map((p, i) => (
                <circle key={p.d} cx={10 + (i * 280) / (series.length - 1)} cy={110 - (p.v / maxV) * 95} r="3" fill="#2BA84A" />
              ))}
            </svg>
          ) : <p className="empty">Not enough dated entries yet.</p>}
        </div>
        <div className="chart-card">
          <h4 className="display">TOP SCHOOLS CONTACTED</h4>
          <ul className="tops">
            {topSchools.map(([s, n]) => <li key={s}>{s}<b>{n}</b></li>)}
          </ul>
        </div>
      </div>
    </>
  );
}
