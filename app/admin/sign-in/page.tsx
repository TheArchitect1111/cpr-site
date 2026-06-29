import '../../landing.css';
import '../admin.css';
import { SignIn } from '@clerk/nextjs';

export const metadata = {
  title: 'Admin Sign In · CPR',
  robots: { index: false, follow: false },
};

export default function AdminClerkSignIn() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="login-shell">
        <div className="login-card">
          <h1 className="display">SIGN IN UNAVAILABLE</h1>
          <p>Google sign-in is not configured yet. Use the password login.</p>
          <a className="login-link" href="/admin/login">Go to password login</a>
        </div>
      </main>
    );
  }

  return (
    <main className="login-shell">
      <div className="login-card" style={{ alignItems: 'center' }}>
        <h1 className="display">CPR ADMIN</h1>
        <p>Sign in with Google or a one-time email link. No password to remember.</p>
        <SignIn
          routing="hash"
          forceRedirectUrl="/admin/sign-in/complete"
          signUpUrl="/admin/sign-in"
        />
        <a className="login-link" href="/admin/login">Use password instead</a>
      </div>
    </main>
  );
}
