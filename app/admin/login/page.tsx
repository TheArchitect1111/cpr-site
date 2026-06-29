import { redirect } from 'next/navigation';
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
  searchParams: Promise<{
    error?: string;
    next?: string;
    reset?: string;
    locked?: string;
    retry?: string;
    config?: string;
    recover?: string;
  }>;
}) {
  const params = await searchParams;
  const retryMinutes = params.retry ? Math.max(1, Math.ceil(Number(params.retry) / 60)) : 15;
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  // Google is the one and only front door. The email/password form below is an
  // emergency backstop only — reachable at /admin/login?recover=1, never shown
  // to Mike during a normal sign-in.
  if (clerkEnabled && !params.recover) {
    const next = params.next ? `?next=${encodeURIComponent(params.next)}` : '';
    redirect(`/admin/sign-in${next}`);
  }

  return (
    <main className="login-shell">
      <form className="login-card" action="/api/admin/session" method="post">
        <img src={site.brand.logo} alt="CPR" />
        <h1 className="display">CPR ADMIN</h1>
        <p>Emergency password sign-in. The normal way in is <a className="login-link" href="/admin/sign-in">Sign in with Google</a>.</p>
        {params.reset && <div className="login-success">Password updated. Sign in with the new password.</div>}
        {params.config && (
          <div className="login-error">
            Admin session signing is not configured. Set ADMIN_AUTH_SECRET (or ADMIN_PASSWORD) on Vercel Production.
          </div>
        )}
        {params.locked && <div className="login-error">Too many failed attempts. Try again in about {retryMinutes} minutes.</div>}
        {params.error && !params.locked && !params.config && (
          <div className="login-error">Invalid email or password.</div>
        )}
        <input type="hidden" name="next" value={params.next || '/admin'} />
        <label>Email<input name="email" type="email" autoComplete="username" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        <button type="submit">Sign In</button>
        <a className="login-link" href="/admin/forgot-password">Forgot password?</a>
      </form>
    </main>
  );
}
