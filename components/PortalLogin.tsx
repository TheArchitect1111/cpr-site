'use client';

import { useMemo, useState } from 'react';
import { useClerk, useSignIn, useSignUp } from '@clerk/nextjs';

interface PortalLoginProps {
  clientName: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  welcomeMessage?: string;
  portalId: string;
}

type View = 'sign-in' | 'register' | 'forgot-password' | 'forgot-username' | 'verify-email';
type Errors = Record<string, string>;

const socialButtons = [
  { label: 'Apple', strategy: 'oauth_apple' },
  { label: 'Google', strategy: 'oauth_google' },
] as const;

function getErrorMessage(error: unknown) {
  const clerkError = error as { errors?: Array<{ message?: string; longMessage?: string }>; message?: string };
  return clerkError.errors?.[0]?.longMessage || clerkError.errors?.[0]?.message || clerkError.message || 'Something went wrong. Please try again.';
}

function isSocialPasswordError(message: string) {
  const text = message.toLowerCase();
  return text.includes('password') || text.includes('oauth') || text.includes('social') || text.includes('google') || text.includes('apple');
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm font-medium text-red-600">{message}</p>;
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      {hidden ? (
        <>
          <path d="M4 4l16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M3.4 12.2C5.2 8.9 8.3 7 12 7c3.7 0 6.8 1.9 8.6 5.2-.6 1.1-1.4 2.1-2.3 2.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M3.4 12.2C5.2 8.9 8.3 7 12 7c3.7 0 6.8 1.9 8.6 5.2C18.8 15.5 15.7 17.4 12 17.4c-3.7 0-6.8-1.9-8.6-5.2z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12.2" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </>
      )}
    </svg>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-base text-slate-950 outline-none transition focus:border-[var(--portal-accent)] focus:ring-4 focus:ring-[color:var(--portal-accent-soft)]"
        />
        <button
          type="button"
          onClick={() => setShow(current => !current)}
          className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-slate-500"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <EyeIcon hidden={!show} />
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}

function PortalIllustration({ portalId, accentColor }: { portalId: string; accentColor: string }) {
  const label = portalId ? portalId.slice(0, 2).toUpperCase() : 'EA';

  return (
    <svg viewBox="0 0 320 210" role="img" aria-label="Portal access illustration" className="h-full w-full max-w-[300px]">
      <rect x="38" y="28" width="244" height="154" rx="32" fill="rgba(255,255,255,0.2)" />
      <rect x="64" y="50" width="192" height="112" rx="24" fill="rgba(255,255,255,0.92)" />
      <circle cx="106" cy="92" r="26" fill={accentColor} opacity="0.95" />
      <text x="106" y="100" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff">{label}</text>
      <rect x="146" y="74" width="70" height="10" rx="5" fill="#D7DEE8" />
      <rect x="146" y="96" width="94" height="10" rx="5" fill="#E8EEF6" />
      <rect x="82" y="134" width="156" height="12" rx="6" fill={accentColor} opacity="0.24" />
      <circle cx="268" cy="62" r="18" fill="rgba(255,255,255,0.38)" />
      <circle cx="54" cy="152" r="15" fill="rgba(255,255,255,0.26)" />
    </svg>
  );
}

function SocialButtons({
  loading,
  error,
  onSocial,
}: {
  loading: boolean;
  error?: string;
  onSocial: (strategy: 'oauth_apple' | 'oauth_google') => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or continue with
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {socialButtons.map(button => (
          <button
            key={button.strategy}
            type="button"
            onClick={() => onSocial(button.strategy)}
            disabled={loading}
            className="flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {button.label}
          </button>
        ))}
      </div>
      <FieldError message={error} />
    </div>
  );
}

