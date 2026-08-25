'use client';

import { useMemo, useState } from 'react';

type Opportunity = {
  id: string;
  name: string;
  stage: string;
  value: number;
  contact: string;
  nextAction: string;
};

type Task = {
  id: string;
  title: string;
  due: string;
  status: 'Open' | 'Completed';
};

const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Decision', 'Won'];

const initialOpportunities: Opportunity[] = [
  { id: 'opp-1', name: 'Parent inquiry follow-up', stage: 'New', value: 75, contact: 'Prospective family', nextAction: 'Reply today' },
  { id: 'opp-2', name: 'Recruiting service consultation', stage: 'Qualified', value: 750, contact: 'Prospective athlete', nextAction: 'Schedule consultation' },
  { id: 'opp-3', name: 'School partnership conversation', stage: 'Proposal', value: 2500, contact: 'Partner program', nextAction: 'Follow up on proposal' },
  { id: 'opp-4', name: 'Camp group registration', stage: 'Decision', value: 1200, contact: 'Club program', nextAction: 'Confirm roster and payment' },
];

const initialTasks: Task[] = [
  { id: 'task-1', title: 'Follow up with new parent inquiry', due: 'Today', status: 'Open' },
  { id: 'task-2', title: 'Confirm consultation time', due: 'Today', status: 'Open' },
  { id: 'task-3', title: 'Check proposal response', due: 'Tomorrow', status: 'Open' },
];

