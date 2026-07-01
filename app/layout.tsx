import type { Metadata, Viewport } from 'next';
import PwaController from '@/app/components/pwa/PwaController';
import { getPwaConfig, isPwaEnabled } from '@/lib/pwa/pwa-config';
import './globals.css';
import '../styles/ea-instant-feel/index.css';

const pwa = getPwaConfig();

export const metadata: Metadata = {
  title: 'CPR Global Prospects · Global Recruiting for Student-Athletes',
  description: 'CPR Global Prospects has gone global. We help student-athletes worldwide get noticed by coaches and find the right school to compete and succeed.',
  applicationName: pwa.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: pwa.shortName,
  },
  icons: {
    icon: '/cpr-logo.png',
    apple: '/cpr-logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: pwa.themeColor,
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pwaEnabled = isPwaEnabled();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        {pwaEnabled ? <PwaController appName={pwa.shortName} /> : null}
      </body>
    </html>
  );
}
