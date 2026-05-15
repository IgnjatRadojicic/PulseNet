import { ActionButton } from './CommentSection';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  replyingToUsername?: string;
}

export function CommentReplyForm({ value, onChange, onSubmit, onCancel, replyingToUsername }: Props) {
  const canSubmit = !!value.trim();
  return (
    <div
      style={{
        marginTop: '16px',
        border: '1px solid var(--color-pulse-half)',
        background: 'var(--color-surface-hover)',
      }}
    >
      {replyingToUsername && (
        <div className="flex items-center" style={{ gap: '8px', padding: '10px 16px 0' }}>
          <div style={{ width: '12px', height: '1px', background: 'var(--color-pulse-60)', flexShrink: 0 }} />
          <span
            className="font-dm"
            style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.06em', color: 'var(--color-muted-ghost)' }}
          >
            replying to{' '}
            <span style={{ color: 'var(--color-pulse-80)', fontWeight: 400 }}>@{replyingToUsername}</span>
          </span>
        </div>
      )}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Write a reply..."
        rows={2}
        autoFocus
        className="font-dm"
        style={{
          display: 'block', width: '100%', background: 'transparent',
          border: 'none', outline: 'none', resize: 'none',
          padding: '12px 16px', fontSize: '14px',
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
        <ActionButton active={canSubmit} onClick={onSubmit} disabled={!canSubmit}>
          REPLY
        </ActionButton>
      </div>
    </div>
  );
}
