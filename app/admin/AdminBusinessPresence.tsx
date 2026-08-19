import { appleBusinessPresence as provider } from '@/lib/business-presence';

export default function AdminBusinessPresence() {
  return (
    <section className="business-presence" aria-labelledby="business-presence-heading">
      <header className="ahead">
        <div>
          <p className="admin-kicker">Settings · Business Presence</p>
          <h1 id="business-presence-heading" className="display">APPLE BUSINESS</h1>
          <p>Manage how customers discover, trust, and take action with CPR across Apple services.</p>
        </div>
        <a className="admin-logout" href="/api/admin/logout">Sign Out</a>
      </header>

      <article className="business-presence-card">
        <div className="business-presence-heading">
          <div className="business-presence-mark" aria-hidden="true">A</div>
          <div>
            <span>{provider.category}</span>
            <h2>{provider.name}</h2>
          </div>
          <strong>Ready for guided setup</strong>
        </div>

        <p className="business-presence-summary">{provider.summary}</p>

        <div className="business-presence-columns">
          <div>
            <h3>Business value</h3>
            <ul>{provider.value.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>EA readiness</h3>
            <ul>{provider.readinessChecks.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>

        <details className="business-presence-checklist">
          <summary>View the guided setup checklist</summary>
          <ol>{provider.setupChecklist.map((item) => <li key={item}>{item}</li>)}</ol>
          <p><b>Available customer actions:</b> {provider.supportedActions.join(' · ')}</p>
        </details>

        <div className="business-presence-actions">
          <a href={provider.setupUrl} target="_blank" rel="noopener noreferrer">Set Up Apple Business</a>
          <p>{provider.automationNote}</p>
        </div>
      </article>
    </section>
  );
}
