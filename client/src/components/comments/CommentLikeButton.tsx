import { useState } from 'react';
import { CommentAPIService } from '../../api_services/comments/CommentAPIService';

interface Props {
  commentId: number;
  likeCount: number;
  token: string;
  onUpdate: () => void;
}

export function CommentLikeButton({ commentId, likeCount, token, onUpdate }: Props) {
  const [liked,   setLiked]   = useState(false);
  const [pending, setPending] = useState(false);
  const [hov,     setHov]     = useState(false);

  const toggle = async () => {
    if (pending) return;
    setPending(true);
    try {
      if (liked) {
        await CommentAPIService.unlikeComment?.(commentId, token);
      } else {
        await CommentAPIService.likeComment(commentId, token);
      }
      setLiked(l => !l);
      onUpdate();
    } finally {
      setPending(false);
    }
  };

  const color = liked
    ? 'var(--color-pulse)'
    : hov
    ? 'var(--color-muted)'
    : 'var(--color-muted-ghost)';

  return (
    <button
      onClick={toggle}
      disabled={pending}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="font-dm flex items-center"
      style={{
        gap: '6px',
        background: 'none', border: 'none', padding: 0,
        cursor: pending ? 'not-allowed' : 'pointer',
        opacity: pending ? 0.4 : 1,
        color,
        fontSize: '12px', fontWeight: 300, letterSpacing: '0.08em',
        transition: 'color 0.15s',
      }}
    >
      <svg
        width="12" height="12" viewBox="0 0 14 13"
        fill={liked ? color : 'none'}
        stroke={color} strokeWidth="1.3"
        style={{ transition: 'all 0.2s', flexShrink: 0 }}
      >
        <path d="M7 11.5C7 11.5 1.5 8 1.5 4.5a2.75 2.75 0 0 1 5.5 0 2.75 2.75 0 0 1 5.5 0C12.5 8 7 11.5 7 11.5z" />
      </svg>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {likeCount > 0 ? likeCount : ''}
      </span>
    </button>
  );
}
