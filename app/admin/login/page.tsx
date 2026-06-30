import '../../landing.css';
import '../../portal/login/portal-login.css';
import '../admin.css';

import MagicLinkForm from '@/app/components/auth/MagicLinkForm';
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
    default:
      return null;
  }
}

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next?.startsWith('/admin') ? params.next : '/admin';
  const error = errorMessage(params.error);

  return (
    <main className="login-shell">
      <div className="login-card">
        <img src={site.brand.logo} alt="CPR" />
        <h1 className="display">CPR ADMIN</h1>
        {error ? <div className="login-error">{error}</div> : null}
        <MagicLinkForm
          realm="admin"
          next={next}
          title="Admin sign in"
          subtitle="Enter the email on your admin account. We will email you a one-tap login link."
          buttonLabel="Email me a login link"
        />
        <a className="login-link" href="/admin/forgot-password">Need password recovery?</a>
      </div>
    </main>
  );
}
