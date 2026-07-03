import '../landing.css';
import { isOpenStaging } from '@/lib/staging';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'CPR Staging Clone',
  robots: { index: false, follow: false },
};

const slug = 'jayden-thompson';

const links = [
  { label: 'Public CPR Website', href: '/', note: 'Current public site experience.' },
  { label: 'Admin Portal', href: '/admin', note: 'Open staging admin area with sample data.' },
  { label: 'Athlete Portal', href: `/portal/athlete/${slug}`, note: 'What the athlete sees.' },
  { label: 'Parent Portal', href: `/portal/parent/${slug}`, note: 'What the parent sees.' },
  {
    label: 'Admin Website Builder',
    href: '/admin?tab=website',
    note: 'Admin-only builder with client update approvals.',
  },
  {
    label: 'Athlete Update Request',
    href: `/portal/athlete/${slug}/updates`,
    note: 'Where the athlete requests website/profile changes.',
  },
];

export default function StagingPage() {
  const open = isOpenStaging();

  return (
    <main style={{
      minHeight: '100vh',
      background: '#f5f7fb',
      color: '#0d1829',
      padding: '48px 20px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <section style={{ maxWidth: 1040, margin: '0 auto' }}>
        <p style={{
          display: 'inline-flex',
          padding: '8px 12px',
          border: '1px solid #c9d7ee',
          borderRadius: 999,
          background: '#fff',
          color: '#244a82',
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 0.08,
          textTransform: 'uppercase',
        }}>
          CPR Staging Clone
        </p>
        <h1 className="display" style={{
          maxWidth: 820,
          margin: '18px 0 12px',
          fontSize: 'clamp(42px, 7vw, 86px)',
          lineHeight: 0.9,
        }}>
          Testing area for the CPR portal.
        </h1>
        <p style={{ maxWidth: 720, fontSize: 18, lineHeight: 1.6, color: '#40506a' }}>
          This is the no-login staging entry point for reviewing CPR before launch. Use these
          links to test the admin portal, athlete portal, parent portal, and admin-controlled
          Website Builder approval flow.
        </p>

        {!open && (
          <div style={{
            marginTop: 28,
            padding: 16,
            border: '1px solid #f1b6b6',
            background: '#fff4f4',
            color: '#8f1d1d',
            borderRadius: 8,
            fontWeight: 700,
          }}>
            Staging open mode is not enabled in this environment. Portal/admin routes may still
            require login here.
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
          marginTop: 32,
        }}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                minHeight: 132,
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 18,
                padding: 20,
                border: '1px solid #d9e2ef',
                borderRadius: 8,
                background: '#fff',
                color: '#0d1829',
                textDecoration: 'none',
                boxShadow: '0 14px 32px rgba(13,24,41,0.08)',
              }}
            >
              <span style={{ fontSize: 20, fontWeight: 800 }}>{link.label}</span>
              <span style={{ color: '#5a6a82', lineHeight: 1.45 }}>{link.note}</span>
              <span style={{ color: '#a4212b', fontWeight: 800 }}>Open</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
