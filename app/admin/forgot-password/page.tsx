import '../../landing.css';
import '../admin.css';
import { passwordResetBlockedReason } from '@/lib/auth-config';
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
  const configBlock = passwordResetBlockedReason();

  let errorMessage = '';
  if (params.error === 'config') {
    errorMessage = configBlock || 'Password reset is not available. Use Email me a login link on the sign-in page.';
  } else if (params.error === 'email') {
    errorMessage = 'We found your account but could not send the email. Check RESEND_API_KEY and RESEND_FROM_EMAIL on Vercel.';
  } else if (params.error) {
    errorMessage = 'Could not send reset link. Try the email login link on the sign-in page instead.';
  }

  return (
    <main className="login-shell">
      <form className="login-card" action="/api/admin/password-reset/request" method="post">
        <img src={site.brand.logo} alt="CPR" />
        <h1 className="display">RESET PASSWORD</h1>
        <p>Enter the admin email. If it matches a CPR admin account, a reset link will be emailed.</p>

        {configBlock && !params.sent ? (
          <div className="login-error" role="alert">{configBlock}</div>
        ) : null}

        {params.sent && <div className="login-success">Check your email for the reset link.</div>}
        {errorMessage ? <div className="login-error">{errorMessage}</div> : null}

        <label>
          Email
          <input name="email" type="email" autoComplete="username" required disabled={Boolean(configBlock)} />
        </label>
        <button type="submit" disabled={Boolean(configBlock)}>Send Reset Link</button>
        <a className="login-link" href="/admin/login">Back to sign in</a>
        <p className="pl-sub" style={{ marginTop: '1rem' }}>
          Prefer no password? On the sign-in page, use <strong>Email me a login link</strong> — works even when password reset is unavailable.
        </p>
      </form>
    </main>
  );
}
