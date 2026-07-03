import type { Metadata } from 'next';
import CprOrbieLayer from '@/app/components/orbie/CprOrbieLayer';
import './globals.css';
import './components/orbie/orbie.css';

export const metadata: Metadata = {
  title: 'Canadian Prospects Recruitment · Global Recruiting for Student-Athletes',
  description: 'Canadian Prospects.ca has gone global. We help student-athletes worldwide get noticed by coaches and find the right school to compete and succeed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <CprOrbieLayer />
      </body>
    </html>
  );
}
