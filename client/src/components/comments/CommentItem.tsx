import React, { useState } from 'react';
import { CommentAPIService } from '../../api_services/comments/CommentAPIService';
import type { CommentDto } from '../../models/comments/CommentDTO';
import { CommentLikeButton } from './CommentLikeButton';
import { CommentEditForm } from './CommentEditForm';
import { CommentReplyForm } from './CommentReplyForm';
import { DeletedComment } from './DeletedComment';
import type { ICommentsAPIService } from '../../api_services/comments/ICommentAPIService';

interface Props {
  comment: CommentDto;
  currentUserId?: number;
  token: string;
  onReply: (id: number) => void;
  onCommentUpdate: () => void;
  isReplying: boolean;
  replyContent: string;
  setReplyContent: (v: string) => void;
  onSubmitReply: (parentId: number) => void;
  isModerator?: boolean;
  isNested?: boolean;
}

export function CommentItem({
  comment, currentUserId, token,
  onReply, onCommentUpdate,
  isReplying, replyContent, setReplyContent, onSubmitReply,
  isModerator = false, isNested = false,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [hovered,   setHovered]   = useState(false);

  const isDeleted = !comment.content
    || comment.content === '[deleted]'
    || comment.content === '[comment removed]';
  const isAuthor  = currentUserId === comment.authorId;
  const canEdit   = isAuthor || isModerator;
  const hasReplies = (comment.replies?.length ?? 0) > 0;

  const handleSave = async (newContent: string) => {
    await CommentAPIService.updateComment(comment.id, newContent, token);
    setIsEditing(false);
    onCommentUpdate();
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    await (CommentAPIService as ICommentsAPIService).deleteComment?.(comment.id, token);
    onCommentUpdate();
  };

  const date = comment.createdAt
    ? new Date(comment.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : null;

  if (isDeleted) {
    return (
      <>
        <DeletedComment hasReplies={hasReplies} />
        {hasReplies && (
          <ReplyList
            replies={comment.replies}
            currentUserId={currentUserId}
            token={token}
            onCommentUpdate={onCommentUpdate}
            isModerator={isModerator}
          />
        )}
      </>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ padding: isNested ? '16px 0' : '4px 0' }}
    >
      {/* AUTHOR ROW */}
      <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
        <div className="flex items-center flex-wrap" style={{ gap: '12px', minWidth: 0 }}>

          {/* Accent dash */}
          <div style={{
            width: isNested ? '16px' : '28px',
            height: '1px',
            background: 'var(--color-pulse)',
            opacity: isNested ? 0.6 : 1,
            flexShrink: 0,
          }} />

          {/* Username */}
          <span
            className="font-syne"
            style={{
              fontSize: isNested ? '14px' : '17px',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            @{comment.authorUsername}
          </span>

          {/* Date */}
          {date && (
            <span
              className="font-dm"
              style={{ fontSize: '12px', fontWeight: 300, color: 'var(--color-muted-ghost)', letterSpacing: '0.03em' }}
            >
              {date}
            </span>
          )}

          {/* Mod badge */}
          {isModerator && isAuthor && (
            <span
              className="font-dm"
              style={{
                fontSize: '10px', fontWeight: 300, letterSpacing: '0.12em',
                color: 'var(--color-pulse-80)',
                border: '1px solid var(--color-pulse-half)',
                padding: '1px 6px', lineHeight: 1.4, flexShrink: 0,
              }}
            >
              mod
            </span>
          )}
        </div>

        {/* Edit / delete — fade in on hover */}
        {canEdit && !isEditing && (
          <div
            className="flex items-center"
            style={{
              gap: '14px',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.15s',
              flexShrink: 0,
            }}
          >
            <HoverBtn onClick={() => setIsEditing(true)}>edit</HoverBtn>
            <HoverBtn onClick={handleDelete} danger>delete</HoverBtn>
          </div>
        )}
      </div>

      {/* BODY */}
      <div style={{ paddingLeft: isNested ? '28px' : '42px' }}>

        {isEditing ? (
          <CommentEditForm
            initialContent={comment.content}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <p
            className="font-dm"
            style={{
              fontSize: '15px', fontWeight: 300,
              lineHeight: '1.78', color: 'var(--color-muted-strong)',
              letterSpacing: '0.005em', margin: 0,
            }}
          >
            {comment.content}
          </p>
        )}

        {/* ACTION BAR */}
        {!isEditing && (
          <div className="flex items-center" style={{ gap: '20px', marginTop: '14px' }}>
            <CommentLikeButton
              commentId={comment.id}
              likeCount={comment.likeCount ?? 0}
              token={token}
              onUpdate={onCommentUpdate}
            />
            {!isNested && (
              <ActionBtn active={isReplying} onClick={() => onReply(comment.id)}>
                {isReplying ? 'cancel' : 'reply'}
              </ActionBtn>
            )}
            {hasReplies && !isNested && (
              <span
                className="font-dm"
                style={{
                  fontSize: '12px', fontWeight: 300,
                  color: 'var(--color-muted-ghost)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {comment.replies.length}{' '}
                {comment.replies.length === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>
        )}

        {/* REPLY FORM */}
        {isReplying && !isNested && (
          <CommentReplyForm
            value={replyContent}
            onChange={setReplyContent}
            onSubmit={() => onSubmitReply(comment.id)}
            onCancel={() => onReply(comment.id)}
            replyingToUsername={comment.authorUsername}
          />
        )}

        {/* NESTED REPLIES */}
        {hasReplies && (
          <ReplyList
            replies={comment.replies}
            currentUserId={currentUserId}
            token={token}
            onCommentUpdate={onCommentUpdate}
            isModerator={isModerator}
          />
        )}
      </div>
    </div>
  );
}

/* ── Inline helpers ── */

function ActionBtn({ onClick, active, children }: {
  onClick: () => void; active?: boolean; children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="font-dm"
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        fontSize: '12px', fontWeight: 300, letterSpacing: '0.08em',
        color: active ? 'var(--color-pulse)' : hov ? 'var(--color-muted)' : 'var(--color-muted-ghost)',
        transition: 'color 0.15s',
      }}
    >
      {children}
    </button>
  );
}

function HoverBtn({ onClick, danger, children }: {
  onClick: () => void; danger?: boolean; children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="font-dm"
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        fontSize: '11px', fontWeight: 300, letterSpacing: '0.10em',
        color: hov ? (danger ? '#f87171' : '#fff') : 'var(--color-muted-ghost)',
        transition: 'color 0.15s',
      }}
    >
      {children}
    </button>
  );
}

/* ── Reply list ── */
interface ReplyListProps {
  replies: CommentDto[];
  currentUserId?: number;
  token: string;
  onCommentUpdate: () => void;
  isModerator: boolean;
}

function ReplyList({ replies, currentUserId, token, onCommentUpdate, isModerator }: ReplyListProps) {
  return (
    <div style={{
      marginTop: '20px',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      paddingLeft: '20px',
    }}>
      {replies.map((r, i) => (
        <div key={r.id} style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
          <CommentItem
            comment={r}
            currentUserId={currentUserId}
            token={token}
            onReply={() => {}}
            onCommentUpdate={onCommentUpdate}
            isReplying={false}
            replyContent=""
            setReplyContent={() => {}}
            onSubmitReply={() => {}}
            isModerator={isModerator}
            isNested
          />
        </div>
      ))}
    </div>
  );
}
