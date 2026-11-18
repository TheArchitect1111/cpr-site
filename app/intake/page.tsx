import { redirect } from 'next/navigation';

/** Legacy /intake link continues into CPR's own player registration form. */
export default function IntakeRedirectPage() {
  redirect('/apply');
}
