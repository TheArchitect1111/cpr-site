import '../../../portal.css';
import '../../../resources/resources.css';
import '../../../sections/sections.css';
import { getParentPortalData, getOpportunities } from '@/lib/portal-data';
import { getResources } from '@/lib/sections-data';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';

export const dynamic = 'force-dynamic';

export default async function ParentOpportunitiesResourcesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const [opportunities, { resources }] = await Promise.all([
    getOpportunities(portalData.recordId),
    getResources(),
  ]);

  return (
    <PortalSubpageLayout portalType="parent" slug={slug} active="resources">
      <section className="pp-section">
        <p className="pp-section-eyebrow">Opportunities &amp; Resources</p>
        <h1 className="pp-section-title">Trusted family resources</h1>
        <p className="pp-section-sub">
          Recommended partners, school interest, and CPR resources curated for your family.
        </p>

        {opportunities.length === 0 ? (
          <p className="pp-section-sub">No active opportunities yet. CPR will post updates as recruiting progresses.</p>
        ) : (
          <div className="portal-hub-grid">
            {opportunities.map((opp) => (
              <article key={opp.id} className="portal-hub-card">
                <span className="portal-hub-tag">{opp.status || 'Opportunity'}</span>
                <strong>{opp.schoolName || 'School interest'}</strong>
                <p>
                  {[opp.coachName && `Coach ${opp.coachName}`, opp.followUpDate && `Follow-up ${opp.followUpDate}`]
                    .filter(Boolean)
                    .join(' · ') || 'Tracked by the CPR team.'}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="pp-section">
        <h2 className="pp-section-title">Resource library highlights</h2>
        <div className="portal-hub-grid">
          {resources.slice(0, 6).map((item) => (
            <a
              key={item.id}
              href={`/portal/parent/${slug}/resource-library`}
              className="portal-hub-card"
            >
              <span className="portal-hub-tag">{item.type || 'Resource'}</span>
              <strong>{item.title}</strong>
              <p>{item.description || 'Open the resource library for full access.'}</p>
              <span className="portal-hub-cta">Open library</span>
            </a>
          ))}
        </div>
      </section>
    </PortalSubpageLayout>
  );
}
