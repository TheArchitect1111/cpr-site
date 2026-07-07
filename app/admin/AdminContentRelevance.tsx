import type { Resource, PortalEvent } from '@/lib/sections-data';

const CURRENT_YEAR = new Date().getFullYear();

type Bucket = {
  name: string;
  label: string;
  description: string;
  matchNames: string[];
  matchYears: string[];
  athleteCount: number;
};

function buildBuckets(gradYears: number[]): Bucket[] {
  return [
    {
      name: 'Senior',
      label: 'Senior',
      description: `Graduating ${CURRENT_YEAR} (0 yrs out)`,
      matchNames: ['senior'],
      matchYears: [String(CURRENT_YEAR)],
      athleteCount: gradYears.filter((y) => y === CURRENT_YEAR).length,
    },
    {
      name: 'Junior',
      label: 'Junior',
      description: `Graduating ${CURRENT_YEAR + 1} (1 yr out)`,
      matchNames: ['junior'],
      matchYears: [String(CURRENT_YEAR + 1)],
      athleteCount: gradYears.filter((y) => y === CURRENT_YEAR + 1).length,
    },
    {
      name: 'Sophomore',
      label: 'Sophomore',
      description: `Graduating ${CURRENT_YEAR + 2} (2 yrs out)`,
      matchNames: ['sophomore'],
      matchYears: [String(CURRENT_YEAR + 2)],
      athleteCount: gradYears.filter((y) => y === CURRENT_YEAR + 2).length,
    },
    {
      name: 'Younger',
      label: 'Younger / Rising',
      description: `Graduating ${CURRENT_YEAR + 3}+ (3+ yrs out)`,
      matchNames: ['younger', 'rising', 'freshman'],
      matchYears: Array.from({ length: 10 }, (_, i) => String(CURRENT_YEAR + 3 + i)),
      athleteCount: gradYears.filter((y) => y >= CURRENT_YEAR + 3).length,
    },
  ];
}

function isRelevantToBucket(
  relevance: string[],
  bucket: Bucket
): boolean {
  if (relevance.length === 0) return true;
  const lower = relevance.map((v) => v.toLowerCase().trim());
  if (bucket.matchNames.some((n) => lower.includes(n))) return true;
  if (bucket.matchYears.some((y) => lower.includes(y))) return true;
  return false;
}

function GapBanner({ noRes, noEvt }: { noRes: boolean; noEvt: boolean }) {
  if (!noRes && !noEvt) return null;
  const parts = [noRes && 'no resources', noEvt && 'no events'].filter(Boolean).join(', ');
  return (
    <div style={{
      background: '#FADDDD',
      color: '#A81D20',
      borderRadius: 5,
      padding: '7px 11px',
      fontSize: 12,
      fontWeight: 700,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: '.3px',
    }}>
      Content gap: {parts}
    </div>
  );
}

function ItemList({ items, max = 6 }: { items: { id: string; label: string; universal: boolean }[]; max?: number }) {
  if (items.length === 0) {
    return <p style={{ fontSize: 12, color: '#A81D20', margin: '4px 0 0' }}>No action needed right now. What this means: nothing is targeted here yet; add content only if this group needs guidance.</p>;
  }
  return (
    <ul style={{ margin: '4px 0 0', padding: '0 0 0 14px', fontSize: 12 }}>
      {items.slice(0, max).map((item) => (
        <li key={item.id} style={{ marginBottom: 3, color: '#333' }}>
          {item.label}
          {item.universal && (
            <span style={{ color: 'var(--gray)', fontSize: 10, marginLeft: 4 }}>(universal)</span>
          )}
        </li>
      ))}
      {items.length > max && (
        <li style={{ color: 'var(--gray)', fontSize: 11 }}>+{items.length - max} more</li>
      )}
    </ul>
  );
}

interface Props {
  resources: Resource[];
  events: PortalEvent[];
  gradYears: number[];
  live: boolean;
  showHeader?: boolean;
}

