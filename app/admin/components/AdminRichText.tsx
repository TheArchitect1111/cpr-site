'use client';

import { useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { normalizeEditorHtml, plainToEditorHtml } from '@/lib/rich-text';
import './admin-rich-text.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
};

export default function AdminRichText({
  value,
  onChange,
  placeholder,
  className,
  minRows = 4,
}: Props) {
  const lastEmitted = useRef(value);
  const skipSync = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, code: false }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
    ],
    content: plainToEditorHtml(value),
    editorProps: {
      attributes: {
        class: 'admin-rich-text__editable',
        style: `min-height:${minRows * 1.45}rem`,
        'data-placeholder': placeholder || '',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = normalizeEditorHtml(ed.getHTML());
      skipSync.current = true;
      lastEmitted.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    editor.commands.setContent(plainToEditorHtml(value), { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return (
      <div className={`admin-rich-text admin-rich-text--loading${className ? ` ${className}` : ''}`}>
        Loading editor…
      </div>
    );
  }

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL (https://…)', prev || 'https://');
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  return (
    <div className={`admin-rich-text${className ? ` ${className}` : ''}`}>
      <div className="admin-rich-text__toolbar" role="toolbar" aria-label="Formatting">
        <button
          type="button"
          className={editor.isActive('bold') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          B
        </button>
        <button
          type="button"
          className={editor.isActive('italic') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet list"
        >
          •
        </button>
        <button
          type="button"
          className={editor.isActive('link') ? 'is-active' : ''}
          onClick={setLink}
          aria-label="Link"
        >
          Link
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
