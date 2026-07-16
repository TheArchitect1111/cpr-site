'use client';

import { useEffect, useRef } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
  id?: string;
};

/**
 * Stable multiline field — preserves caret position while typing (standard controlled textarea).
 */
export default function AdminTextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
  className,
  id,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<{ start: number; end: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !caret.current) return;
    el.setSelectionRange(caret.current.start, caret.current.end);
    caret.current = null;
  }, [value]);

  return (
    <textarea
      ref={ref}
      id={id}
      rows={rows}
      value={value}
      placeholder={placeholder}
      className={className}
      spellCheck
      onChange={(e) => {
        caret.current = { start: e.target.selectionStart, end: e.target.selectionEnd };
        onChange(e.target.value);
      }}
    />
  );
}