export default function AdminContentRelevance({ resources, events, gradYears, live, showHeader = true }: Props) {
  const buckets = buildBuckets(gradYears);

  const universalResources = resources.filter((r) => r.gradYearRelevance.length === 0);
  const universalEvents = events.filter((e) => e.gradYearRelevance.length === 0);

  const allTags = [...new Set([
    ...resources.flatMap((r) => r.gradYearRelevance),
    ...events.flatMap((e) => e.gradYearRelevance),
  ])].sort();

  return (
    <>
      {showHeader && (
        <header className="ahead">
          <div>
            <h1 className="display">CONTENT READINESS</h1>
            <p>
              {resources.length} resource{resources.length !== 1 ? 's' : ''} &middot;{' '}
              {events.length} upcoming event{events.length !== 1 ? 's' : ''} &middot;{' '}
              {universalResources.length} universal resource{universalResources.length !== 1 ? 's' : ''} &middot;{' '}
              {universalEvents.length} universal event{universalEvents.length !== 1 ? 's' : ''}
            </p>
          </div>
          {!live && <span className="demo-pill">SAMPLE DATA &middot; connect production data to go live</span>}
        </header>
      )}

      <div className="work">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}>
          {buckets.map((bucket) => {
            const bucketResources = resources.filter((r) =>
              isRelevantToBucket(r.gradYearRelevance, bucket)
            );
            const bucketEvents = events.filter((e) =>
              isRelevantToBucket(e.gradYearRelevance, bucket)
            );
            const noRes = bucketResources.length === 0;
            const noEvt = bucketEvents.length === 0;
            const hasGap = noRes || noEvt;

            return (
              <div
                key={bucket.name}
                className="detail"
                style={{
                  borderLeft: `4px solid ${hasGap ? '#A81D20' : '#2BA84A'}`,
                  position: 'static',
                }}
              >
                <div className="dhead">
                  <div>
                    <div className="dname">{bucket.label}</div>
                    <div className="dsub">{bucket.description}</div>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--gray)',
                    background: '#F2F2F2',
                    padding: '3px 8px',
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                  }}>
                    {bucket.athleteCount} athlete{bucket.athleteCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <GapBanner noRes={noRes} noEvt={noEvt} />

                <div className="dlabel">
                  RESOURCES ({bucketResources.length})
                </div>
                <ItemList
                  items={bucketResources.map((r) => ({
                    id: r.id,
                    label: r.title,
                    universal: r.gradYearRelevance.length === 0,
                  }))}
                />

                <div className="dlabel" style={{ marginTop: 14 }}>
                  EVENTS ({bucketEvents.length})
                </div>
                <ItemList
                  items={bucketEvents.map((e) => ({
                    id: e.id,
                    label: e.eventName,
                    universal: e.gradYearRelevance.length === 0,
                  }))}
                />
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="table-wrap">
            <div className="dlabel" style={{ marginBottom: 10 }}>
              TAGS IN USE
              {allTags.length === 0 && (
                <span style={{ color: 'var(--gray)', fontWeight: 400, marginLeft: 6, textTransform: 'none', letterSpacing: 0 }}>
                  (no tags set on any resources or events)
                </span>
              )}
            </div>
            {allTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allTags.map((tag) => {
                  const rCount = resources.filter((r) => r.gradYearRelevance.includes(tag)).length;
                  const eCount = events.filter((e) => e.gradYearRelevance.includes(tag)).length;
                  return (
                    <div
                      key={tag}
                      style={{
                        background: '#F4F4F4',
                        border: '1px solid #E7E7E7',
                        borderRadius: 6,
                        padding: '5px 11px',
                        fontSize: 12,
                      }}
                    >
                      <strong>{tag}</strong>
                      <span style={{ color: 'var(--gray)', marginLeft: 6 }}>
                        {rCount}R / {eCount}E
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="table-wrap">
            <div className="dlabel" style={{ marginBottom: 10 }}>
              UNIVERSAL CONTENT (applies to all grad years)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray)', marginBottom: 6 }}>
                  Resources ({universalResources.length})
                </div>
                {universalResources.length === 0 ? (
                  <span style={{ fontSize: 12, color: 'var(--gray)' }}>No action needed right now</span>
                ) : (
                  <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: 12 }}>
                    {universalResources.map((r) => (
                      <li key={r.id} style={{ marginBottom: 3 }}>{r.title}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray)', marginBottom: 6 }}>
                  Events ({universalEvents.length})
                </div>
                {universalEvents.length === 0 ? (
                  <span style={{ fontSize: 12, color: 'var(--gray)' }}>No action needed right now</span>
                ) : (
                  <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: 12 }}>
                    {universalEvents.map((e) => (
                      <li key={e.id} style={{ marginBottom: 3 }}>{e.eventName}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
