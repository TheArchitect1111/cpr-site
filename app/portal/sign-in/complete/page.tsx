import PortalClerkCompleteClient from './PortalClerkCompleteClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Portal Sign In · CPR',
  robots: { index: false, follow: false },
};

export default function PortalClerkCompletePage() {
  return <PortalClerkCompleteClient />;
}
