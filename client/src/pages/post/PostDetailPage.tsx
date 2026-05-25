import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Heart, MessageSquare, Share2, User, Clock,
    ArrowLeft, Loader2, AlertTriangle, Edit2, Trash2,
    ChevronDown, CornerDownRight, Send,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { postApi } from '../../api_services/post/PostAPIService';
import { communityApi } from '../../api_services/community/CommunityAPIService';
import type { PostDto } from '../../models/posts/PostsDto';
import type { CommentDto, CreateCommentDto } from '../../models/comments/CommentDTO';
import { API } from '../../constants/api';

//  BBCode renderer (same as CreatePostPage) 
function renderBBCode(raw: string): string {
    let html = raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    html = html.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>');
    html = html.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>');
    html = html.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>$1</u>');
    html = html.replace(/\[h\]([\s\S]*?)\[\/h\]/gi, '<h3 style="font-size:1.15em;font-weight:700;margin:0.5em 0 0.25em;">$1</h3>');
    html = html.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, '<blockquote style="border-left:3px solid rgba(108,99,255,0.4);padding:0.5em 1em;margin:0.5em 0;color:rgba(255,255,255,0.6);background:rgba(255,255,255,0.03);border-radius:4px;">$1</blockquote>');
    html = html.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, '<pre style="background:rgba(255,255,255,0.05);padding:0.75em 1em;border-radius:6px;font-family:monospace;font-size:0.85em;overflow-x:auto;">$1</pre>');
    html = html.replace(/\[url=(.*?)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" style="color:#6c63ff;text-decoration:underline;" target="_blank" rel="noopener">$2</a>');
    html = html.replace(/\[\*\](.*?)(?:\n|$)/gi, '<li style="margin-left:1.25em;">$1</li>');
    html = html.replace(/\[img\](.*?)\[\/img\]/gi, '<img src="$1" style="max-width:100%;border-radius:8px;margin:0.5em 0;" />');
    html = html.replace(/\n/g, '<br/>');

    return html;
}

//  Time ago helper 
function timeAgo(dateStr: string | null): string {
    if (!dateStr) return '';
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return `${Math.floor(d / 30)}mo ago`;
}

//  Comment input box 
function CommentInput({
    placeholder,
    onSubmit,
    autoFocus,
    onCancel,
}: {
    placeholder: string;
    onSubmit: (content: string) => Promise<void>;
    autoFocus?: boolean;
    onCancel?: () => void;
}) {
    const [value, setValue] = useState('');
    const [sending, setSending] = useState(false);

    async function handle() {
        const trimmed = value.trim();
        if (!trimmed || sending) return;
        setSending(true);
        try {
            await onSubmit(trimmed);
            setValue('');
        } finally {
            setSending(false);
        }
    }

    return (
        <div
            className="flex items-start gap-2 rounded-lg p-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
            <textarea
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={placeholder}
                rows={2}
                autoFocus={autoFocus}
                maxLength={2000}
                className="flex-1 text-sm text-white/80 placeholder:text-white/20 bg-transparent outline-none resize-none border-none leading-relaxed"
            />
            <div className="flex flex-col gap-1 shrink-0">
                <button
                    onClick={handle}
                    disabled={!value.trim() || sending}
                    className="p-2 rounded-lg transition-all"
                    style={{
                        background: value.trim() ? 'var(--color-pulse, #6c63ff)' : 'rgba(255,255,255,0.05)',
                        border: 'none',
                        cursor: value.trim() && !sending ? 'pointer' : 'default',
                        opacity: value.trim() ? 1 : 0.4,
                    }}
                >
                    {sending
                        ? <Loader2 size={14} strokeWidth={2} className="text-white animate-spin" />
                        : <Send size={14} strokeWidth={2} className="text-white" />
                    }
                </button>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-[10px] text-white/30 hover:text-white/50 transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}

//  Single comment component 
function CommentItem({
    comment,
    postAuthorId,
    depth,
    user,
    onReply,
    onLike,
    onUnlike,
    onDelete,
}: {
    comment: CommentDto;
    postAuthorId: number;
    depth: number;
    user: { id: number; username: string; role: string } | null;
    onReply: (parentId: number, content: string) => Promise<void>;
    onLike: (commentId: number) => Promise<void>;
    onUnlike: (commentId: number) => Promise<void>;
    onDelete: (commentId: number) => Promise<void>;
}) {
    const [replyOpen, setReplyOpen] = useState(false);
    const [showReplies, setShowReplies] = useState(true);
    const [likeLoading, setLikeLoading] = useState(false);
    const [liked, setLiked] = useState(comment.isLikedByUser);
    const [likeCount, setLikeCount] = useState(comment.likeCount);

    const isAuthor = user?.id === comment.authorId;
    const isAdmin = user?.role === 'admin';
    const canReply = user && depth < 1 && !comment.isDeleted; // max 2 levels

    async function handleLike() {
        if (!user || likeLoading) return;
        setLikeLoading(true);
        try {
            if (liked) {
                await onUnlike(comment.id);
                setLiked(false);
                setLikeCount(c => c - 1);
            } else {
                await onLike(comment.id);
                setLiked(true);
                setLikeCount(c => c + 1);
            }
        } catch { /* silent */ }
        finally { setLikeLoading(false); }
    }

    async function handleReply(content: string) {
        await onReply(comment.id, content);
        setReplyOpen(false);
    }

    return (
        <div
            className={depth > 0 ? 'ml-6 pl-4' : ''}
            style={depth > 0 ? { borderLeft: '2px solid rgba(108,99,255,0.12)' } : undefined}
        >
            <div className="py-3">
                {/* Author row */}
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                        <User size={10} strokeWidth={1.5} className="text-white/50" />
                    </div>
                    <Link
                        to={`/users/${comment.authorId}`}
                        className="no-underline text-xs font-medium text-white/60 hover:text-white/80 transition-colors"
                    >
                        {comment.authorUsername}
                    </Link>
                    {comment.authorId === postAuthorId && (
                        <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                            style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff' }}
                        >
                            OP
                        </span>
                    )}
                    <span className="text-white/20 text-[10px]">•</span>
                    <span className="text-[11px] text-white/25 flex items-center gap-1">
                        <Clock size={10} strokeWidth={1.5} />
                        {timeAgo(comment.createdAt)}
                    </span>
                    {comment.isFlagged && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium text-orange-400" style={{ background: 'rgba(251,146,60,0.1)' }}>
                            flagged
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="text-sm text-white/65 leading-relaxed mb-2">
                    {comment.isDeleted ? (
                        <span className="italic text-white/25">[comment deleted]</span>
                    ) : (
                        comment.content
                    )}
                </div>

                {/* Actions */}
                {!comment.isDeleted && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleLike}
                            disabled={!user}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors"
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: user ? 'pointer' : 'default',
                                color: liked ? '#6c63ff' : 'rgba(255,255,255,0.35)',
                            }}
                        >
                            <Heart size={13} strokeWidth={1.5} fill={liked ? 'currentColor' : 'none'} />
                            {likeCount > 0 && <span>{likeCount}</span>}
                        </button>

                        {canReply && (
                            <button
                                onClick={() => setReplyOpen(!replyOpen)}
                                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-white/35 hover:text-white/55 transition-colors"
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <CornerDownRight size={12} strokeWidth={1.5} />
                                Reply
                            </button>
                        )}

                        {(isAuthor || isAdmin) && (
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-white/25 hover:text-red-400/70 transition-colors"
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <Trash2 size={12} strokeWidth={1.5} />
                            </button>
                        )}
                    </div>
                )}

                {/* Reply input */}
                {replyOpen && (
                    <div className="mt-2">
                        <CommentInput
                            placeholder={`Reply to ${comment.authorUsername}...`}
                            onSubmit={handleReply}
                            autoFocus
                            onCancel={() => setReplyOpen(false)}
                        />
                    </div>
                )}
            </div>

            {/* Nested replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div>
                    {!showReplies ? (
                        <button
                            onClick={() => setShowReplies(true)}
                            className="flex items-center gap-1 text-[11px] text-pulse/70 hover:text-pulse mb-2 ml-1"
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <ChevronDown size={12} strokeWidth={2} />
                            Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </button>
                    ) : (
                        comment.replies.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                postAuthorId={postAuthorId}
                                depth={depth + 1}
                                user={user}
                                onReply={onReply}
                                onLike={onLike}
                                onUnlike={onUnlike}
                                onDelete={onDelete}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

//  Main Post Detail Page 
export default function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const postId = Number(id);
    const { user } = useAuth();
    const navigate = useNavigate();

    const [post, setPost] = useState<PostDto | null>(null);
    const [comments, setComments] = useState<CommentDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [likeLoading, setLikeLoading] = useState(false);

    // Sidebar
    const [myCommunities, setMyCommunities] = useState<{ id: number; name: string }[]>([]);

    // Comments loading
    const [commentsLoading, setCommentsLoading] = useState(false);

    const loadComments = useCallback(async () => {
        setCommentsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API.BASE_URL}comments/post/${postId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success !== false) {
                // data could be the array directly or data.data
                const commentList = Array.isArray(data) ? data : (data.data ?? []);
                setComments(commentList);
            }
        } catch { /* silent */ }
        finally { setCommentsLoading(false); }
    }, [postId]);

    useEffect(() => {
        let ignore = false;

        async function load() {
            setLoading(true);
            setError('');

            try {
                const postRes = await postApi.getById(postId);
                if (ignore) return;

                if (postRes.success && postRes.data) {
                    setPost(postRes.data);
                    setLiked(postRes.data.isLiked);
                    setLikeCount(postRes.data.likeCount);
                } else {
                    setError('Post not found');
                }

                await loadComments();

                if (user) {
                    const mineRes = await communityApi.getMine();
                    if (!ignore && mineRes.success && mineRes.data) {
                        setMyCommunities(mineRes.data.map(c => ({ id: c.id, name: c.name })));
                    }
                }
            } catch {
                if (!ignore) setError('Failed to load post');
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        load();
        return () => { ignore = true; };
    }, [postId, user, loadComments]);

    async function handlePostLike() {
        if (!user || likeLoading) return;
        setLikeLoading(true);
        try {
            const token = localStorage.getItem('token');
            const method = liked ? 'DELETE' : 'POST';
            const res = await fetch(`${API.BASE_URL}posts/${postId}/like`, {
                method,
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (data.success) {
                setLiked(!liked);
                setLikeCount(prev => liked ? prev - 1 : prev + 1);
            }
        } catch { /* silent */ }
        finally { setLikeLoading(false); }
    }

    async function handleAddComment(content: string) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API.BASE_URL}comments`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, postId, parentId: null } as CreateCommentDto & { postId: number }),
        });
        const data = await res.json();
        if (data.success !== false) {
            await loadComments(); // refresh
        }
    }

    async function handleReply(parentId: number, content: string) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API.BASE_URL}comments`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, postId, parentId } as CreateCommentDto & { postId: number }),
        });
        const data = await res.json();
        if (data.success !== false) {
            await loadComments();
        }
    }

    async function handleCommentLike(commentId: number) {
        const token = localStorage.getItem('token');
        await fetch(`${API.BASE_URL}comments/${commentId}/like`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    async function handleCommentUnlike(commentId: number) {
        const token = localStorage.getItem('token');
        await fetch(`${API.BASE_URL}comments/${commentId}/like`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    async function handleCommentDelete(commentId: number) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API.BASE_URL}comments/${commentId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success !== false) {
            await loadComments();
        }
    }

    async function handlePostDelete() {
        if (!confirm('Delete this post? This cannot be undone.')) return;
        try {
            const res = await postApi.remove(postId);
            if (res.success) {
                navigate(post ? `/communities/${post.communityId}` : '/feed', { replace: true });
            }
        } catch { /* silent */ }
    }

    if (loading) {
        return (
            <AppLayout communities={myCommunities}>
                <div className="flex items-center justify-center py-24">
                    <Loader2 size={24} strokeWidth={1.5} className="text-white/30 animate-spin" />
                </div>
            </AppLayout>
        );
    }

    if (error || !post) {
        return (
            <AppLayout communities={myCommunities}>
                <div
                    className="rounded-lg px-6 py-12 text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <AlertTriangle size={32} strokeWidth={1.5} className="text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/40">{error || 'Post not found'}</p>
                    <Link to="/feed" className="text-xs text-pulse hover:underline mt-3 inline-block no-underline">
                        Back to feed
                    </Link>
                </div>
            </AppLayout>
        );
    }

    const isAuthor = user?.id === post.authorId;
    const isAdmin = user?.role === 'admin';

    return (
        <AppLayout communities={myCommunities}>
            <div className="max-w-[720px] mx-auto">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/55 mb-4 transition-colors"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <ArrowLeft size={14} strokeWidth={1.5} />
                    Back
                </button>

                {/* Post card */}
                <div
                    className="rounded-xl overflow-hidden mb-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    {/* Header */}
                    <div className="flex items-center gap-2 px-5 pt-4 pb-1">
                        <Link
                            to={`/communities/${post.communityId}`}
                            className="no-underline text-xs font-bold text-white/90 hover:underline"
                        >
                            c/{post.communityName}
                        </Link>
                        <span className="text-white/20 text-xs">•</span>
                        <div className="flex items-center gap-1.5">
                            {post.authorProfileImage ? (
                                <img src={post.authorProfileImage} alt="" className="w-4 h-4 rounded-full object-cover" />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                                    <User size={10} strokeWidth={1.5} className="text-white/50" />
                                </div>
                            )}
                            <Link to={`/users/${post.authorId}`} className="no-underline text-xs text-white/50 hover:text-white/70">
                                {post.authorUsername}
                            </Link>
                        </div>
                        <span className="text-white/20 text-xs">•</span>
                        <span className="text-xs text-white/30 flex items-center gap-1">
                            <Clock size={11} strokeWidth={1.5} />
                            {timeAgo(post.createdAt)}
                        </span>

                        {/* Edit / Delete  right side */}
                        {(isAuthor || isAdmin) && (
                            <div className="ml-auto flex items-center gap-1">
                                {isAuthor && (
                                    <button
                                        onClick={() => navigate(`/posts/${postId}/edit`)}
                                        className="p-1.5 rounded hover:bg-white/5 transition-colors"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                        title="Edit post"
                                    >
                                        <Edit2 size={13} strokeWidth={1.5} className="text-white/30" />
                                    </button>
                                )}
                                <button
                                    onClick={handlePostDelete}
                                    className="p-1.5 rounded hover:bg-red-400/5 transition-colors"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                    title="Delete post"
                                >
                                    <Trash2 size={13} strokeWidth={1.5} className="text-white/25 hover:text-red-400/70" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="px-5 pt-2 pb-1 text-lg font-bold text-white/95 leading-snug" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {post.title}
                    </h1>

                    {/* Content  rendered BBCode */}
                    <div
                        className="px-5 pb-3 text-sm text-white/60 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderBBCode(post.content) }}
                    />

                    {/* Media */}
                    {post.mediaUrl && (
                        <div className="px-5 pb-4">
                            <img
                                src={post.mediaUrl}
                                alt=""
                                className="w-full rounded-lg object-cover"
                                style={{ maxHeight: '500px' }}
                            />
                        </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 px-5 pb-3">
                            {post.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="text-[11px] px-2 py-0.5 rounded-full text-white/50 font-medium"
                                    style={{ background: 'rgba(255,255,255,0.06)' }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Action bar */}
                    <div
                        className="flex items-center gap-1 px-3 py-2"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                    >
                        <button
                            onClick={handlePostLike}
                            disabled={!user || likeLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: user ? 'pointer' : 'default',
                                color: liked ? 'var(--color-pulse, #6c63ff)' : 'rgba(255,255,255,0.45)',
                            }}
                        >
                            <Heart size={16} strokeWidth={1.5} fill={liked ? 'currentColor' : 'none'} />
                            <span>{likeCount}</span>
                        </button>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/45">
                            <MessageSquare size={16} strokeWidth={1.5} />
                            <span>{post.commentCount}</span>
                        </div>
                        <button
                            onClick={() => navigator.clipboard.writeText(window.location.href)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/45 hover:bg-white/5 transition-colors"
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <Share2 size={16} strokeWidth={1.5} />
                            Share
                        </button>
                    </div>
                </div>

                {/* Comment input  root level */}
                {user && (
                    <div className="mb-4">
                        <CommentInput
                            placeholder="Add a comment..."
                            onSubmit={handleAddComment}
                        />
                    </div>
                )}

                {/* Comments section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-sm font-bold text-white/70">
                            Comments
                        </h2>
                        {commentsLoading && <Loader2 size={14} strokeWidth={2} className="text-white/20 animate-spin" />}
                    </div>

                    {!commentsLoading && comments.length === 0 && (
                        <div
                            className="rounded-lg px-4 py-8 text-center"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                        >
                            <MessageSquare size={24} strokeWidth={1.5} className="text-white/10 mx-auto mb-2" />
                            <p className="text-xs text-white/25">No comments yet. Be the first!</p>
                        </div>
                    )}

                    <div className="flex flex-col" style={{ borderTop: comments.length ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        {comments.map(comment => (
                            <div key={comment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <CommentItem
                                    comment={comment}
                                    postAuthorId={post.authorId}
                                    depth={0}
                                    user={user}
                                    onReply={handleReply}
                                    onLike={handleCommentLike}
                                    onUnlike={handleCommentUnlike}
                                    onDelete={handleCommentDelete}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
