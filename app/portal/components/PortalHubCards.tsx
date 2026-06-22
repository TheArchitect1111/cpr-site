import { getPortalHubModules, getHubCopy } from '@/lib/portal-hub-modules';

type Props = {
  portalType: 'athlete' | 'parent';
  slug: string;
};

export default function PortalHubCards({ portalType, slug }: Props) {
  const base = `/portal/${portalType}/${slug}`;
  const modules = getPortalHubModules(base);
  const copy = getHubCopy();

  return (
    <section className="pp-section portal-hub-cards">
      <p className="pp-section-eyebrow">{copy.eyebrow}</p>
      <h2 className="pp-section-title">{copy.title}</h2>
      <p className="pp-section-sub portal-hub-intro">{copy.intro}</p>
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
