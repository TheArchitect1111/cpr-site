const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li', 'span',
]);

/** True when content likely contains markup from the admin rich text editor. */
export function looksLikeRichHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

/** Normalize plain text for TipTap (single paragraph). */
export function plainToEditorHtml(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (looksLikeRichHtml(trimmed)) return trimmed;
  return `<p>${escapeHtml(trimmed).replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Strip scripts/event handlers; keep basic formatting tags for public render. */
export function sanitizeRichHtml(html: string): string {
  if (!html.trim()) return '';
  if (!looksLikeRichHtml(html)) return escapeHtml(html);

  let out = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  out = out.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag: string, attrs: string) => {
    const lower = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) return '';
    if (lower === 'a') {
      const href = attrs.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const url = href?.[2] || href?.[3] || href?.[4] || '';
      if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) return '';
      return `<a href="${escapeHtml(url)}" rel="noopener noreferrer" target="_blank">`;
    }
    if (attrs.trim()) return `<${lower}>`;
    return match.toLowerCase();
  });

  return out;
}

/** Editor output → storage (empty paragraphs collapsed). */
export function normalizeEditorHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed || trimmed === '<p></p>') return '';
  return trimmed;
}
