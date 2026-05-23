import { useEffect, useState, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import PostCard from '../../components/post/Postcard';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { postApi } from '../../api_services/post/PostAPIService';
import { communityApi } from '../../api_services/community/CommunityAPIService';
import type { PostDto } from '../../models/posts/PostsDto';
import { Loader2 } from 'lucide-react';

export default function FeedPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<PostDto[]>([]);
    const [communities, setCommunities] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError('');

        const data = user
            ? await postApi.getFeed()
            : await postApi.getPublicPosts();

        if (data.success) {
            setPosts(data.data ?? []);
        } else {
            setError(data.message || 'Failed to load posts');
        }

        setLoading(false);
    }, [user]);

    const fetchCommunities = useCallback(async () => {
        const data = await communityApi.getMine();
        if (data.success && data.data) {
            setCommunities(data.data.map(c => ({ id: c.id, name: c.name })));
        }
    }, []);

    useEffect(() => {
        fetchPosts();
        if (user) fetchCommunities();
    }, [user, fetchPosts, fetchCommunities]);

    return (
        <AppLayout communities={communities}>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2">
                    <h1
                        className="text-lg font-bold text-white/90"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        {user ? 'Your Feed' : 'Popular Posts'}
                    </h1>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} strokeWidth={1.5} className="text-white/30 animate-spin" />
                    </div>
                )}

                {!loading && error && (
                    <div
                        className="rounded-lg px-4 py-6 text-center text-sm text-white/50"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <p>{error}</p>
                        <button
                            onClick={fetchPosts}
                            className="mt-3 text-xs text-pulse hover:underline"
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && posts.length === 0 && (
                    <div
                        className="rounded-lg px-4 py-12 text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <p className="text-sm text-white/40 mb-2">
                            {user
                                ? 'No posts yet. Join some communities or follow users to see their posts here.'
                                : 'No public posts yet. Be the first to post!'}
                        </p>
                    </div>
                )}

                {!loading && posts.map(post => (
                    <PostCard
                        key={post.id}
                        id={post.id}
                        title={post.title}
                        content={post.content}
                        mediaUrl={post.mediaUrl}
                        communityId={post.communityId}
                        communityName={post.communityName}
                        authorId={post.authorId}
                        authorUsername={post.authorUsername}
                        authorProfileImage={post.authorProfileImage}
                        isLiked={post.isLiked}
                        likeCount={post.likeCount}
                        commentCount={post.commentCount}
                        tags={post.tags}
                        createdAt={post.createdAt}
                    />
                ))}
            </div>
        </AppLayout>
    );
}