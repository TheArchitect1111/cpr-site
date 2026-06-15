'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '@/lib/sections-data';

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function initials(sender: string): string {
  if (sender === 'Coach Mike') return 'CM';
  if (sender === 'Athlete') return 'A';
  if (sender === 'Parent') return 'P';
  return sender.slice(0, 2).toUpperCase();
}

interface Props {
  portalType: 'athlete' | 'parent';
  initialMessages: Message[];
}

export default function MessagingSection({ portalType, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const selfSender = portalType === 'parent' ? 'Parent' : 'Athlete';
  const didMarkRead = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, []);

  const markRead = useCallback(() => {
    if (didMarkRead.current) return;
    const hasUnread = initialMessages.some((m) => !m.readStatus && m.sender !== selfSender);
    if (hasUnread) {
      didMarkRead.current = true;
      fetch('/api/messages', { method: 'PATCH' }).catch(() => {});
    }
  }, [initialMessages, selfSender]);

  useEffect(() => {
    markRead();
  }, [markRead]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageBody: trimmed }),
      });
      const data = (await res.json()) as { message?: Message; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Failed to send message.');
        return;
      }
      if (data.message) {
        setMessages((prev) => [...prev, data.message!]);
      }
      setBody('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (body.trim() && !sending) handleSend(e as unknown as React.FormEvent);
    }
  }

  return (
    <div>
      <div className="sec-card">
        <div className="sec-label">DIRECT MESSAGING</div>
        <h1 className="sec-heading">Messaging Center</h1>
        <p className="sec-sub">
          Send messages directly to the CPR team. Coach Mike typically responds within 1 business day.
        </p>

        {messages.length === 0 ? (
          <div className="sec-empty" style={{ marginBottom: 24 }}>
            <div className="sec-empty-icon">&#128172;</div>
            <p>No messages yet. Send the first message below.</p>
          </div>
        ) : (
          <div className="msg-thread">
            {messages.map((m) => {
              const isMine = m.sender === selfSender;
              return (
                <div key={m.id} className={`msg-row${isMine ? ' msg-mine' : ' msg-theirs'}`}>
                  <div className="msg-avatar">{initials(m.sender)}</div>
                  <div className="msg-inner">
                    <div className="msg-sender">{m.sender}</div>
                    <div className={`msg-bubble${isMine ? '' : ''}`}>{m.messageBody}</div>
                    <div className="msg-time">{formatTime(m.dateSent)}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="msg-compose">
          <div className="msg-compose-label">New Message</div>
          <form onSubmit={handleSend}>
            <div className="msg-compose-row">
              <textarea
                className="msg-textarea"
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={5000}
                disabled={sending}
              />
              <button type="submit" className="msg-send-btn" disabled={sending || !body.trim()}>
                {sending ? '...' : 'Send'}
              </button>
            </div>
            {error && <div className="msg-error">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
