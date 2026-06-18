import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { isAdminAuthed } from '@/lib/admin-auth';
import { verifyAthleteEditToken } from '@/lib/athletes';

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-|-$/g, '') || 'upload';
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file');
  const recordId = String(form.get('recordId') || '');
  const token = String(form.get('token') || '');
  const kind = String(form.get('kind') || 'file').replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'file';

  const authed = isAdminAuthed(req) || (recordId && token && verifyAthleteEditToken(recordId, token));
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: 'File must be 25 MB or smaller.' }, { status: 400 });

  try {
    const pathname = `cpr/${recordId || 'admin'}/${kind}/${Date.now()}-${safeName(file.name)}`;
    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (err) {
    console.error('Upload failed:', err);
    return NextResponse.json({ error: 'Upload failed. Check Vercel Blob configuration.' }, { status: 502 });
  }
}
