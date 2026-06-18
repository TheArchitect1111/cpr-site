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
        <p>Enter the admin email. If it matches a CPR admin account, a reset link will be emailed.</p>
        {params.sent && <div className="login-success">Check your email for the reset link.</div>}
        {params.error && <div className="login-error">Could not send reset link. Contact the site owner.</div>}
        <label>Email<input name="email" type="email" autoComplete="username" required /></label>
        <button type="submit">Send Reset Link</button>
        <a className="login-link" href="/admin/login">Back to sign in</a>
      </form>
    </main>
  );
}
