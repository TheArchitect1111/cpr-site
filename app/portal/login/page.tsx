import '../../landing.css';

import './portal-login.css';

import MagicLinkForm from '@/app/components/auth/MagicLinkForm';

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

          subtitle="Athletes and parents: enter your email on file. We will send a one-tap login link — no password needed."

          buttonLabel="Email me a login link"

        />



        <div className="pl-footer">

          <a href="/">Back to CPR homepage</a>

        </div>

      </div>

    </div>

  );

}

