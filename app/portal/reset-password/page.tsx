import '../../landing.css';
import '../../admin/admin.css';
import { site } from '@/config/site';

export const metadata = {
  title: 'Set Portal Password · CPR',
  robots: { index: false, follow: false },
};

export default async function PortalResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ recordId?: string; role?: string; token?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="login-shell">
      <form className="login-card" action="/api/portal/password-reset/complete" method="post">
        <img src={site.brand.logo} alt="CPR" />
        <h1 className="display">SET NEW PASSWORD</h1>
        <p>Choose a new CPR portal password with at least 10 characters, including letters and numbers.</p>
        {params.error ? <div className="login-error">The reset link is invalid, expired, or the password does not meet requirements.</div> : null}
        <input type="hidden" name="recordId" value={params.recordId || ''} />
        <input type="hidden" name="role" value={params.role || ''} />
        <input type="hidden" name="token" value={params.token || ''} />
        <label>New Password<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label>
        <label>Confirm Password<input name="confirm" type="password" autoComplete="new-password" minLength={10} required /></label>
        <button type="submit">Save Password</button>
        <a className="login-link" href="/portal/login">Back to portal login</a>
      </form>
    </main>
  );
}
