import PortalLogin from '@/components/PortalLogin';

export const metadata = {
  title: 'Portal Login',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6 font-sans">
        <section className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-extrabold text-slate-950">Clerk setup needed</h1>
          <p className="mt-3 text-slate-600">Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to enable portal login.</p>
        </section>
      </main>
    );
  }

  return (
    <PortalLogin
      clientName="Mississauga Magic"
      logoUrl="/cpr-logo.png"
      primaryColor="#0a3d6b"
      accentColor="#00aaff"
      welcomeMessage="Welcome back to CPR Global Prospects"
      portalId="cpr"
    />
  );
}
