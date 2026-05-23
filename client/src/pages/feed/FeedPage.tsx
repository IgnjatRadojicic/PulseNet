import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import PostCard from '../../components/post/Postcard';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { API } from '../../constants/api';
import { Loader2 } from 'lucide-react';
 
interface PostData {
    id: number;
    title: string;
    content: string;
    mediaUrl: string | null;
    communityId: number;
    communityName: string;
    authorId: number;
    authorUsername: string;
    authorProfileImage: string | null;
    isLiked: boolean;
    likeCount: number;
    commentCount: number;
    tags: string[];
    createdAt: string | null;
    updatedAt: string | null;
}
 
export default function FeedPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
 
// Na vrhu FeedPage, zameni fetchPosts sa:
useEffect(() => {
    setPosts([
        {
            id: 1,
            title: 'Welcome to PulseNet',
            content: 'This is the first post on the platform. Join communities and start posting!',
            mediaUrl: null,
            communityId: 1,
            communityName: 'General',
            authorId: 1,
            authorUsername: 'admin',
            authorProfileImage: null,
            isLiked: false,
            likeCount: 12,
            commentCount: 3,
            tags: ['welcome', 'intro'],
            createdAt: new Date().toISOString(),
            updatedAt: null,
        },
        {
            id: 2,
            title: 'How does the distributed database work?',
            content: 'Our system uses MySQL Master-Slave replication with automatic failover. The master handles all writes while reads are distributed across slave nodes using round-robin load balancing.',
            mediaUrl: null,
            communityId: 2,
            communityName: 'Tech',
            authorId: 2,
            authorUsername: 'forn',
            authorProfileImage: null,
            isLiked: true,
            likeCount: 27,
            commentCount: 8,
            tags: ['database', 'distributed'],
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: null,
        },
    ]);
    setLoading(false);
}, []);


    async function fetchPosts() {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const isLoggedIn = !!user && !!token;
 
            const endpoint = isLoggedIn
                ? `${API.BASE_URL}posts/feed`
                : `${API.BASE_URL}posts/public?limit=50`;
 
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (isLoggedIn) {
                headers['Authorization'] = `Bearer ${token}`;
            }
 
            const res = await fetch(endpoint, { headers });
            const data = await res.json();
 
            if (data.success) {
                setPosts(data.data ?? []);
            } else {
                setError(data.message || 'Failed to load posts');
            }
        } catch {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    }
    return (
        <AppLayout>        
            <div className="flex flex-col gap-3">
                {/* Page header */}
                <div className="flex items-center justify-between mb-2">
                    <h1
                        className="text-lg font-bold text-white/90"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        {user ? 'Your Feed' : 'Popular Posts'}
                    </h1>
                </div>  

               {/* Loading State */}
               {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} strokeWidth={1.5} className="text-white/30 animate-spin"/>
                    </div>
               )}  
                {/* Error state */}
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
 
                {/* Empty state */}
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
 
                {/* Posts */}
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