'use client';

import { useState } from 'react';
import { serverSendAdminMessage } from './actions';
import type { Message } from '@/lib/sections-data';

function ChassisPageHeader({ title, description, actions }: { title: string; description: React.ReactNode; actions?: React.ReactNode }) {
  return <header className="ea-page-header"><div><h1>{title}</h1><p>{description}</p></div>{actions}</header>;
}

function ChassisDemoPill({ children }: { children: React.ReactNode }) {
  return <span className="demo-pill">{children}</span>;
}

function ChassisWorkspace({ children, withPanel }: { children: React.ReactNode; withPanel?: boolean }) {
  return <div className={withPanel ? 'ea-workspace with-panel' : 'ea-workspace'}>{children}</div>;
}

function ChassisTableSurface({ children }: { children: React.ReactNode }) {
  return <section className="ea-table-surface">{children}</section>;
}

function ChassisEmptyState({ children }: { children: React.ReactNode }) {
  return <div className="ea-empty-state">{children}</div>;
}

function ChassisStatusBadge({ children }: { tone?: string; children: React.ReactNode }) {
  return <span className="ea-status-badge">{children}</span>;
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

interface Props {
  messages: Message[];
  live: boolean;
  showHeader?: boolean;
}

export default function AdminMessages({ messages, live, showHeader = true }: Props) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const slugs = Array.from(new Set(messages.map((m) => m.athleteSlug))).sort();

  const threadMap: Record<string, Message[]> = {};
  for (const m of messages) {
    if (!threadMap[m.athleteSlug]) threadMap[m.athleteSlug] = [];
    threadMap[m.athleteSlug].push(m);
  }
  for (const slug of slugs) {
    threadMap[slug].sort((a, b) => (a.dateSent > b.dateSent ? 1 : -1));
  }

  const unreadCount = (slug: string) =>
    (threadMap[slug] ?? []).filter((m) => !m.readStatus && m.sender !== 'Athlete' && m.sender !== 'Parent').length;

  const currentThread = activeSlug ? (threadMap[activeSlug] ?? []) : [];
  const toggleThread = (slug: string) => setActiveSlug(activeSlug === slug ? null : slug);

  return (
    <>
      {showHeader && (
        <ChassisPageHeader
          title="MESSAGING CENTER"
          description={`${slugs.length} athlete ${slugs.length === 1 ? 'thread' : 'threads'}`}
          actions={!live && <ChassisDemoPill>SAMPLE DATA &middot; connect production data to go live</ChassisDemoPill>}
        />
      )}

      <ChassisWorkspace withPanel>
        <ChassisTableSurface>
          <p className="ea-chassis-intro">Select an athlete to view their thread and reply.</p>
          {slugs.length === 0 && (
            <ChassisEmptyState>
              No action needed right now. Recommended next step: use announcements only when there is a clear decision or update to share.
            </ChassisEmptyState>
          )}
          {slugs.map((slug) => {
            const lastMsg = threadMap[slug]?.slice(-1)[0];
            const unread = unreadCount(slug);
            return (
              <div
                key={slug}
                className="admin-slug-section"
                role="button"
                tabIndex={0}
                aria-expanded={activeSlug === slug}
                onClick={() => toggleThread(slug)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleThread(slug);
                  }
                }}
              >
                <div className="admin-slug-head">
                  <div>
                    <div className="admin-slug-name">{slug}</div>
                    {lastMsg && <div className="admin-slug-count">Last: {lastMsg.sender} at {formatTime(lastMsg.dateSent)}</div>}
                  </div>
                  <div className="admin-thread-status">
                    {unread > 0 && (
                      <ChassisStatusBadge tone="not-interested">
                        {unread} unread
                      </ChassisStatusBadge>
                    )}
                    <span className="admin-thread-caret">
                      {activeSlug === slug ? '&#9650;' : '&#9660;'}
                    </span>
                  </div>
                </div>

                {activeSlug === slug && (
                  <div className="admin-slug-body" onClick={(e) => e.stopPropagation()}>
                    <div className="admin-thread-wrap">
                      {currentThread.map((m) => {
                        const isCoach = m.sender === 'Coach Mike';
                        return (
                          <div key={m.id} className={isCoach ? 'admin-thread-line is-coach' : 'admin-thread-line'}>
                            <div className={`admin-thread-bubble ${isCoach ? 'admin-right' : 'admin-left'}`}>
                              <div className="admin-thread-meta">{m.sender} &middot; {formatTime(m.dateSent)}</div>
                              {m.messageBody}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <form className="admin-reply-form" action={serverSendAdminMessage}>
                      <input type="hidden" name="slug" value={slug} />
                      <input
                        type="text"
                        name="messageBody"
                        className="admin-reply-input"
                        placeholder="Reply as Coach Mike..."
                        required
                      />
                      <button type="submit" className="admin-reply-btn">Send</button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </ChassisTableSurface>
      </ChassisWorkspace>
    </>
  );
}
