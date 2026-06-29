import { getPortalHubModules, getHubCopy } from '@/lib/portal-hub-modules';

type Props = {
  portalType: 'athlete' | 'parent';
  slug: string;
};

export default function PortalHubCards({ portalType, slug }: Props) {
  const base = `/portal/${portalType}/${slug}`;
  const modules = getPortalHubModules(base).filter(
    (mod) => !(portalType === 'parent' && mod.variant === 'amplifi'),
  );
  const copy = getHubCopy();
  const quickCards = [
    { href: '/apply', tag: 'Start', title: 'Registration', description: 'Begin or continue registration with CPR.' },
    { href: '/camps', tag: 'Programs', title: 'Camps', description: 'Explore CPR camp programs and exposure opportunities.' },
    { href: '/camps#house-league', tag: 'Programs', title: 'House League', description: 'View house league information and development options.' },
    { href: '/recruitment', tag: 'Recruiting', title: 'Recruitment', description: 'Understand the recruiting pathway and CPR support.' },
    { href: `/athletes/${slug}`, tag: 'Profiles', title: 'Player Profile', description: 'Open the public recruiting profile for this athlete.' },
    { href: base, tag: 'Dashboard', title: 'Player Statistics', description: 'Review profile, progress, and recruiting activity.' },
    { href: `${base}/resource-library`, tag: 'Resources', title: 'Resources', description: 'Open recruiting resources, videos, documents, and links.' },
  ];

  return (
    <section className="pp-section portal-hub-cards">
      <p className="pp-section-eyebrow">{copy.eyebrow}</p>
      <h2 className="pp-section-title">{copy.title}</h2>
      <p className="pp-section-sub portal-hub-intro">{copy.intro}</p>
      <div className="portal-hub-grid portal-hub-grid-full">
        {quickCards.map((card) => (
          <a key={card.title} href={card.href} className="portal-hub-card">
            <span className="portal-hub-tag">{card.tag}</span>
            <strong>{card.title}</strong>
            <p>{card.description}</p>
            <span className="portal-hub-cta">Open</span>
          </a>
        ))}
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
            <span className="portal-hub-cta">Open</span>
          </a>
        ))}
      </div>
    </section>
  );
}
