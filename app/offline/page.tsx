export const metadata = {
  title: 'Offline · CPR',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: '#0C0C0A',
        color: '#fff',
        fontFamily: 'Inter, Arial, sans-serif',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 360 }}>
        <img src="/cpr-logo.png" alt="CPR" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 20px' }} />
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 10px' }}>You&rsquo;re offline</h1>
        <p style={{ color: '#b8b8b8', fontSize: 15, lineHeight: 1.5, margin: '0 0 20px' }}>
          Your portal needs a connection to load fresh content. Recently viewed pages may still be available.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 22px',
            background: '#C8102E',
            color: '#fff',
            borderRadius: 10,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Try again
        </a>
      </div>
    </main>
  );
}
