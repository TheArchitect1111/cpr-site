/**
 * Parse Amplifi Search notes stored on Content Requests (Additional Notes JSON).
 * Shared shape with EA chassis Amplifi topic research.
 */
export type AmplifiResearchNotes = {
  source: 'amplifi-topic-research';
  topic: string;
  dateFrom: string;
  dateTo: string;
  researchedAt: string;
  sources: Array<{ title: string; url: string; kind: string; publishedAt?: string | null }>;
  warnings?: string[];
};

export function parseAmplifiResearchNotes(raw?: string | null): AmplifiResearchNotes | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AmplifiResearchNotes> & { source?: string };
    if (parsed.source !== 'amplifi-topic-research') return null;
    if (!parsed.topic || !parsed.dateFrom || !parsed.dateTo) return null;
    return {
      source: 'amplifi-topic-research',
      topic: String(parsed.topic),
      dateFrom: String(parsed.dateFrom),
      dateTo: String(parsed.dateTo),
      researchedAt: String(parsed.researchedAt || ''),
      sources: Array.isArray(parsed.sources)
        ? parsed.sources.map((s) => ({
            title: String(s.title || s.url || ''),
            url: String(s.url || ''),
            kind: String(s.kind || 'other'),
            publishedAt: s.publishedAt ?? null,
          }))
        : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : undefined,
    };
  } catch {
    return null;
  }
}

export function isAmplifiSocialRequest(requestType?: string): boolean {
  const t = (requestType || '').toLowerCase();
  return t.includes('social') || t.includes('amplifi');
}

/** EA chassis Amplifi Search entry (topic + date range → draft → approval). */
export function eaAmplifiSearchUrl(): string {
  const base = (
    process.env.NEXT_PUBLIC_EA_PLATFORM_URL ||
    process.env.EA_PLATFORM_URL ||
    'https://efficiencyarchitects.online'
  ).replace(/\/$/, '');
  return `${base}/amplifi`;
}

export function eaAmplifiPortalUrl(slug = 'cpr'): string {
  const base = (
    process.env.NEXT_PUBLIC_EA_PLATFORM_URL ||
    process.env.EA_PLATFORM_URL ||
    'https://efficiencyarchitects.online'
  ).replace(/\/$/, '');
  return `${base}/portal/${encodeURIComponent(slug)}/amplifi`;
}
