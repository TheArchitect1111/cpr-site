'use client';

import { useMemo, useState } from 'react';
import type {
  CommunicationAnnouncement,
  CommunicationCenterConfig,
  CommunicationFeedback,
  CommunicationMessage,
  CommunicationNotification,
} from './types';

type Tab = 'dashboard' | 'announcements' | 'messages' | 'feedback' | 'intelligence';

type Props = {
  config: CommunicationCenterConfig;
  messages: CommunicationMessage[];
  feedback: CommunicationFeedback[];
  announcements?: CommunicationAnnouncement[];
  notifications?: CommunicationNotification[];
  live?: boolean;
};

function formatDate(value: string) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function openAgeDays(feedback: CommunicationFeedback[]) {
  const open = feedback.filter(item => !['Resolved', 'Closed', 'Archived'].includes(item.status));
  if (!open.length) return 0;
  const oldest = open.reduce((min, item) => {
    const stamp = item.createdAt ? new Date(item.createdAt).getTime() : Date.now();
    return Math.min(min, stamp);
  }, Date.now());
  return Math.max(0, Math.floor((Date.now() - oldest) / (1000 * 60 * 60 * 24)));
}

function healthScore(messages: CommunicationMessage[], feedback: CommunicationFeedback[], announcements: CommunicationAnnouncement[]) {
  const unread = messages.filter(item => !item.read && item.sender !== 'Coach Mike').length;
  const openFeedback = feedback.filter(item => !['Resolved', 'Closed', 'Archived'].includes(item.status)).length;
  const published = announcements.filter(item => item.status === 'Published').length;
  const scheduled = announcements.filter(item => item.status === 'Scheduled').length;
  const agePenalty = Math.min(openAgeDays(feedback) * 3, 18);
  const score = 92 - unread * 4 - openFeedback * 5 - agePenalty + Math.min(published + scheduled, 6);
  return Math.max(40, Math.min(100, score));
}

function channelStatus() {
  return [
    { name: 'Portal', status: 'Connected', note: 'Available now' },
    { name: 'Email', status: 'Ready', note: 'Uses Resend when configured' },
    { name: 'SMS', status: 'Planned', note: 'Twilio connection later' },
    { name: 'Social', status: 'Planned', note: 'Amplifi connection later' },
  ];
}

