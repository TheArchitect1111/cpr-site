import '../../../portal.css';
import { getAthlete } from '@/lib/athletes';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import SharedCalendar from '@/app/portal/components/SharedCalendar';

export const dynamic = 'force-dynamic';

export default async function AthleteCalendarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await getAthlete(slug))) notFound();

  return (
    <PortalSubpageLayout portalType="athlete" slug={slug} active="home">
      <div className="section-heading">
        <span className="section-eyebrow">Calendar</span>
        <h1>Shared calendar</h1>
        <p>Appointments, deadlines, events, and reminders in one place.</p>
      </div>
      <SharedCalendar />
    </PortalSubpageLayout>
  );
}
