import { NextRequest, NextResponse } from 'next/server';
import { setAdminTempPassword, findAdminAccount } from '@/lib/admin-auth';
import { validatePasswordStrength } from '@/lib/password-policy';

export const dynamic = 'force-dynamic';

/**
 * Emergency owner recovery when locked out of admin.
 * Requires EMERGENCY_RECOVERY_KEY on Vercel (openssl rand -hex 32).
 * Use once to set Mike's password, then rotate or remove the key.
 *
 * curl -X POST https://<site>/api/admin/recovery \
 *   -H "Content-Type: application/json" \
 *   -H "x-recovery-key: <key>" \
 *   -d '{"email":"mike@...","tempPassword":"...","name":"Mike"}'
 */
export async function POST(req: NextRequest) {
  const expected = process.env.EMERGENCY_RECOVERY_KEY?.trim();
  if (!expected) {
    return NextResponse.json({ error: 'Emergency recovery is not enabled.' }, { status: 503 });
  }

  const provided = req.headers.get('x-recovery-key')?.trim();
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let body: { email?: string; tempPassword?: string; name?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const tempPassword = String(body.tempPassword || '');
  const name = String(body.name || 'Admin').trim();

  if (!email) return NextResponse.json({ error: 'email is required.' }, { status: 400 });
  const validation = validatePasswordStrength(tempPassword);
  if (!validation.ok) return NextResponse.json({ error: validation.message }, { status: 400 });

  const account = await findAdminAccount(email);
  if (!account && !process.env.ADMIN_EMAIL && !process.env.ADMIN_USERS) {
    return NextResponse.json(
      { error: 'Email is not a known admin. Set ADMIN_EMAIL or add to ADMIN_USERS first.' },
      { status: 400 },
    );
  }

  try {
    await setAdminTempPassword(email, tempPassword, name || account?.name || 'Admin');
    return NextResponse.json({
      ok: true,
      email,
      message: 'Temporary password set. Sign in at /admin/login with email + password, then change it under Account Settings.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Recovery failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
