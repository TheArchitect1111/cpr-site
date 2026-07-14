import '../../landing.css';

import './portal-login.css';

import MagicLinkForm from '@/app/components/auth/MagicLinkForm';
import { CPR_OWNER_EMAIL } from '@/lib/admin-owner';
import { magicLinkBlockedReason } from '@/lib/auth-config';

import { site } from '@/config/site';



export const metadata = {

  title: 'Athlete & Parent Portal Login | CPR',

  robots: { index: false, follow: false },

};



function errorMessage(code?: string): string | null {

  switch (code) {

    case 'expired':

      return 'That login link expired. Request a new one below.';

    case 'unauthorized':

      return 'No portal account matches that email. Use the email from your welcome message.';

    case 'config':

      return 'Portal login is not configured. Contact CPR support.';

    default:

      return null;

  }

}



export default async function PortalLoginPage({

  searchParams,

}: {

  searchParams: Promise<{ error?: string }>;

}) {

  const params = await searchParams;

  const error = errorMessage(params.error);
  const magicBlocked = magicLinkBlockedReason();



  return (

    <div className="pl-page">

      <div className="pl-card">

        <div className="pl-logo">

          <img src={site.brand.logo} alt="CPR" />

          <div className="pl-brand">

            <div className="b1 display">CPR GLOBAL PROSPECTS</div>

            <div className="b2 display">RECRUITMENT</div>

          </div>

        </div>



        {error ? <div className="pl-error" role="alert">{error}</div> : null}



        <MagicLinkForm

          realm="portal"

          title="Portal sign in"

          subtitle="Athletes and parents: enter the email from your welcome message. We will send a one-tap login link — no password needed."

          buttonLabel="Email me a login link"

        />



        {magicBlocked ? (
          <p className="pl-error" style={{ marginTop: '1rem' }} role="alert">
            {magicBlocked}
          </p>
        ) : null}

        <p className="pl-sub" style={{ marginTop: '1rem', textAlign: 'center' }}>
          CPR staff: use <a href="/admin/login">admin login</a> with {CPR_OWNER_EMAIL}.
        </p>



        <div className="pl-footer">

          <a href="/">Back to CPR homepage</a>

        </div>

      </div>

    </div>

  );

}