export default function CommunicationCenter({
  config,
  messages,
  feedback,
  announcements = [],
  notifications = [],
  live = true,
}: Props) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [announcementList, setAnnouncementList] = useState(announcements);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [draft, setDraft] = useState({
    title: '',
    body: '',
    audience: 'All',
    channels: ['Portal'],
    recipientEmails: '',
    scheduledAt: '',
    pinned: false,
  });

  const threads = useMemo(() => {
    const grouped = new Map<string, CommunicationMessage[]>();
    messages.forEach(message => {
      const current = grouped.get(message.subjectId) || [];
      grouped.set(message.subjectId, [...current, message]);
    });
    return Array.from(grouped.entries()).map(([subjectId, items]) => ({
      subjectId,
      messages: items.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      unread: items.filter(item => !item.read && item.sender !== 'Coach Mike').length,
      last: items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0],
    }));
  }, [messages]);

  const metrics = useMemo(() => {
    const unread = messages.filter(item => !item.read && item.sender !== 'Coach Mike').length;
    const open = feedback.filter(item => !['Resolved', 'Closed', 'Archived'].includes(item.status)).length;
    const scheduled = announcementList.filter(item => item.status === 'Scheduled').length;
    return {
      unread,
      open,
      scheduled,
      health: healthScore(messages, feedback, announcementList),
      threads: threads.length,
      notifications: notifications.filter(item => !item.readAt).length,
    };
  }, [announcementList, feedback, messages, notifications, threads.length]);

  const priorityItems = [
    ...feedback
      .filter(item => !['Resolved', 'Closed', 'Archived'].includes(item.status))
      .slice(0, 3)
      .map(item => ({ label: `Resolve feedback: ${item.subject}`, meta: item.subjectId, tone: 'feedback' })),
    ...threads
      .filter(item => item.unread > 0)
      .slice(0, 3)
      .map(item => ({ label: `Reply to ${item.subjectId}`, meta: `${item.unread} unread`, tone: 'message' })),
  ].slice(0, 5);

  function setChannel(channel: string, checked: boolean) {
    setDraft(current => ({
      ...current,
      channels: checked
        ? Array.from(new Set([...current.channels, channel]))
        : current.channels.filter(item => item !== channel),
    }));
  }

  async function saveAnnouncement(publishNow: boolean) {
    setSaving(true);
    setFormMessage('');
    setFormError('');
    try {
      const res = await fetch('/api/admin/communication/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, publishNow }),
      });
      const data = await res.json() as { announcement?: CommunicationAnnouncement; error?: string };
      if (!res.ok || !data.announcement) {
        setFormError(data.error || 'Announcement could not be saved.');
        return;
      }
      setAnnouncementList(current => [data.announcement!, ...current]);
      setDraft({
        title: '',
        body: '',
        audience: 'All',
        channels: ['Portal'],
        recipientEmails: '',
        scheduledAt: '',
        pinned: false,
      });
      setFormMessage(publishNow ? 'Announcement published.' : data.announcement.status === 'Scheduled' ? 'Announcement scheduled.' : 'Announcement saved as draft.');
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function updateAnnouncement(id: string, action: 'publish' | 'archive') {
    setSaving(true);
    setFormMessage('');
    setFormError('');
    try {
      const res = await fetch('/api/admin/communication/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json() as { announcement?: CommunicationAnnouncement; error?: string };
      if (!res.ok || !data.announcement) {
        setFormError(data.error || 'Announcement could not be updated.');
        return;
      }
      setAnnouncementList(current => current.map(item => item.id === id ? data.announcement! : item));
      setFormMessage(action === 'publish' ? 'Announcement published.' : 'Announcement archived.');
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="comm-center"
      style={{
        '--comm-primary': config.primaryColor,
        '--comm-accent': config.accentColor,
      } as React.CSSProperties}
    >
      <header className="comm-hero">
        <div>
          <p className="comm-eyebrow">COMMUNICATION CENTER</p>
          <h1 className="display">{config.portalName}</h1>
          <p>Announcements, messages, feedback, notifications, and communication health in one place.</p>
        </div>
        <div className="comm-health">
          <span>Health</span>
          <strong>{metrics.health}%</strong>
        </div>
      </header>

      {!live && <div className="comm-alert">Sample data is showing. Connect Airtable to make this live.</div>}

      <nav className="comm-tabs" aria-label="Communication Center sections">
        {[
          ['dashboard', 'Dashboard'],
          ['announcements', 'Announcements'],
          ['messages', 'Messages'],
          ['feedback', 'Feedback'],
          ['intelligence', 'Intelligence'],
        ].map(([value, label]) => (
          <button key={value} className={tab === value ? 'active' : ''} onClick={() => setTab(value as Tab)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === 'dashboard' && (
        <div className="comm-grid">
          <div className="comm-metrics">
            <div><span>Unread</span><strong>{metrics.unread}</strong><small>messages</small></div>
            <div><span>Open</span><strong>{metrics.open}</strong><small>feedback</small></div>
            <div><span>Threads</span><strong>{metrics.threads}</strong><small>active</small></div>
            <div><span>Scheduled</span><strong>{metrics.scheduled}</strong><small>updates</small></div>
            <div><span>Unread</span><strong>{metrics.notifications}</strong><small>notifications</small></div>
          </div>

          <div className="comm-panel">
            <div className="comm-panel-head">
              <h2>Priority Queue</h2>
              <span>{priorityItems.length} items</span>
            </div>
            {priorityItems.length ? (
              <div className="comm-list">
                {priorityItems.map((item, index) => (
                  <article key={`${item.label}-${index}`} className={`comm-item ${item.tone}`}>
                    <b>{item.label}</b>
                    <span>{item.meta}</span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="comm-empty">No urgent communication items right now.</div>
            )}
          </div>

          <div className="comm-panel">
            <div className="comm-panel-head">
              <h2>Channel Status</h2>
              <span>Connect once</span>
            </div>
            <div className="comm-channels">
              {channelStatus().map(channel => (
                <div key={channel.name}>
                  <b>{channel.name}</b>
                  <span className={channel.status.toLowerCase()}>{channel.status}</span>
                  <small>{channel.note}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'announcements' && (
        <div className="comm-announcement-layout">
          <div className="comm-panel">
            <div className="comm-panel-head">
              <h2>Create Announcement</h2>
              <span>Portal and email ready</span>
            </div>
            <div className="comm-form">
              <label>
                Title
                <input
                  value={draft.title}
                  onChange={event => setDraft(current => ({ ...current, title: event.target.value }))}
                  placeholder="Event reminder, deadline, or update"
                  disabled={saving}
                />
              </label>
              <label>
                Message
                <textarea
                  value={draft.body}
                  onChange={event => setDraft(current => ({ ...current, body: event.target.value }))}
                  placeholder="Write the announcement here."
                  disabled={saving}
                />
              </label>
              <div className="comm-form-row">
                <label>
                  Audience
                  <select
                    value={draft.audience}
                    onChange={event => setDraft(current => ({ ...current, audience: event.target.value }))}
                    disabled={saving}
                  >
                    <option>All</option>
                    <option>Families</option>
                    <option>Athletes</option>
                    <option>Coaches</option>
                    <option>Staff</option>
                  </select>
                </label>
                <label>
                  Schedule
                  <input
                    type="datetime-local"
                    value={draft.scheduledAt}
                    onChange={event => setDraft(current => ({ ...current, scheduledAt: event.target.value }))}
                    disabled={saving}
                  />
                </label>
              </div>
              <div className="comm-checks" aria-label="Announcement channels">
                {['Portal', 'Email', 'SMS', 'Social'].map(channel => (
                  <label key={channel}>
                    <input
                      type="checkbox"
                      checked={draft.channels.includes(channel)}
                      onChange={event => setChannel(channel, event.target.checked)}
                      disabled={saving || channel === 'SMS' || channel === 'Social'}
                    />
                    {channel}
                    {(channel === 'SMS' || channel === 'Social') && <small>planned</small>}
                  </label>
                ))}
              </div>
              {draft.channels.includes('Email') && (
                <label>
                  Recipient emails
                  <textarea
                    value={draft.recipientEmails}
                    onChange={event => setDraft(current => ({ ...current, recipientEmails: event.target.value }))}
                    placeholder="email@example.com, parent@example.com"
                    disabled={saving}
                  />
                </label>
              )}
              <label className="comm-pin">
                <input
                  type="checkbox"
                  checked={draft.pinned}
                  onChange={event => setDraft(current => ({ ...current, pinned: event.target.checked }))}
                  disabled={saving}
                />
                Pin this announcement
              </label>
              {formMessage && <div className="comm-success">{formMessage}</div>}
              {formError && <div className="comm-error">{formError}</div>}
              <div className="comm-actions">
                <button type="button" onClick={() => saveAnnouncement(false)} disabled={saving || !draft.title.trim() || !draft.body.trim()}>
                  {draft.scheduledAt ? 'Schedule' : 'Save Draft'}
                </button>
                <button type="button" onClick={() => saveAnnouncement(true)} disabled={saving || !draft.title.trim() || !draft.body.trim()}>
                  Publish Now
                </button>
              </div>
            </div>
          </div>

          <div className="comm-panel">
            <div className="comm-panel-head">
              <h2>Announcements</h2>
              <span>{announcementList.length} total</span>
            </div>
            {announcementList.length ? (
              <div className="comm-list">
                {announcementList.map(item => (
                  <article key={item.id} className="comm-item announcement">
                    <b>{item.title}</b>
                    <p>{item.body}</p>
                    <span>{item.status} for {item.audience} through {item.channels.join(', ') || 'Portal'}</span>
                    {(item.scheduledAt || item.publishedAt || item.emailDeliveryStatus) && (
                      <small className="comm-delivery">
                        {item.scheduledAt ? `Scheduled ${formatDate(item.scheduledAt)}` : ''}
                        {item.publishedAt ? `Published ${formatDate(item.publishedAt)}` : ''}
                        {item.emailDeliveryStatus ? ` | Email: ${item.emailDeliveryStatus}` : ''}
                      </small>
                    )}
                    <div className="comm-item-actions">
                      {item.status !== 'Published' && item.status !== 'Archived' && (
                        <button type="button" onClick={() => updateAnnouncement(item.id, 'publish')} disabled={saving}>Publish</button>
                      )}
                      {item.status !== 'Archived' && (
                        <button type="button" onClick={() => updateAnnouncement(item.id, 'archive')} disabled={saving}>Archive</button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="comm-empty">No announcements yet. Create the first update.</div>
            )}
          </div>
        </div>
      )}

      {tab === 'messages' && (
        <div className="comm-panel">
          <div className="comm-panel-head">
            <h2>Messages</h2>
            <span>{threads.length} threads</span>
          </div>
          <div className="comm-list">
            {threads.map(thread => (
              <article key={thread.subjectId} className="comm-item message">
                <b>{thread.subjectId}</b>
                <p>{thread.last?.body || 'No message body'}</p>
                <span>{thread.last?.sender} at {formatDate(thread.last?.createdAt || '')}</span>
              </article>
            ))}
            {!threads.length && <div className="comm-empty">No messages yet.</div>}
          </div>
        </div>
      )}

      {tab === 'feedback' && (
        <div className="comm-panel">
          <div className="comm-panel-head">
            <h2>Feedback Center</h2>
            <span>{feedback.length} items</span>
          </div>
          <div className="comm-list">
            {feedback.map(item => (
              <article key={item.id} className="comm-item feedback">
                <b>{item.subject}</b>
                <p>{item.body}</p>
                <span>{item.status} from {item.subjectId} on {formatDate(item.createdAt)}</span>
              </article>
            ))}
            {!feedback.length && <div className="comm-empty">No feedback or support requests yet.</div>}
          </div>
        </div>
      )}

      {tab === 'intelligence' && (
        <div className="comm-panel">
          <div className="comm-panel-head">
            <h2>Communication Intelligence</h2>
            <span>V1 summary</span>
          </div>
          <div className="comm-intel">
            <div><b>{metrics.health}%</b><span>Communication health</span></div>
            <div><b>{metrics.unread}</b><span>Unread messages</span></div>
            <div><b>{openAgeDays(feedback)}</b><span>Oldest open feedback age in days</span></div>
            <div><b>{metrics.notifications}</b><span>Unread notifications</span></div>
            <div><b>{config.supportLabel || 'Support team'}</b><span>Primary responder</span></div>
          </div>
        </div>
      )}
    </section>
  );
}
