import { NextResponse } from 'next/server';
import { videoStorageConfigured } from '@/lib/video-library/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    { videoStorageReady: videoStorageConfigured() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
