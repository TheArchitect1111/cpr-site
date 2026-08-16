import { notFound } from 'next/navigation';
import { campIsFull, campRegistrationCount, findPublicCamp } from '@/lib/camp-registration';
import CampRegistrationForm from './CampRegistrationForm';
import '../../../landing.css';

export const dynamic = 'force-dynamic';

export default async function CampRegistrationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const camp = await findPublicCamp(id);
  if (!camp) notFound();
  const registered = await campRegistrationCount(id);
  const full = campIsFull(camp, registered);
  const details = [camp.startDate, camp.location, camp.ageGroup, camp.price].filter(Boolean).map(String).join(' · ');

  return (
    <main className="subpage camp-registration-page">
      <section className="subpage-hero">
        <div className="container">
          <p className="eyebrow">CPR CAMP REGISTRATION</p>
          <h1 className="display">{camp.name}</h1>
          <p>{details}</p>
          <a href="/camps" className="subpage-back">← BACK TO CAMPS</a>
        </div>
      </section>
      <section className="section">
        <div className="container camp-registration-shell">
          {full ? <div className="camp-registration-complete"><h2 className="display">CAMP FULL</h2><p>This camp has reached its registration capacity.</p></div> : <CampRegistrationForm campId={id} campName={String(camp.name)} paymentUrl={String(camp.paymentUrl || '')} waiverText={String(camp.waiverText || '')} />}
        </div>
      </section>
    </main>
  );
}
