import { redirect } from 'next/navigation';

/** Legacy complimentary link; the same on-site form now serves all applicants. */
export default function ComplimentaryApplicationRedirect() {
  redirect('/apply');
}
