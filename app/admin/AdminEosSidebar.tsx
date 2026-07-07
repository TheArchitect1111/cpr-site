import { site } from '@/config/site';

type AdminEosSidebarProps = {
  activeTab?: string;
  activeRoute?: 'attention' | 'homepage' | 'settings' | 'forms' | 'update-portal';
};

function isActive(activeTab: string | undefined, value: string) {
  return activeTab === value;
}

export default function AdminEosSidebar({ activeTab, activeRoute }: AdminEosSidebarProps) {
  const attentionActive = activeRoute === 'attention' || activeTab === 'dashboard' || !activeTab;

  return (
    <aside className="aside">
      <div className="aside-brand">
        <img src={site.brand.logo} alt="CPR" />
        <div>
          <div className="ab1 display">EA OPERATING SYSTEM</div>
          <div className="ab2 display">CPR CONFIGURATION</div>
        </div>
      </div>
      <nav>
        <a className={`aitem${attentionActive ? ' active' : ''}`} href="/admin">
          Attention
        </a>
      </nav>
      <details className="aside-group" open>
        <summary>People</summary>
        <nav>
          <a className={`aitem${isActive(activeTab, 'registrants') ? ' active' : ''}`} href="/admin?tab=registrants">Registrants</a>
          <a className={`aitem${isActive(activeTab, 'outreach') ? ' active' : ''}`} href="/admin?tab=outreach#players">Players</a>
          <a className={`aitem${isActive(activeTab, 'messages') ? ' active' : ''}`} href="/admin?tab=messages">Inbox</a>
          <a className={`aitem${isActive(activeTab, 'tickets') ? ' active' : ''}`} href="/admin?tab=tickets">Support Tickets</a>
          <a className="aitem" href="/portal/owner">Family Portal</a>
        </nav>
      </details>
      <details className="aside-group" open>
        <summary>Opportunity</summary>
        <nav>
          <a className={`aitem${isActive(activeTab, 'schools') ? ' active' : ''}`} href="/admin?tab=schools">Schools</a>
          <a className={`aitem${isActive(activeTab, 'outreach') ? ' active' : ''}`} href="/admin?tab=outreach">Coaches</a>
          <a className={`aitem${isActive(activeTab, 'recruitment-tracker') ? ' active' : ''}`} href="/admin?tab=recruitment-tracker">Recruiting Pipeline</a>
          <a className={`aitem${isActive(activeTab, 'responses') ? ' active' : ''}`} href="/admin?tab=responses">Responses</a>
          <a className={`aitem${isActive(activeTab, 'offers') ? ' active' : ''}`} href="/admin?tab=offers">Offers</a>
        </nav>
      </details>
      <details className="aside-group" open>
        <summary>Creation</summary>
        <nav>
          <a className={`aitem${activeRoute === 'homepage' ? ' active' : ''}`} href="/admin/landing">Homepage</a>
          <a className={`aitem${activeRoute === 'update-portal' ? ' active' : ''}`} href="/admin/update-portal">Update Portal</a>
          <a className={`aitem${isActive(activeTab, 'site-updates') ? ' active' : ''}`} href="/admin?tab=site-updates">Updates</a>
          <a className={`aitem${isActive(activeTab, 'site-events') ? ' active' : ''}`} href="/admin?tab=site-events">Events</a>
          <a className={`aitem${isActive(activeTab, 'site-text') ? ' active' : ''}`} href="/admin?tab=site-text">Pages</a>
          <a className={`aitem${isActive(activeTab, 'media-library') ? ' active' : ''}`} href="/admin?tab=media-library">Media Library</a>
          <a className={`aitem${isActive(activeTab, 'site-quotes') ? ' active' : ''}`} href="/admin?tab=site-quotes">Site Assets</a>
        </nav>
      </details>
      <details className="aside-group" open>
        <summary>Health</summary>
        <nav>
          <a className={`aitem${isActive(activeTab, 'communication') ? ' active' : ''}`} href="/admin?tab=communication">Announcements</a>
          <a className={`aitem${isActive(activeTab, 'email-templates') ? ' active' : ''}`} href="/admin?tab=email-templates">Email Campaigns</a>
          <a className={`aitem${isActive(activeTab, 'fee-agreements') ? ' active' : ''}`} href="/admin?tab=fee-agreements">Payments &amp; Agreements</a>
          <a className={`aitem${isActive(activeTab, 'documents') ? ' active' : ''}`} href="/admin?tab=documents">Documents</a>
          <a className={`aitem${isActive(activeTab, 'activity') ? ' active' : ''}`} href="/admin?tab=activity">Reports</a>
          <a className={`aitem${isActive(activeTab, 'content') ? ' active' : ''}`} href="/admin?tab=content">Content Readiness</a>
        </nav>
      </details>
      <details className="aside-group">
        <summary>Platform</summary>
        <nav>
          <a className={`aitem${isActive(activeTab, 'team') ? ' active' : ''}`} href="/admin?tab=team">Team</a>
          <a className={`aitem${activeRoute === 'settings' ? ' active' : ''}`} href="/admin/account">Settings</a>
          <a className={`aitem${activeRoute === 'forms' ? ' active' : ''}`} href="/admin/create-client">Forms</a>
          <a className="aitem back" href="/">Back to Site</a>
        </nav>
      </details>
    </aside>
  );
}
