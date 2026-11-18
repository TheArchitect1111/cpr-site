import Link from 'next/link';
import { cookies } from 'next/headers';
import { CPR_PROFILE_WAIVER_COOKIE, findIssuedProfileWaiver } from '@/lib/profile-waiver-reconcile';
import AthleteApplicationForm from '@/app/profile/complimentary/apply/ComplimentaryApplicationForm';
import '../profile/create/profile-create.css';
import '../profile/complimentary/apply/complimentary.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Player Application | CPR Global Prospects',
  description: 'Apply for a CPR player profile directly on CPR Global Prospects.',
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const id = (await cookies()).get(CPR_PROFILE_WAIVER_COOKIE)?.value || '';
  const token = process.env.AIRTABLE_TOKEN || '';
  const waiver = id && token
    ? await findIssuedProfileWaiver({ redemptionId: id, token }).catch(() => null)
    : null;
  const complimentary = Boolean(waiver);
  const returnedFromCheckout = params.from === 'paypal';

  return (
    <main className="profile-purchase-shell">
      <section className="profile-purchase-card complimentary-card">
        <Link className="profile-purchase-back" href="/">Back to CPR</Link>
        <p className="profile-purchase-eyebrow">CPR GLOBAL PROSPECTS</p>
        <h1>Player application</h1>
        {complimentary ? (
          <>
            <p className="profile-purchase-price">Approved complimentary profile | $0</p>
            <p className="profile-purchase-lead">
              Your CPR promotional code is accepted. Complete the application below to
              save your player information and link the fee waiver to your registration.
            </p>
          </>
        ) : (
          <>
            <p className="profile-purchase-price">Player profile application</p>
            <p className="profile-purchase-lead">
              Apply directly through CPR. The standard player-profile creation fee is
              $100 unless CPR provides a complimentary code. Applications are reviewed
              before any profile is activated.
            </p>
            <p className="profile-purchase-secure">
              <Link href="/profile/create">Pay the $100 profile fee or use an approved complimentary code.</Link>
            </p>
          </>
        )}
        {returnedFromCheckout && !complimentary ? (
          <p className="profile-purchase-note" role="status">
            <strong>Returning from PayPal does not confirm payment.</strong>{' '}
            Complete your application below. CPR will verify the transaction separately
            before approving a paid profile.
          </p>
        ) : null}
        <AthleteApplicationForm email={waiver?.email} complimentary={complimentary} />
        <p className="profile-purchase-secure">
          CPR does not guarantee scholarships, college acceptance, placements, or roster spots.
          Recruitment services require a separate agreement.
        </p>
      </section>
    </main>
  );
}
