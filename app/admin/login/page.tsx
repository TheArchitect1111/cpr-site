import '../../landing.css';
import '../../portal/login/portal-login.css';
import '../admin.css';

import MagicLinkForm from '@/app/components/auth/MagicLinkForm';
import AdminPasswordLoginForm from '@/app/components/auth/AdminPasswordLoginForm';
import { getAuthReadiness, magicLinkBlockedReason } from '@/lib/auth-config';
import { CPR_OWNER_EMAIL } from '@/lib/admin-owner';
import { site } from '@/config/site';

export const metadata = {
  title: 'Admin Login · CPR',
  robots: { index: false, follow: false },
};

function errorMessage(code?: string): string | null {
  switch (code) {
    case 'expired':
      return 'That login link expired. Request a new one below.';
    case 'unauthorized':
      return 'That email is not registered as a CPR admin. Ask the owner to add you.';
    case 'config':
      return 'Admin login is not configured. Set ADMIN_AUTH_SECRET on Vercel Production.';
    case 'locked':
      return 'Too many sign-in attempts. Wait a few minutes and try again.';
    default:
      return null;
  }
}

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; reset?: string; locked?: string }>;
}) {
  const params = await searchParams;
  const next = params.next?.startsWith('/admin') ? params.next : '/admin';
  const error = errorMessage(params.error) ?? (params.locked ? errorMessage('locked') : null);
  const readiness = getAuthReadiness();
  const magicBlocked = magicLinkBlockedReason();
  const passwordBlocked = !readiness.sessionSecret
    ? 'Password sign-in requires ADMIN_AUTH_SECRET on Vercel Production.'
    : null;

  return (
    <main className="login-shell">
      <div className="login-card">
        <img src={site.brand.logo} alt="CPR" />
        <h1 className="display">CPR ADMIN</h1>

        {params.reset ? (
          <div className="login-success">Password updated. Sign in below.</div>
        ) : null}
        {error ? <div className="login-error">{error}</div> : null}

        <p className="pl-sub" style={{ marginBottom: '1rem', textAlign: 'center' }}>
          Type <strong>{CPR_OWNER_EMAIL}</strong> in the email box below.
          Do not use a Google account dropdown — type your address manually.
        </p>

        <AdminPasswordLoginForm
          next={next}
          disabled={Boolean(passwordBlocked)}
          disabledReason={passwordBlocked}
        />

        <p className="pl-or" style={{ textAlign: 'center', margin: '1.25rem 0 0.5rem' }}>
          or
        </p>

        <MagicLinkForm
          realm="admin"
          next={next}
          title="Email login link"
          subtitle="Fastest way in — no password. We email you a one-tap sign-in link (expires in 15 minutes)."
          buttonLabel="Email me a login link"
          emailPlaceholder={CPR_OWNER_EMAIL}
          emailHint="Type your full email address (do not pick from a Google account list)."
        />

        {magicBlocked ? (
          <p className="login-error" style={{ marginTop: '1rem' }} role="alert">
            {magicBlocked}
          </p>
        ) : null}

        <a className="login-link" href="/admin/forgot-password" style={{ display: 'block', marginTop: '1rem', textAlign: 'center' }}>
          Forgot password?
        </a>
      </div>
    </main>
  );
}
