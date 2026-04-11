import { useState } from 'react';
import { ActionButton } from './CommentSection';

interface Props {
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  onCancel: () => void;
}

export function CommentEditForm({ initialContent, onSave, onCancel }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saving,  setSaving]  = useState(false);
  const unchanged = content.trim() === initialContent.trim();
  const canSave   = !!content.trim() && !saving && !unchanged;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try { await onSave(content.trim()); }
    finally { setSaving(false); }
  };

  return (
    <div
      style={{
        marginTop: '10px',
        border: '1px solid var(--color-pulse-half)',
        background: 'var(--color-surface-hover)',
      }}
    >
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
        autoFocus
        className="font-dm"
        style={{
          display: 'block', width: '100%', background: 'transparent',
          border: 'none', outline: 'none', resize: 'none',
          padding: '14px 16px', fontSize: '14px',
          fontWeight: 300, lineHeight: '1.75',
          color: 'var(--color-muted-strong)',
          letterSpacing: '0.01em', boxSizing: 'border-box',
        }}
      />
      <div
        className="flex items-center justify-between"
        style={{ padding: '10px 16px', borderTop: '1px solid var(--color-border-subtle)' }}
      >
        <button
          onClick={onCancel}
          className="font-dm"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: '11px', fontWeight: 300, letterSpacing: '0.10em',
            color: 'var(--color-muted-ghost)', transition: 'color 0.15s',
          }}
        >
          cancel
        </button>
        <ActionButton active={canSave} onClick={handleSave} disabled={!canSave}>
          {saving ? 'saving...' : 'SAVE'}
        </ActionButton>
      </div>
    </div>
  );
}
