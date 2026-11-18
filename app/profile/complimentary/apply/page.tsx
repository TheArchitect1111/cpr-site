import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CPR_PROFILE_WAIVER_COOKIE, findIssuedProfileWaiver } from '@/lib/profile-waiver-reconcile';
import ComplimentaryApplicationForm from './ComplimentaryApplicationForm';
import '../../create/profile-create.css';
import './complimentary.css';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Complimentary Player Profile Application | CPR',
  robots: { index: false, follow: false },
};

export default async function ComplimentaryApplicationPage() {
  const redemptionId = (await cookies()).get(CPR_PROFILE_WAIVER_COOKIE)?.value || '';
  const token = process.env.AIRTABLE_TOKEN || '';
  const waiver = token && redemptionId
    ? await findIssuedProfileWaiver({ redemptionId, token }).catch(() => null)
    : null;

  if (!waiver) redirect('/profile/create');

  return (
    <main className="profile-purchase-shell">
      <section className="profile-purchase-card complimentary-card">
        <Link className="profile-purchase-back" href="/profile/create">Back to CPR profiles</Link>
        <p className="profile-purchase-eyebrow">CPR GLOBAL PROSPECTS</p>
        <h1>Complete your player profile</h1>
        <p className="profile-purchase-price">Complimentary profile | $0</p>
        <p className="profile-purchase-lead">
          Your private CPR promotional code was accepted. Complete this form to submit your
          athlete information for CPR review. There is no payment for profile creation.
        </p>
        <ComplimentaryApplicationForm email={waiver.email} />
        <p className="profile-purchase-secure">
          The complimentary fee waiver does not include recruiting services or guarantee
          selection, admissions, scholarships, or placement.
        </p>
      </section>
    </main>
  );
}
