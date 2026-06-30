import '../../landing.css';
import '../admin.css';
import { site } from '@/config/site';

export const metadata = {
  title: 'Reset Admin Password - CPR',
  robots: { index: false, follow: false },
};

export default async function ForgotPassword({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="login-shell">
      <form className="login-card" action="/api/admin/password-reset/request" method="post">
        <img src={site.brand.logo} alt="CPR" />
        <h1 className="display">RESET PASSWORD</h1>
        <p>Enter Mike's admin email or username. If it matches a CPR admin account, a secure reset link will be sent to the account email.</p>
        {params.sent && <div className="login-success">If the account is configured, a reset link has been sent to the admin email.</div>}
        {params.error && <div className="login-error">Password reset is not fully configured. Run System Readiness in the admin portal or contact the site owner.</div>}
        <label>Email or Username<input name="email" type="text" autoComplete="username" required /></label>
        <button type="submit">Send Reset Link</button>
        <a className="login-link" href="/admin/login">Back to sign in</a>
      </form>
    </main>
  );
}
