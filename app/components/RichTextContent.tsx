import { looksLikeRichHtml, sanitizeRichHtml } from '@/lib/rich-text';

type Props = {
  html: string;
  className?: string;
  as?: 'div' | 'p';
};

export default function RichTextContent({ html, className, as = 'div' }: Props) {
  if (!html.trim()) return null;
  const Tag = as;
  if (!looksLikeRichHtml(html)) {
    return <Tag className={className}>{html}</Tag>;
  }
  return (
    <Tag
      className={`rich-text-content${className ? ` ${className}` : ''}`}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }}
    />
  );
}
