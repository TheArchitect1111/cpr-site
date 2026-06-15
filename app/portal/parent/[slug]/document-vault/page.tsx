import '../../../portal.css';
import '../../../resources/resources.css';
import '../../../sections/sections.css';
import { getParentPortalData } from '@/lib/portal-data';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import DocumentVault from '@/app/portal/sections/DocumentVault';
import { getDocumentsBySlug } from '@/lib/sections-data';

export const dynamic = 'force-dynamic';

export default async function ParentDocumentVaultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const { docs } = await getDocumentsBySlug(slug, 'parent');

  return (
    <div className="portal-page">
      <header className="portal-header">
        <div className="portal-header-inner">
          <div className="portal-logo-row">
            <img src={site.brand.logo} alt="CPR" className="portal-logo-img" />
            <div>
              <div className="display b1">CANADIAN PROSPECTS</div>
              <div className="display b2">RECRUITMENT</div>
            </div>
          </div>
          <a href={`/portal/parent/${slug}`} className="portal-logout-btn">
            &#8592; Dashboard
          </a>
        </div>
      </header>

      <main className="portal-main res-main">
        <a href={`/portal/parent/${slug}`} className="res-back">
          &#8592; Back to Dashboard
        </a>
        <DocumentVault docs={docs} />
      </main>

      <footer className="portal-footer">
        <p>
          Canadian Prospects Recruitment &middot;{' '}
          <a href={`mailto:${site.footer.email}`}>{site.footer.email}</a>
        </p>
      </footer>
    </div>
  );
}
