import { redirect } from 'next/navigation';
import { PLAYER_APPLICATION_URL } from '@/config/site';

/** Legacy intake URL — applications now use /apply. */
export default function IntakeRedirectPage() {
  redirect(PLAYER_APPLICATION_URL);
}
