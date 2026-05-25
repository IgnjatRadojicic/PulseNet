import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { CommentAPIService } from '../../api_services/comments/CommentAPIService';
import type { CommentDto } from '../../models/comments/CommentDTO';
//import { ParticleCanvas } from './ParticleCanvas';
import { CommentItem } from './CommentItem';

interface Props { postId: number; }
type Sort = 'newest' | 'popular';

export function CommentSection({ postId }: Props) {
  const { user: realUser, token: realToken } = useAuth();
  const user  = realUser  ?? { id: 1, korisnickoIme: 'you', uloga: 'admin' };
  const token = realToken ?? 'fake-token';

  const [comments,      setComments]      = useState<CommentDto[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [newComment,    setNewComment]    = useState('');
  const [inputActive,   setInputActive]   = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [replyContent,  setReplyContent]  = useState('');
  const [sort,          setSort]          = useState<Sort>('newest');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setComments(await CommentAPIService.getCommentsByPostId(postId, token));
    } finally {
      setLoading(false);
    }
  }, [postId, token]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      await CommentAPIService.addComment(postId, { content: newComment.trim() }, token);
      setNewComment('');
      setInputActive(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!replyContent.trim()) return;
    await CommentAPIService.addComment(postId, { content: replyContent.trim(), parentId }, token);
    setReplyContent('');
    setReplyTargetId(null);
    await load();
  };

  const toggleReply = (id: number) => {
    setReplyTargetId(prev => prev === id ? null : id);
    setReplyContent('');
  };

  const sorted = [...comments].sort((a, b) =>
    sort === 'popular'
      ? (b.likeCount ?? 0) - (a.likeCount ?? 0)
      : new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );

  const total      = comments.reduce((s, c) => s + 1 + (c.replies?.length ?? 0), 0);
  const showFooter = inputActive || newComment.length > 0;
  const canPost    = !!newComment.trim() && !submitting;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'var(--color-surface-base)',
        minHeight: '100vh',
      }}
    >

      <div className="relative z-10" style={{ padding: '56px 64px 72px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400&display=swap" rel="stylesheet" />
        {/*  HEADER  */}
        <div className="flex items-center justify-between" style={{ marginBottom: '52px' }}>

          {/* Left: accent line + title + count */}
          <div className="flex items-center" style={{ gap: '14px' }}>
            <div style={{ width: '24px', height: '1px', background: 'var(--color-pulse)', flexShrink: 0 }} />
            <h3
              className="font-syne"
              style={{ fontSize: '17px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}
            >
              Discussion
            </h3>
            {!loading && total > 0 && (
              <span
                className="font-dm"
                style={{
                  fontSize: '11px', fontWeight: 300,
                  color: 'var(--color-muted-ghost)', letterSpacing: '0.06em',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {total}
              </span>
            )}
          </div>

          {/* Right: sort buttons  always shown, underline on active */}
          <div className="flex items-center">
            {(['newest', 'popular'] as Sort[]).map(opt => (
              <SortBtn key={opt} active={sort === opt} onClick={() => setSort(opt)}>
                {opt}
              </SortBtn>
            ))}
          </div>
        </div>

        {/*  INPUT BOX  */}
        <div
          style={{
            margin: '0 auto 64px',
            maxWidth: '760px',
            border: `1px solid ${showFooter ? 'var(--color-pulse-half)' : 'rgba(255,255,255,0.08)'}`,
            background: 'var(--color-surface-hover)',
            transition: 'border-color 0.25s',
          }}
        >
          <div className="flex items-center" style={{ gap: '8px', padding: '13px 16px 0' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-pulse)', opacity: 0.7 }} />
            <span
              className="font-dm"
              style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.10em', color: 'var(--color-muted-ghost)' }}
            >
              @{user.korisnickoIme}
            </span>
          </div>

          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onFocus={() => setInputActive(true)}
            onBlur={() => { if (!newComment.length) setInputActive(false); }}
            placeholder="Share your thoughts..."
            rows={3}
            className="font-dm"
            style={{
              display: 'block', width: '100%', background: 'transparent',
              border: 'none', outline: 'none', resize: 'none',
              padding: '10px 16px 14px', fontSize: '14px',
              fontWeight: 300, lineHeight: '1.75',
              color: 'var(--color-muted-strong)',
              letterSpacing: '0.01em', boxSizing: 'border-box',
            }}
          />

          <div style={{ maxHeight: showFooter ? '56px' : '0', overflow: 'hidden', transition: 'max-height 0.25s ease' }}>
            <div
              className="flex items-center justify-between"
              style={{ padding: '10px 16px', borderTop: '1px solid var(--color-border-subtle)' }}
            >
              <span
                className="font-dm"
                style={{ fontSize: '11px', fontWeight: 300, color: 'var(--color-muted-whisper)', fontVariantNumeric: 'tabular-nums' }}
              >
                {newComment.length} / 2000
              </span>
              <ActionButton active={canPost} onClick={handleSubmit} disabled={!canPost}>
                {submitting ? 'posting...' : 'POST'}
              </ActionButton>
            </div>
          </div>
        </div>

        {/*  COMMENT LIST  */}
        {loading ? (
          <Skeleton />
        ) : sorted.length === 0 ? (
          <Empty />
        ) : (
          <div>
            {sorted.map((c, i) => (
              <div key={c.id} style={{ paddingTop: i > 0 ? '40px' : '0' }}>
                <CommentItem
                  comment={c}
                  currentUserId={user.id}
                  token={token}
                  onReply={toggleReply}
                  onCommentUpdate={load}
                  isReplying={replyTargetId === c.id}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  onSubmitReply={handleSubmitReply}
                  isModerator={user.uloga === 'admin'}
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

/*  Sort button  */
function SortBtn({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="font-dm relative"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 300,
        letterSpacing: '0.10em',
        padding: '6px 12px',
        color: active ? '#fff' : hov ? 'var(--color-muted)' : 'var(--color-muted-ghost)',
        transition: 'color 0.15s',
      }}
    >
      {children}
      {/* Underline indicator  visible on active, hidden on inactive */}
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          left: '12px',
          right: '12px',
          height: '1px',
          background: 'var(--color-pulse)',
          opacity: active ? 1 : 0,
          transition: 'opacity 0.15s',
        }}
      />
    </button>
  );
}

/*  Reusable action button (POST / REPLY / SAVE)  */
export function ActionButton({ active, onClick, disabled, children }: {
  active: boolean; onClick: () => void; disabled: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="font-dm"
      style={{
        background:    active ? 'var(--color-pulse)' : 'transparent',
        border:        `1px solid ${active ? 'var(--color-pulse)' : 'rgba(255,255,255,0.10)'}`,
        color:         active ? '#fff' : 'var(--color-muted-ghost)',
        cursor:        active ? 'pointer' : 'not-allowed',
        fontSize:      '11px',
        fontWeight:    400,
        letterSpacing: '0.12em',
        padding:       '7px 22px',
        borderRadius:  '2px',
        transition:    'all 0.2s',
      }}
    >
      {children}
    </button>
  );
}

/*  Skeleton loader  */
function Skeleton() {
  return (
    <div>
      {[75, 55, 85].map((w, i) => (
        <div
          key={i}
          style={{
            padding: '26px 0',
            borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            animation: 'pulse 1.8s ease-in-out infinite',
          }}
        >
          <div className="flex items-center" style={{ gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '28px', height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ width: '100px', height: '9px', background: 'rgba(255,255,255,0.06)', borderRadius: '1px' }} />
            <div style={{ width: '60px',  height: '9px', background: 'rgba(255,255,255,0.04)', borderRadius: '1px' }} />
          </div>
          <div style={{ paddingLeft: '42px' }}>
            <div style={{ width: `${w}%`,      height: '9px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', marginBottom: '7px' }} />
            <div style={{ width: `${w - 18}%`, height: '9px', background: 'rgba(255,255,255,0.04)', borderRadius: '1px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/*  Empty state  */
function Empty() {
  return (
    <div className="text-center" style={{ padding: '56px 0', border: '1px dashed rgba(255,255,255,0.08)' }}>
      <div style={{ width: '32px', height: '1px', background: 'var(--color-pulse)', margin: '0 auto 20px' }} />
      <p
        className="font-dm"
        style={{ fontSize: '13px', fontWeight: 300, color: 'var(--color-muted-ghost)', margin: 0, letterSpacing: '0.04em' }}
      >
        No comments yet. Start the discussion.
      </p>
    </div>
  );
}