export default function AdminCRM() {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [tasks, setTasks] = useState(initialTasks);

  const openPipeline = useMemo(
    () => opportunities.filter((item) => !['Won', 'Lost'].includes(item.stage)),
    [opportunities],
  );
  const pipelineValue = openPipeline.reduce((sum, item) => sum + item.value, 0);
  const openTasks = tasks.filter((task) => task.status === 'Open');

  function moveOpportunity(id: string, stage: string) {
    setOpportunities((rows) => rows.map((row) => row.id === id ? { ...row, stage } : row));
  }

  function completeTask(id: string) {
    setTasks((rows) => rows.map((row) => row.id === id ? { ...row, status: 'Completed' } : row));
  }

  return (
    <section className="ea-crm-wrap">
      <style>{`
        .ea-crm-wrap{padding:22px;max-width:1500px;margin:0 auto;color:#171717}.ea-crm-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:20px}.ea-crm-head h1{font-size:32px;line-height:1;margin:0 0 8px}.ea-crm-head p{margin:0;color:#666}.ea-crm-badge{background:#111;color:#fff;padding:8px 12px;border-radius:999px;font-size:12px;font-weight:800}.ea-crm-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.ea-crm-metric{background:#fff;border:1px solid #e9e9e9;border-radius:16px;padding:18px;box-shadow:0 8px 24px rgba(0,0,0,.04)}.ea-crm-label{font-size:12px;color:#777;text-transform:uppercase;letter-spacing:.06em;font-weight:800}.ea-crm-value{font-size:30px;font-weight:900;margin-top:6px}.ea-crm-grid{display:grid;grid-template-columns:1.5fr .8fr;gap:16px}.ea-crm-card{background:#fff;border:1px solid #e9e9e9;border-radius:18px;padding:18px;box-shadow:0 8px 24px rgba(0,0,0,.04)}.ea-crm-card h2{margin:0 0 14px;font-size:18px}.ea-eva{background:linear-gradient(135deg,#111,#2b2b2b);color:#fff}.ea-eva p{color:#d8d8d8}.ea-eva-list{display:grid;gap:10px;margin-top:14px}.ea-eva-item{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);padding:12px;border-radius:12px}.ea-pipeline{display:grid;grid-template-columns:repeat(6,minmax(180px,1fr));gap:10px;overflow-x:auto;padding-bottom:4px}.ea-stage{background:#f7f7f7;border-radius:14px;padding:10px;min-height:220px}.ea-stage-title{display:flex;justify-content:space-between;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;margin-bottom:9px}.ea-opp{background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:12px;margin-bottom:9px}.ea-opp strong{display:block;font-size:14px;margin-bottom:5px}.ea-opp small{display:block;color:#777;margin-bottom:9px}.ea-opp select{width:100%;padding:7px;border:1px solid #ddd;border-radius:8px;background:#fff}.ea-task{display:flex;justify-content:space-between;gap:10px;align-items:center;border-top:1px solid #eee;padding:12px 0}.ea-task:first-of-type{border-top:0}.ea-task button{border:0;background:#111;color:#fff;padding:8px 10px;border-radius:8px;font-weight:700}.ea-task-complete{opacity:.45;text-decoration:line-through}.ea-crm-note{font-size:12px;color:#777;margin-top:14px}.ea-crm-section{margin-top:16px}@media(max-width:950px){.ea-crm-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.ea-crm-grid{grid-template-columns:1fr}.ea-crm-head{flex-direction:column}.ea-pipeline{grid-template-columns:repeat(6,220px)}}@media(max-width:520px){.ea-crm-wrap{padding:14px}.ea-crm-metrics{grid-template-columns:1fr 1fr}.ea-crm-value{font-size:24px}.ea-crm-head h1{font-size:27px}}
      `}</style>

      <div className="ea-crm-head">
        <div>
          <p className="admin-kicker">CPR Admin Portal</p>
          <h1>CRM &amp; Opportunity Center</h1>
          <p>Relationships, opportunities, follow-ups, and Eva next actions in one place.</p>
        </div>
        <span className="ea-crm-badge">EA CRM · Pilot</span>
      </div>

      <div className="ea-crm-metrics">
        <div className="ea-crm-metric"><div className="ea-crm-label">Open Opportunities</div><div className="ea-crm-value">{openPipeline.length}</div></div>
        <div className="ea-crm-metric"><div className="ea-crm-label">Pipeline Value</div><div className="ea-crm-value">${pipelineValue.toLocaleString()}</div></div>
        <div className="ea-crm-metric"><div className="ea-crm-label">Open Tasks</div><div className="ea-crm-value">{openTasks.length}</div></div>
        <div className="ea-crm-metric"><div className="ea-crm-label">Active Stages</div><div className="ea-crm-value">{new Set(openPipeline.map((item) => item.stage)).size}</div></div>
      </div>

      <div className="ea-crm-grid">
        <div className="ea-crm-card ea-eva">
          <h2>Eva · Next Best Actions</h2>
          <p>Eva scans the CRM for conversations and opportunities that need attention.</p>
          <div className="ea-eva-list">
            {openPipeline.slice(0, 3).map((item) => (
              <div className="ea-eva-item" key={item.id}>
                <strong>{item.nextAction}</strong><br />
                <span>{item.name} · {item.contact}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ea-crm-card">
          <h2>Today&apos;s Follow-ups</h2>
          {tasks.map((task) => (
            <div className={`ea-task${task.status === 'Completed' ? ' ea-task-complete' : ''}`} key={task.id}>
              <div><strong>{task.title}</strong><br /><small>{task.due}</small></div>
              {task.status === 'Open' && <button onClick={() => completeTask(task.id)}>Done</button>}
            </div>
          ))}
        </div>
      </div>

      <div className="ea-crm-card ea-crm-section">
        <h2>Opportunity Pipeline</h2>
        <div className="ea-pipeline">
          {stages.map((stage) => {
            const rows = opportunities.filter((item) => item.stage === stage);
            return (
              <div className="ea-stage" key={stage}>
                <div className="ea-stage-title"><span>{stage}</span><span>{rows.length}</span></div>
                {rows.map((item) => (
                  <div className="ea-opp" key={item.id}>
                    <strong>{item.name}</strong>
                    <small>{item.contact} · ${item.value.toLocaleString()}</small>
                    <select aria-label={`Move ${item.name}`} value={item.stage} onChange={(event) => moveOpportunity(item.id, event.target.value)}>
                      {stages.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div className="ea-crm-note">Pilot data is intentionally isolated from CPR production records. The UI is wired to the EA CRM contract and can switch to Frappe persistence without changing this experience.</div>
      </div>
    </section>
  );
}
