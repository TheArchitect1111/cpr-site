'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core';
import { useCallback, useState } from 'react';
import './admin-calendar.css';

type Editor = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
  description: string;
};

const toLocalInput = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

function blankEditor(date = new Date()): Editor {
  const end = new Date(date.getTime() + 60 * 60 * 1000);
  return { id: '', title: '', start: toLocalInput(date), end: toLocalInput(end), allDay: false, location: '', description: '' };
}

export default function AdminSharedCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [range, setRange] = useState<{ start: Date; end: Date } | null>(null);
  const [message, setMessage] = useState('Loading shared calendar…');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (start: Date, end: Date) => {
    setMessage('Loading shared calendar…');
    try {
      const query = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() });
      const response = await fetch(`/api/admin/calendar?${query}`, { credentials: 'include', cache: 'no-store' });
      const payload = await response.json() as { configured?: boolean; events?: EventInput[]; message?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || 'Calendar could not be loaded.');
      setEvents(payload.events ?? []);
      setMessage(payload.configured === false ? payload.message || 'Calendar is not connected.' : '');
    } catch (error) {
      setEvents([]);
      setMessage(error instanceof Error ? error.message : 'Calendar could not be loaded.');
    }
  }, []);

  const onDates = useCallback((arg: DatesSetArg) => {
    setRange({ start: arg.start, end: arg.end });
    void load(arg.start, arg.end);
  }, [load]);

  function onDateClick(arg: DateClickArg) {
    setEditor(blankEditor(arg.date));
  }

  function onEventClick(arg: EventClickArg) {
    const event = arg.event;
    const start = event.start ?? new Date();
    const end = event.end ?? new Date(start.getTime() + 60 * 60 * 1000);
    setEditor({
      id: event.id,
      title: event.title,
      start: toLocalInput(start),
      end: toLocalInput(end),
      allDay: event.allDay,
      location: String(event.extendedProps.location || ''),
      description: String(event.extendedProps.description || ''),
    });
  }

  async function saveEvent() {
    if (!editor) return;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/calendar', {
        method: editor.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...editor, start: new Date(editor.start).toISOString(), end: new Date(editor.end).toISOString() }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Event could not be saved.');
      setEditor(null);
      if (range) await load(range.start, range.end);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Event could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function removeEvent() {
    if (!editor?.id || !window.confirm('Delete this calendar event?')) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/calendar?id=${encodeURIComponent(editor.id)}`, { method: 'DELETE', credentials: 'include' });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Event could not be deleted.');
      setEditor(null);
      if (range) await load(range.start, range.end);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Event could not be deleted.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-shared-calendar" aria-label="Manage CPR shared calendar">
      <div className="calendar-actions">
        <p>{message || 'Click a date to add an event. Click an event to edit it.'}</p>
        <button type="button" onClick={() => setEditor(blankEditor())}>+ Add event</button>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        buttonText={{ month: 'Month', week: 'Week', day: 'Day', today: 'Today' }}
        events={events}
        datesSet={onDates}
        dateClick={onDateClick}
        eventClick={onEventClick}
        selectable
        nowIndicator
        height="auto"
        dayMaxEvents={3}
      />

      {editor ? (
        <div className="calendar-editor-backdrop" role="presentation">
          <form className="calendar-editor" onSubmit={(event) => { event.preventDefault(); void saveEvent(); }}>
            <button className="calendar-editor-close" type="button" onClick={() => setEditor(null)} aria-label="Close">×</button>
            <p className="admin-kicker">{editor.id ? 'Edit event' : 'New event'}</p>
            <h2>{editor.id ? editor.title || 'Calendar event' : 'Add to shared calendar'}</h2>
            <label>Title<input required value={editor.title} onChange={(e) => setEditor({ ...editor, title: e.target.value })} /></label>
            <div className="calendar-editor-grid">
              <label>Starts<input required type="datetime-local" value={editor.start} onChange={(e) => setEditor({ ...editor, start: e.target.value })} /></label>
              <label>Ends<input required type="datetime-local" value={editor.end} onChange={(e) => setEditor({ ...editor, end: e.target.value })} /></label>
            </div>
            <label>Location<input value={editor.location} onChange={(e) => setEditor({ ...editor, location: e.target.value })} /></label>
            <label>Description<textarea rows={4} value={editor.description} onChange={(e) => setEditor({ ...editor, description: e.target.value })} /></label>
            <div className="calendar-editor-buttons">
              {editor.id ? <button className="danger" type="button" disabled={saving} onClick={() => void removeEvent()}>Delete</button> : null}
              <button type="button" onClick={() => setEditor(null)}>Cancel</button>
              <button className="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save event'}</button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
