import '../../landing.css';
import '../admin.css';
import { site } from '@/config/site';

export const metadata = {
  title: 'Admin Login · CPR',
  robots: { index: false, follow: false },
};

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; reset?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="login-shell">
      <form className="login-card" action="/api/admin/session" method="post">
        <img src={site.brand.logo} alt="CPR" />
        <h1 className="display">CPR ADMIN</h1>
        <p>Sign in with your admin account.</p>
        {params.reset && <div className="login-success">Password updated. Sign in with the new password.</div>}
        {params.error && <div className="login-error">Invalid email or password.</div>}
        <input type="hidden" name="next" value={params.next || '/admin'} />
        <label>Email<input name="email" type="email" autoComplete="username" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        <button type="submit">Sign In</button>
        <a className="login-link" href="/admin/forgot-password">Forgot password?</a>
      </form>
    </main>
  );
}
