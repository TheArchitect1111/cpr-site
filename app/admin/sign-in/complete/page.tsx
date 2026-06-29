'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import '../../../landing.css';
import '../../admin.css';

export default function AdminClerkComplete() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      window.location.href = '/admin/sign-in';
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/admin/clerk-bridge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (res.ok) {
          window.location.href = '/admin';
          return;
        }
        const json = await res.json().catch(() => ({}));
        if (!cancelled) setError(json.error || 'You are not authorized for admin access.');
      } catch {
        if (!cancelled) setError('Sign-in could not be completed. Please try again.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  return (
    <main className="login-shell">
      <div className="login-card" style={{ alignItems: 'center', textAlign: 'center' }}>
        <h1 className="display">SIGNING YOU IN</h1>
        {error ? (
          <>
            <div className="login-error">{error}</div>
            <a className="login-link" href="/admin/sign-in">Try a different account</a>
            <a className="login-link" href="/admin/login">Use password instead</a>
          </>
        ) : (
          <p>One moment while we confirm your access…</p>
        )}
      </div>
    </main>
  );
}
