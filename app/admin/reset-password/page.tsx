import '../../landing.css';
import '../admin.css';
import { site } from '@/config/site';

export const metadata = {
  title: 'Set Admin Password - CPR',
  robots: { index: false, follow: false },
};

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="login-shell">
      <form className="login-card" action="/api/admin/password-reset/complete" method="post">
        <img src={site.brand.logo} alt="CPR" />
        <h1 className="display">SET PASSWORD</h1>
        <p>Choose a new password for the CPR admin account. After saving, Mike can sign in with his admin email or username.</p>
        {params.error && <div className="login-error">The reset link is invalid, expired, or the password is too short.</div>}
        <input type="hidden" name="email" value={params.email || ''} />
        <input type="hidden" name="token" value={params.token || ''} />
        <label>New Password<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label>
        <label>Confirm Password<input name="confirm" type="password" autoComplete="new-password" minLength={10} required /></label>
        <button type="submit">Save Password</button>
        <a className="login-link" href="/admin/login">Back to sign in</a>
      </form>
    </main>
  );
}
