'use client';

import { useState } from 'react';
import { serverSendAdminMessage } from './actions';
import type { Message } from '@/lib/sections-data';

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

interface Props {
  messages: Message[];
  live: boolean;
}

export default function AdminMessages({ messages, live }: Props) {
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

  return (
    <>
      <header className="ahead">
        <div>
          <h1 className="display">MESSAGING CENTER</h1>
          <p>{slugs.length} athlete {slugs.length === 1 ? 'thread' : 'threads'}</p>
        </div>
        {!live && <span className="demo-pill">SAMPLE DATA &middot; connect Airtable to go live</span>}
      </header>

      <div className="work with-panel">
        <div className="table-wrap">
          <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 14 }}>
            Select an athlete to view their thread and reply.
          </p>
          {slugs.length === 0 && <div className="empty">No messages yet.</div>}
          {slugs.map((slug) => {
            const lastMsg = threadMap[slug]?.slice(-1)[0];
            const unread = unreadCount(slug);
            return (
              <div
                key={slug}
                className={`admin-slug-section`}
                style={{ cursor: 'pointer', marginBottom: 10 }}
                onClick={() => setActiveSlug(activeSlug === slug ? null : slug)}
              >
                <div className="admin-slug-head">
                  <div>
                    <div className="admin-slug-name">{slug}</div>
                    {lastMsg && (
                      <div className="admin-slug-count" style={{ marginTop: 2 }}>
                        Last: {lastMsg.sender} at {formatTime(lastMsg.dateSent)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {unread > 0 && (
                      <span style={{ background: 'var(--red)', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
                        {unread} unread
                      </span>
                    )}
                    <span style={{ color: 'var(--gray)', fontSize: 13 }}>
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
                          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isCoach ? 'flex-end' : 'flex-start' }}>
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
        </div>
      </div>
    </>
  );
}
