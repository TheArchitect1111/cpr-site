'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core';
import { useCallback, useState } from 'react';
import './shared-calendar.css';

type CalendarResponse = {
  configured?: boolean;
  events?: EventInput[];
  message?: string;
  error?: string;
};

export default function SharedCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [message, setMessage] = useState('Loading shared calendar…');
  const [selected, setSelected] = useState<{
    title: string;
    when: string;
    location?: string;
    description?: string;
  } | null>(null);

  const loadRange = useCallback(async (range: DatesSetArg) => {
    setMessage('Loading shared calendar…');
    try {
      const query = new URLSearchParams({
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      });
      const response = await fetch(`/api/portal/calendar?${query}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const payload = (await response.json()) as CalendarResponse;
      if (!response.ok) {
        setEvents([]);
        setMessage(payload.error || 'The shared calendar could not be loaded.');
        return;
      }
      setEvents(payload.events ?? []);
      setMessage(payload.configured === false ? payload.message || 'Calendar not connected.' : '');
    } catch {
      setEvents([]);
      setMessage('The shared calendar could not be loaded.');
    }
  }, []);

  function openEvent(arg: EventClickArg) {
    const event = arg.event;
    const when = event.start
      ? event.start.toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: event.allDay ? undefined : 'short',
        })
      : 'Date unavailable';
    setSelected({
      title: event.title,
      when,
      location: event.extendedProps.location,
      description: event.extendedProps.description,
    });
  }

  return (
    <section className="shared-calendar" aria-label="CPR shared calendar">
      {message ? <p className="shared-calendar-status" role="status">{message}</p> : null}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{ month: 'Month', week: 'Week', day: 'Day', today: 'Today' }}
        events={events}
        datesSet={loadRange}
        eventClick={openEvent}
        nowIndicator
        height="auto"
        dayMaxEvents={3}
      />

      {selected ? (
        <div className="shared-calendar-detail" role="dialog" aria-modal="true" aria-label={selected.title}>
          <button type="button" onClick={() => setSelected(null)} aria-label="Close event details">×</button>
          <p className="shared-calendar-eyebrow">Calendar event</p>
          <h2>{selected.title}</h2>
          <p>{selected.when}</p>
          {selected.location ? <p>{selected.location}</p> : null}
          {selected.description ? <p>{selected.description}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
