import { getPortalHubModules } from '@/lib/portal-hub-modules';

type Props = {
  portalType: 'athlete' | 'parent';
  slug: string;
};

export default function PortalHubCards({ portalType, slug }: Props) {
  const base = `/portal/${portalType}/${slug}`;
  const modules = getPortalHubModules(base);

  return (
    <section className="pp-section portal-hub-cards">
      <p className="pp-section-eyebrow">Your CPR Portals</p>
      <h2 className="pp-section-title">Everything in one place</h2>
      <p className="pp-section-sub portal-hub-intro">
        Full EA Portal Chassis™ template — dashboard, Amplifi™, updates, learning, messaging, documents, and events.
      </p>
      <div className="portal-hub-grid portal-hub-grid-full">
        {modules.map((mod) => (
          <a
            key={mod.href}
            href={mod.href}
            className={`portal-hub-card${
              mod.variant === 'amplifi'
                ? ' portal-hub-card-amplifi'
                : mod.variant === 'updates'
                  ? ' portal-hub-card-updates'
                  : ''
            }`}
          >
            <span className="portal-hub-tag">{mod.tag}</span>
            <strong>{mod.title}</strong>
            <p>{mod.description}</p>
            <span className="portal-hub-cta">Open →</span>
          </a>
        ))}
      </div>
    </section>
  );
}
