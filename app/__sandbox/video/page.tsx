import { notFound } from 'next/navigation';
import VideoLibraryClient from '@/app/admin/VideoLibraryClient';

export const dynamic = 'force-dynamic';

/**
 * Local CI-only harness. The flag is set solely for a disposable Playwright
 * process; this page is a 404 on preview/production without that flag.
 * All Blob and admin API operations are mocked by Playwright in the browser.
 */
export default function VideoUploadSandboxPage() {
  if (process.env.CPR_SANDBOX_VIDEO_E2E !== '1') notFound();
  return <VideoLibraryClient storageConfigured={true} initialVideos={[]} />;
}
