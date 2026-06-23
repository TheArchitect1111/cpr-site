import { NextRequest, NextResponse } from 'next/server';
import { adminFromRequest, changeAdminPassword } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const admin = adminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string; confirmPassword?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const currentPassword = String(body.currentPassword || '');
  const newPassword = String(body.newPassword || '');
  const confirmPassword = String(body.confirmPassword || '');

  if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'Please complete all fields and confirm your new password.' }, { status: 400 });
  }

  try {
    await changeAdminPassword(admin.email, currentPassword, newPassword);
    return NextResponse.json({ ok: true, message: 'Password updated successfully.' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to update password.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
