type Props = {
  portalType: 'athlete' | 'parent';
  slug: string;
};

export default function PortalHubCards({ portalType, slug }: Props) {
  const base = `/portal/${portalType}/${slug}`;

  return (
    <section className="pp-section portal-hub-cards">
      <p className="pp-section-eyebrow">Your CPR Portals</p>
      <h2 className="pp-section-title">Everything in one place</h2>
      <div className="portal-hub-grid">
        <a href={base} className="portal-hub-card">
          <span className="portal-hub-tag">Parent Success Portal</span>
          <strong>Recruiting dashboard</strong>
          <p>Onboarding, school interest, resources, and direct CPR support.</p>
          <span className="portal-hub-cta">Open dashboard →</span>
        </a>
        <a href={`${base}/amplifi`} className="portal-hub-card portal-hub-card-amplifi">
          <span className="portal-hub-tag">Amplifi™</span>
          <strong>Your future, visualized</strong>
          <p>Cinematic vision of your recruiting journey — potential through success.</p>
          <span className="portal-hub-cta">Experience Amplifi →</span>
        </a>
        <a href={`${base}/updates`} className="portal-hub-card portal-hub-card-updates">
          <span className="portal-hub-tag">Update Portal</span>
          <strong>Real-time recruiting feed</strong>
          <p>Coach outreach, school interest, messages, and CPR activity in one timeline.</p>
          <span className="portal-hub-cta">View updates →</span>
        </a>
      </div>
    </section>
  );
}