export default function PortalLogin({
  clientName,
  logoUrl,
  primaryColor,
  accentColor,
  welcomeMessage,
  portalId,
}: PortalLoginProps) {
  const { signIn, isLoaded: signInLoaded, setActive } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const clerk = useClerk();
  const [view, setView] = useState<View>('sign-in');
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialResetMessage, setSocialResetMessage] = useState(false);
  const [values, setValues] = useState({
    identifier: '',
    password: '',
    fullName: '',
    email: '',
    registerPassword: '',
    confirmPassword: '',
    resetEmail: '',
    usernameEmail: '',
    verificationCode: '',
  });

  const resolvedWelcome = welcomeMessage || `Welcome back, ${clientName}`;
  const canUseClerk = signInLoaded && signUpLoaded;
  const style = useMemo(() => ({
    '--portal-primary': primaryColor,
    '--portal-accent': accentColor,
    '--portal-accent-soft': `${accentColor}24`,
  }) as React.CSSProperties, [primaryColor, accentColor]);

  function update(key: keyof typeof values, value: string) {
    setValues(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: '' }));
    setSuccess('');
  }

  function switchView(nextView: View) {
    setView(nextView);
    setErrors({});
    setSuccess('');
    setSocialResetMessage(false);
  }

  async function handleSocial(strategy: 'oauth_apple' | 'oauth_google') {
    if (!canUseClerk || !signIn) return;
    setLoading(true);
    setErrors({});

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (error) {
      setErrors({ social: getErrorMessage(error) });
      setLoading(false);
    }
  }

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    if (!canUseClerk || !signIn) return;
    const nextErrors: Errors = {};
    if (!values.identifier.trim()) nextErrors.identifier = 'Enter your email or username.';
    if (!values.password) nextErrors.password = 'Enter your password.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const result = await signIn.create({ identifier: values.identifier.trim(), password: values.password });
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        await clerk.redirectToAfterSignIn();
        return;
      }
      setErrors({ form: 'More verification is needed. Check your email or use a social sign-in option.' });
    } catch (error) {
      setErrors({ password: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    if (!canUseClerk || !signUp) return;
    const nextErrors: Errors = {};
    if (!values.fullName.trim()) nextErrors.fullName = 'Enter your full name.';
    if (!values.email.trim()) nextErrors.email = 'Enter your email.';
    if (!values.registerPassword) nextErrors.registerPassword = 'Create a password.';
    if (values.registerPassword !== values.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    const [firstName, ...rest] = values.fullName.trim().split(/\s+/);

    try {
      const result = await signUp.create({
        emailAddress: values.email.trim(),
        password: values.registerPassword,
        firstName,
        lastName: rest.join(' ') || undefined,
        unsafeMetadata: { portalId, clientName },
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        await clerk.redirectToAfterSignUp();
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      switchView('verify-email');
      setSuccess('Check your email for a verification code.');
    } catch (error) {
      setErrors({ email: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyEmail(event: React.FormEvent) {
    event.preventDefault();
    if (!canUseClerk || !signUp) return;
    if (!values.verificationCode.trim()) {
      setErrors({ verificationCode: 'Enter the code from your email.' });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: values.verificationCode.trim() });
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        await clerk.redirectToAfterSignUp();
        return;
      }
      setErrors({ verificationCode: 'That code did not complete registration. Try again.' });
    } catch (error) {
      setErrors({ verificationCode: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(event: React.FormEvent) {
    event.preventDefault();
    if (!canUseClerk || !signIn) return;
    if (!values.resetEmail.trim()) {
      setErrors({ resetEmail: 'Enter your email.' });
      return;
    }

    setLoading(true);
    setErrors({});
    setSocialResetMessage(false);
    try {
      await signIn.create({
        identifier: values.resetEmail.trim(),
        strategy: 'reset_password_email_code',
      });
      setSuccess('Check your email for a reset link.');
    } catch (error) {
      const message = getErrorMessage(error);
      if (isSocialPasswordError(message)) {
        setSocialResetMessage(true);
      } else {
        setErrors({ resetEmail: message });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotUsername(event: React.FormEvent) {
    event.preventDefault();
    if (!values.usernameEmail.trim()) {
      setErrors({ usernameEmail: 'Enter your email.' });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const response = await fetch('/api/auth/forgot-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.usernameEmail.trim(), portalId, clientName }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to send username.');
      setSuccess('Check your email for your username.');
    } catch (error) {
      setErrors({ usernameEmail: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={style} className="min-h-screen bg-[color:var(--portal-primary)] md:grid md:place-items-center md:bg-slate-100 md:p-6">
      <section className="mx-auto min-h-screen w-full max-w-[420px] overflow-hidden bg-white shadow-2xl md:min-h-[820px] md:rounded-[36px]">
        <div className="relative grid h-[40vh] min-h-[310px] place-items-center overflow-hidden px-8 pb-14 text-white" style={{ background: `linear-gradient(145deg, ${primaryColor}, ${accentColor})` }}>
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 30% 20%, #fff 0, transparent 34%), radial-gradient(circle at 86% 78%, #fff 0, transparent 28%)' }} />
          <PortalIllustration portalId={portalId} accentColor={accentColor} />
          <div className="absolute bottom-5 left-6 right-6 text-center">
            <div className="mx-auto mb-3 grid h-20 w-20 place-items-center overflow-hidden rounded-[28px] border border-white/30 bg-white p-3 shadow-xl">
              <img src={logoUrl} alt={`${clientName} logo`} className="max-h-full max-w-full object-contain" />
            </div>
            <h1 className="text-balance text-2xl font-extrabold leading-tight">{resolvedWelcome}</h1>
          </div>
        </div>

        <div className="-mt-8 min-h-[60vh] rounded-t-[42px] bg-white px-6 pb-8 pt-10 shadow-[0_-24px_60px_rgba(15,23,42,0.14)]">
          {view === 'sign-in' && (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950">Login</h2>
                <p className="mt-1 text-sm text-slate-500">Access your portal.</p>
              </div>
              <div>
                <input value={values.identifier} onChange={event => update('identifier', event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-[var(--portal-accent)] focus:ring-4 focus:ring-[color:var(--portal-accent-soft)]" placeholder="Email or username" autoComplete="username" />
                <FieldError message={errors.identifier} />
              </div>
              <PasswordInput id="sign-in-password" value={values.password} onChange={value => update('password', value)} placeholder="Password" autoComplete="current-password" error={errors.password} />
              <FieldError message={errors.form} />
              <button type="submit" disabled={loading || !canUseClerk} className="h-12 w-full rounded-2xl text-base font-extrabold text-white shadow-lg transition disabled:opacity-60" style={{ background: accentColor }}>{loading ? 'Signing in...' : 'Sign In'}</button>
              <SocialButtons loading={loading} error={errors.social} onSocial={handleSocial} />
              <div className="space-y-2 text-center text-sm font-semibold">
                <button type="button" onClick={() => switchView('register')} className="text-slate-700">Do not have an account? Register</button>
                <div className="flex justify-center gap-4">
                  <button type="button" onClick={() => switchView('forgot-password')} className="text-slate-500">Forgot password?</button>
                  <button type="button" onClick={() => switchView('forgot-username')} className="text-slate-500">Forgot username?</button>
                </div>
              </div>
            </form>
          )}

          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950">Sign up</h2>
                <p className="mt-1 text-sm text-slate-500">Create your portal account.</p>
              </div>
              <div>
                <input value={values.fullName} onChange={event => update('fullName', event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-[var(--portal-accent)] focus:ring-4 focus:ring-[color:var(--portal-accent-soft)]" placeholder="Full name" autoComplete="name" />
                <FieldError message={errors.fullName} />
              </div>
              <div>
                <input type="email" value={values.email} onChange={event => update('email', event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-[var(--portal-accent)] focus:ring-4 focus:ring-[color:var(--portal-accent-soft)]" placeholder="Email" autoComplete="email" />
                <FieldError message={errors.email} />
              </div>
              <PasswordInput id="register-password" value={values.registerPassword} onChange={value => update('registerPassword', value)} placeholder="Password" autoComplete="new-password" error={errors.registerPassword} />
              <PasswordInput id="confirm-password" value={values.confirmPassword} onChange={value => update('confirmPassword', value)} placeholder="Confirm password" autoComplete="new-password" error={errors.confirmPassword} />
              <button type="submit" disabled={loading || !canUseClerk} className="h-12 w-full rounded-2xl text-base font-extrabold text-white shadow-lg transition disabled:opacity-60" style={{ background: accentColor }}>{loading ? 'Creating...' : 'Create Account'}</button>
              <SocialButtons loading={loading} error={errors.social} onSocial={handleSocial} />
              <div className="text-center text-sm font-semibold">
                <button type="button" onClick={() => switchView('sign-in')} className="text-slate-700">Already have an account? Sign In</button>
              </div>
            </form>
          )}

          {view === 'verify-email' && (
            <form onSubmit={handleVerifyEmail} className="space-y-5">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950">Verify email</h2>
                <p className="mt-1 text-sm text-slate-500">Enter the code sent to your email.</p>
              </div>
              {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</p>}
              <div>
                <input value={values.verificationCode} onChange={event => update('verificationCode', event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-[var(--portal-accent)] focus:ring-4 focus:ring-[color:var(--portal-accent-soft)]" placeholder="Verification code" autoComplete="one-time-code" />
                <FieldError message={errors.verificationCode} />
              </div>
              <button type="submit" disabled={loading || !canUseClerk} className="h-12 w-full rounded-2xl text-base font-extrabold text-white shadow-lg transition disabled:opacity-60" style={{ background: accentColor }}>{loading ? 'Verifying...' : 'Verify Account'}</button>
              <button type="button" onClick={() => switchView('sign-in')} className="mx-auto block text-sm font-semibold text-slate-500">Back to Sign In</button>
            </form>
          )}

          {view === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950">Reset password</h2>
                <p className="mt-1 text-sm text-slate-500">Enter the email on your account.</p>
              </div>
              {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</p>}
              {socialResetMessage && <p className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">Your account uses Google or Apple sign-in. No password is needed. Use that button below to access your account.</p>}
              <div>
                <input type="email" value={values.resetEmail} onChange={event => update('resetEmail', event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-[var(--portal-accent)] focus:ring-4 focus:ring-[color:var(--portal-accent-soft)]" placeholder="Email" autoComplete="email" />
                <FieldError message={errors.resetEmail} />
              </div>
              <button type="submit" disabled={loading || !canUseClerk} className="h-12 w-full rounded-2xl text-base font-extrabold text-white shadow-lg transition disabled:opacity-60" style={{ background: accentColor }}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
              <SocialButtons loading={loading} error={errors.social} onSocial={handleSocial} />
              <button type="button" onClick={() => switchView('sign-in')} className="mx-auto block text-sm font-semibold text-slate-500">Back to Sign In</button>
            </form>
          )}

          {view === 'forgot-username' && (
            <form onSubmit={handleForgotUsername} className="space-y-5">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950">Find username</h2>
                <p className="mt-1 text-sm text-slate-500">Enter the email on your account.</p>
              </div>
              {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</p>}
              <div>
                <input type="email" value={values.usernameEmail} onChange={event => update('usernameEmail', event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-[var(--portal-accent)] focus:ring-4 focus:ring-[color:var(--portal-accent-soft)]" placeholder="Email" autoComplete="email" />
                <FieldError message={errors.usernameEmail} />
              </div>
              <button type="submit" disabled={loading} className="h-12 w-full rounded-2xl text-base font-extrabold text-white shadow-lg transition disabled:opacity-60" style={{ background: accentColor }}>{loading ? 'Sending...' : 'Send My Username'}</button>
              <button type="button" onClick={() => switchView('sign-in')} className="mx-auto block text-sm font-semibold text-slate-500">Back to Sign In</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
