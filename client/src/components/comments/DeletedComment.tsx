export function DeletedComment({ hasReplies }: { hasReplies?: boolean }) {
  return (
    <div className="flex items-center" style={{ gap: '10px', padding: '20px 0' }}>
      <div style={{ width: '16px', height: '1px', background: 'rgba(255,255,255,0.10)', flexShrink: 0 }} />
      <span
        className="font-dm"
        style={{
          fontSize: '12px', fontWeight: 300,
          letterSpacing: '0.06em', color: 'var(--color-muted-whisper)', fontStyle: 'italic',
        }}
      >
        [comment deleted]
      </span>
      {hasReplies && (
        <span
          className="font-dm"
          style={{ fontSize: '11px', fontWeight: 300, color: 'var(--color-muted-whisper)' }}
        >
          · replies below
        </span>
      )}
    </div>
  );
}
