import '../../landing.css';
import '../../admin/admin.css';
import { site } from '@/config/site';

export const metadata = {
  title: 'Forgot Portal Password · CPR',
  robots: { index: false, follow: false },
};

export default async function PortalForgotPassword({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="login-shell">
      <form className="login-card" action="/api/portal/password-reset/request" method="post">
        <img src={site.brand.logo} alt="CPR" />
        <h1 className="display">RESET PORTAL PASSWORD</h1>
        <p>Enter your portal username or email address. If a matching athlete or parent account exists, we will email a reset link.</p>
        {params.sent ? <div className="login-success">If an account matches, check your email for the reset link.</div> : null}
        {params.error ? <div className="login-error">Could not send reset link. Please try again or contact CPR support.</div> : null}
        <label>Username or Email<input name="identifier" type="text" autoComplete="username" required /></label>
        <button type="submit">Send Reset Link</button>
        <a className="login-link" href="/portal/login">Back to portal login</a>
      </form>
    </main>
  );
}
