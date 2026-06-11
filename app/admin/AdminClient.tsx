'use client';
import { useMemo, useState } from 'react';
import type { Outreach } from '@/lib/outreach';

const RESPONSES = ['All Responses', 'Interested', 'Maybe', 'Not Interested', 'Follow Up', 'No Response'];
const STATUSES = ['All Statuses', 'Active', 'Pending', 'Closed', 'Waiting'];
const cls = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '-');

export default function AdminClient({ rows }: { rows: Outreach[] }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(STATUSES[0]);
  const [resp, setResp] = useState(RESPONSES[0]);
  const [sel, setSel] = useState<Outreach | null>(null);

  const filtered = useMemo(() => rows.filter(r => {
    const text = `${r.school} ${r.coach} ${r.prospect}`.toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (status !== STATUSES[0] && r.status !== status) return false;
    if (resp !== RESPONSES[0] && r.response !== resp) return false;
    return true;
  }), [rows, q, status, resp]);

  const sent = rows.length;
  const opened = rows.filter(r => r.opened).length;
  const viewed = rows.filter(r => r.viewed).length;
  const responded = rows.filter(r => r.response && r.response !== 'No Response').length;
  const interested = rows.filter(r => r.response === 'Interested').length;
  const followUps = rows.filter(r => r.response === 'Follow Up').length;
  const pct = (n: number) => (sent ? Math.round((n / sent) * 100) : 0);

  const breakdown = ['Interested', 'Maybe', 'Not Interested', 'No Response'].map(k => ({
    k, n: rows.filter(r => (k === 'No Response' ? !r.response || r.response === 'No Response' || r.response === 'Follow Up' && false : r.response === k)).length,
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
    rows.forEach(r => { if (r.dateSent) m.set(r.dateSent, (m.get(r.dateSent) || 0) + (r.response && r.response !== 'No Response' ? 1 : 0)); });
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows]);
  const series = useMemo(() => {
    const out: { d: string; v: number }[] = [];
    byDate.reduce((acc, [d, n]) => { const v = acc + n; out.push({ d, v }); return v; }, 0);
    return out;
  }, [byDate]);
  const maxV = Math.max(1, ...series.map(p => p.v));

  const topSchools = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach(r => m.set(r.school, (m.get(r.school) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [rows]);

  const stats = [
    { k: 'OUTREACH SENT', v: sent, s: 'All time' },
    { k: 'OPENED', v: opened, s: `${pct(opened)}%` },
    { k: 'VIEWED PROFILE', v: viewed, s: `${pct(viewed)}%` },
    { k: 'RESPONSES', v: responded, s: `${pct(responded)}%` },
    { k: 'INTERESTED', v: interested, s: `${pct(interested)}%` },
    { k: 'FOLLOW UPS', v: followUps, s: 'Pending' },
  ];

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

      <div className={`work ${sel ? 'with-panel' : ''}`}>
        <div className="table-wrap">
          <div className="filters">
            <input placeholder="Search by school, coach or prospect..." value={q} onChange={e => setQ(e.target.value)} />
            <select value={status} onChange={e => setStatus(e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
            <select value={resp} onChange={e => setResp(e.target.value)}>{RESPONSES.map(s => <option key={s}>{s}</option>)}</select>
          </div>
          <table className="otable">
            <thead><tr><th>School</th><th>Coach</th><th>Prospect</th><th>Date Sent</th><th>Opened</th><th>Viewed</th><th>Response</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className={sel === r ? 'selrow' : ''} onClick={() => setSel(r)}>
                  <td className="bold">{r.school}</td>
                  <td>{r.coach}<div className="sub">{r.coachRole}</div></td>
                  <td>{r.prospect}<div className="sub">{r.positionYear}</div></td>
                  <td>{r.dateSent}</td>
                  <td>{r.opened ? <span className="ok">&#10004;</span> : <span className="no">&ndash;</span>}</td>
                  <td>{r.viewed ? <span className="ok">&#10004;</span> : <span className="no">&ndash;</span>}</td>
                  <td><span className={`pill ${cls(r.response)}`}>{r.response.toUpperCase()}</span></td>
                  <td><span className={`pill st ${cls(r.status)}`}>{r.status.toUpperCase()}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="empty">No outreach matches these filters.</td></tr>}
            </tbody>
          </table>
          <div className="count">Showing {filtered.length} of {rows.length} entries</div>
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
              <tr><td>Position / Year</td><td>{sel.positionYear}</td></tr>
              <tr><td>Date Sent</td><td>{sel.dateSent}</td></tr>
              <tr><td>Email Status</td><td>{sel.opened ? 'Opened' : 'Not opened'}</td></tr>
              <tr><td>Profile Viewed</td><td>{sel.viewed ? 'Yes' : 'No'}</td></tr>
              <tr><td>Response</td><td><span className={`pill ${cls(sel.response)}`}>{sel.response.toUpperCase()}</span></td></tr>
              <tr><td>Status</td><td><span className={`pill st ${cls(sel.status)}`}>{sel.status.toUpperCase()}</span></td></tr>
            </tbody></table>
            {sel.notes && (<><div className="dlabel">Notes from Coach</div><p className="dnotes">{sel.notes}</p></>)}
            {sel.prospectSlug && <a className="btn dbtn" href={`/athletes/${sel.prospectSlug}`} target="_blank">VIEW ATHLETE PROFILE &#8599;</a>}
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
