import '../../landing.css';
import './profile-edit.css';
import { getAthleteByRecordId, verifyAthleteEditToken } from '@/lib/athletes';
import { site } from '@/config/site';
import AthleteProfileEditor from './AthleteProfileEditor';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Athlete Profile · CPR Global Prospects',
  robots: { index: false, follow: false },
};

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>;
}) {
  const params = await searchParams;
  const id = params.id || '';
  const token = params.token || '';
  const authed = id && token && verifyAthleteEditToken(id, token);
  const athlete = authed ? await getAthleteByRecordId(id) : null;

  return (
    <main className="profile-edit-shell">
      <header className="edit-top">
        <a href="/">
          <img src={site.brand.logo} alt="CPR Global Prospects" />
        </a>
        <div className="display">
          <div className="brand-red">{site.brand.nameLine1}</div>
          <div>{site.brand.nameLine2}</div>
        </div>
      </header>

      {!athlete ? (
        <section className="edit-card edit-message">
          <h1 className="display">PROFILE LINK NOT AVAILABLE</h1>
          <p>
            This edit link is missing, expired, or invalid. Contact CPR to receive a fresh private
            profile edit link.
          </p>
          <a className="btn" href={`mailto:${site.footer.email}?subject=CPR profile edit link request`}>
            REQUEST A NEW LINK
          </a>
        </section>
      ) : (
        <AthleteProfileEditor athlete={athlete} token={token} />
      )}
    </main>
  );
}
