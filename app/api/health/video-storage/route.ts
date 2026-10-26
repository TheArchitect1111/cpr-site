import { NextResponse } from 'next/server';
import { getAdminSessionSecret } from '@/lib/admin-session-secret';
import { videoToken } from '@/lib/video-library/storage';

export const dynamic = 'force-dynamic';

// Temporary diagnostic: presence flags only. Never expose secret values.
export async function GET() {
  return NextResponse.json(
    { videoStorageReady: Boolean(videoToken() && getAdminSessionSecret()),
      existingBlobConnected: Boolean(videoToken()),
      adminEncryptionReady: Boolean(getAdminSessionSecret()) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
