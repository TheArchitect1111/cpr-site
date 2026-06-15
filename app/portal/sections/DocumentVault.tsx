import type { DocFile } from '@/lib/sections-data';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

interface Props {
  docs: DocFile[];
}

export default function DocumentVault({ docs }: Props) {
  return (
    <div>
      <div className="sec-card">
        <div className="sec-label">YOUR FILES</div>
        <h1 className="sec-heading">Document Vault</h1>
        <p className="sec-sub">
          Documents shared by the CPR team. These are read-only. Contact CPR if you need an
          updated version.
        </p>

        {docs.length === 0 ? (
          <div className="sec-empty">
            <div className="sec-empty-icon">&#128193;</div>
            <p>No documents have been shared with you yet.</p>
          </div>
        ) : (
          <div className="doc-list">
            {docs.map((d) => (
              <div key={d.id} className="doc-item">
                <div className="doc-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="doc-body">
                  <div className="doc-name">{d.documentName}</div>
                  <div className="doc-meta">
                    <span className="doc-type-badge">{d.documentType}</span>
                    {d.dateUploaded && `Uploaded ${formatDate(d.dateUploaded)}`}
                  </div>
                </div>
                {d.url && d.url !== '#' ? (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doc-link"
                  >
                    View &#8594;
                  </a>
                ) : (
                  <span className="doc-link" style={{ opacity: .4, cursor: 'default' }}>
                    Coming soon
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
