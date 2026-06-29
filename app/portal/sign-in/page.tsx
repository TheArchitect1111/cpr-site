import '../../landing.css';
import '../login/portal-login.css';
import { SignIn } from '@clerk/nextjs';
import { site } from '@/config/site';

export const metadata = {
  title: 'Portal Sign In · CPR',
  robots: { index: false, follow: false },
};

export default function PortalClerkSignInPage() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

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

        <h2>Portal Sign In</h2>
        <p className="pl-sub">
          Sign in with Google or a one-time email link. Use the same email address CPR has on file for your family.
        </p>

        {clerkEnabled ? (
          <>
            <div style={{ display: 'grid', justifyItems: 'center', gap: 12 }}>
              <SignIn routing="hash" forceRedirectUrl="/portal/sign-in/complete" signUpUrl="/portal/sign-in" />
            </div>
            <div className="pl-footer">
              <a href="/portal/login">Use username and password instead</a>
            </div>
          </>
        ) : (
          <>
            <div className="pl-error">Google sign-in is not configured yet.</div>
            <div className="pl-footer">
              <a href="/portal/login">Go to password login</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
