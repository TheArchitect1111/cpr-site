import { looksLikeRichHtml, sanitizeRichHtml } from '@/lib/rich-text';

type Props = {
  html: string;
  className?: string;
  as?: 'div' | 'p';
};

export default function RichTextContent({ html, className, as = 'div' }: Props) {
  if (!html.trim()) return null;
  if (!looksLikeRichHtml(html)) {
    const Tag = as;
    return <Tag className={className}>{html}</Tag>;
  }
  // Rich editor output may contain block elements such as <p>, <ul>, and <ol>.
  // Those cannot be nested inside a paragraph without browser DOM correction,
  // which causes React hydration mismatches between server and client markup.
  const Tag = as === 'p' ? 'div' : as;
  return (
    <Tag
      className={`rich-text-content${className ? ` ${className}` : ''}`}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }}
    />
  );
}
