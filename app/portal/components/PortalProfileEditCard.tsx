import type { AthleteAdmin } from '@/lib/athletes';

export default function PortalProfileEditCard({ athlete }: { athlete?: AthleteAdmin }) {
  if (!athlete?.editToken) return null;
  const editUrl = `/profile/edit?id=${encodeURIComponent(athlete.id)}&token=${encodeURIComponent(athlete.editToken)}`;

  return (
    <section className="account-card">
      <p className="pp-section-eyebrow">Player Profile</p>
      <h1>Edit player profile</h1>
      <p>
        Add, replace, or remove the profile photo. Enter and update name, bio, school, contact,
        strengths, and film links. CPR reviews family submissions before they appear on the public
        recruiting page.
      </p>
      <a className="account-primary-link" href={editUrl}>Edit player profile</a>
    </section>
  );
}
