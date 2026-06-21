import { redirect } from 'next/navigation';

/** Legacy intake URL — applications now use /apply. */
export default function IntakeRedirectPage() {
  redirect('/apply');
}
