'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import '../../login/portal-login.css';

export default function PortalClerkCompleteClient() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      window.location.href = '/portal/sign-in';
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/portal/clerk-bridge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const json = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          type?: string;
          slug?: string;
          error?: string;
        };
        if (res.ok && json.ok && json.type && json.slug) {
          window.location.href = `/portal/${json.type}/${json.slug}`;
          return;
        }
        if (!cancelled) {
          setError(json.error || 'No portal account matches that email. Try password login or contact CPR.');
        }
      } catch {
        if (!cancelled) setError('Sign-in could not be completed. Please try again.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  return (
    <div className="pl-page">
      <div className="pl-card" style={{ textAlign: 'center' }}>
        <h2>Signing you in</h2>
        {error ? (
          <>
            <div className="pl-error">{error}</div>
            <div className="pl-footer">
              <a href="/portal/sign-in">Try a different account</a>
              <span aria-hidden="true"> · </span>
              <a href="/portal/login">Use password instead</a>
            </div>
          </>
        ) : (
          <p className="pl-sub">One moment while we match your email to your portal…</p>
        )}
      </div>
    </div>
  );
}
