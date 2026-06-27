import { redirect } from 'next/navigation';
import { PLAYER_APPLICATION_URL } from '@/config/site';

export default function ApplyRedirectPage() {
  redirect(PLAYER_APPLICATION_URL);
}
