import { NextRequest, NextResponse } from 'next/server';
import { adminFromRequest, setAdminTempPassword } from '@/lib/admin-auth';
import { createAdminTeamMember, listAdminTeamMembers } from '@/lib/admin-team';
import { validatePasswordStrength } from '@/lib/password-policy';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = adminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (admin.role !== 'owner' && admin.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await listAdminTeamMembers();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const admin = adminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (admin.role !== 'owner') {
    return NextResponse.json({ error: 'Only the owner can add admin users.' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim();
  const password = String(body.password || '');
  const role = String(body.role || 'admin').trim();

  if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  const validation = validatePasswordStrength(password);
  if (!validation.ok) return NextResponse.json({ error: validation.message }, { status: 400 });

  try {
    const member = await createAdminTeamMember({ email, name, password, role });
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not create admin user.' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const admin = adminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (admin.role !== 'owner') {
    return NextResponse.json({ error: 'Only the owner can set temporary passwords.' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim() || 'Admin';
  const tempPassword = String(body.tempPassword || '');

  if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  const validation = validatePasswordStrength(tempPassword);
  if (!validation.ok) return NextResponse.json({ error: validation.message }, { status: 400 });

  try {
    await setAdminTempPassword(email, tempPassword, name);
    return NextResponse.json({
      ok: true,
      message: `Temporary password set for ${email}. They can sign in now and change it under Account Settings.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not set temporary password.' },
      { status: 500 },
    );
  }
}
