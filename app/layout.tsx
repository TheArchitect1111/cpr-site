import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'CPR Global Prospects · Global Recruiting for Student-Athletes',
  description: 'CPR Global Prospects has gone global. We help student-athletes worldwide get noticed by coaches and find the right school to compete and succeed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const page = (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return publishableKey ? <ClerkProvider publishableKey={publishableKey}>{page}</ClerkProvider> : page;
}
