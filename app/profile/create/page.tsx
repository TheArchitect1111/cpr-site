import Link from 'next/link';
import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { PLAYER_APPLICATION_URL } from '@/config/site';
import ProfileCheckoutButton from './ProfileCheckoutButton';
import './profile-create.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create Your Player Profile | CPR Global Prospects',
  description: 'Create a coach-visible CPR player profile for $75.',
};

export default async function CreateProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === 'string' ? params.session_id : '';
  const cancelled = params.status === 'cancelled';

  if (sessionId && stripe) {
    const session = await stripe.checkout.sessions.retrieve(sessionId).catch(() => null);
    if (session?.payment_status === 'paid' && session.metadata?.purchaseType === 'player-profile') {
      redirect(PLAYER_APPLICATION_URL);
    }
  }

  return (
    <main className="profile-purchase-shell">
      <section className="profile-purchase-card">
        <Link className="profile-purchase-back" href="/">Back to CPR</Link>
        <p className="profile-purchase-eyebrow">PLAYER PROFILE</p>
        <h1>Create a coach-visible profile</h1>
        <p className="profile-purchase-price">$75 one-time profile fee</p>
        <p className="profile-purchase-lead">
          Build a CPR player profile that coaches can view from the homepage. Add photos, uploaded media,
          player information, and text, then submit updates as your season progresses.
        </p>

        <div className="profile-purchase-details">
          <h2>What the profile includes</h2>
          <ul>
            <li>A public player profile highlighted for coach viewing</li>
            <li>Photos, uploaded media, and written player information</li>
            <li>A private way to submit profile updates for CPR review</li>
          </ul>
        </div>

        <div className="profile-purchase-note">
          <h2>Important</h2>
          <p>
            YouTube, Instagram, and X content will not appear on these profiles. Transcripts and detailed
            player records are not sent to coaches until the player begins CPR recruitment, signs the required
            fee agreement, and makes the first payment required by that agreement.
          </p>
          <p>The $75 profile fee does not include CPR recruitment services.</p>
        </div>

        {cancelled ? <p className="profile-purchase-error">Checkout was cancelled. No payment was made.</p> : null}
        <ProfileCheckoutButton />
        <p className="profile-purchase-secure">Secure payment powered by Stripe. After payment, you will continue to the player profile form.</p>
      </section>
    </main>
  );
}
