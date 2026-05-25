import { useState, useEffect, useRef } from 'react';
import { X, Search, Loader } from 'lucide-react';
import { UserProfileAPIService } from '../../api_services/users/UserProfileAPIService';
import type { UserDto } from '../../models/users/UserDto';

interface Props {
    userId: number;
    isOpen: boolean;
    onClose: () => void;
    onFollowerRemoved?: () => void;
    currentUserId?: number;
    token?: string;
}

export default function FollowersList({ userId, isOpen, onClose, onFollowerRemoved, currentUserId, token }: Props) {
    const [followers, setFollowers] = useState<UserDto[]>([]);
    const [filteredFollowers, setFilteredFollowers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [removingId, setRemovingId] = useState<number | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const isOwnProfile = currentUserId === userId;

    useEffect(() => {
        if (isOpen) {
            loadFollowers();
        }
    }, [isOpen, userId]);

    useEffect(() => {
        const filtered = followers.filter(follower =>
            follower.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${follower.firstName} ${follower.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredFollowers(filtered);
    }, [searchQuery, followers]);

    const loadFollowers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await UserProfileAPIService.getUserFollowers(userId);
            if (res.success && res.data) {
                setFollowers(res.data);
                setFilteredFollowers(res.data);
            } else {
                setError(res.message || 'Failed to load followers');
            }
        } catch (err) {
            setError('Error loading followers');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFollower = async (followerId: number) => {
        if (!isOwnProfile || !token) return;

        setRemovingId(followerId);
        try {
            const res = await UserProfileAPIService.removeFollower(followerId, token);
            if (res.success) {
                setFollowers(followers.filter(f => f.id !== followerId));
                setFilteredFollowers(filteredFollowers.filter(f => f.id !== followerId));
                onFollowerRemoved?.();
            } else {
                alert(res.message || 'Failed to remove follower');
            }
        } catch (err) {
            console.error('Error removing follower:', err);
            alert('Error removing follower');
        } finally {
            setRemovingId(null);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="w-full max-w-2xl max-h-[80vh] rounded-xl overflow-hidden flex flex-col"
                style={{
                    background: 'linear-gradient(135deg, #0a0a14 0%, #08080e 100%)',
                    border: '1px solid rgba(108, 99, 255, 0.3)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                    <h2 className="font-syne text-xl font-bold text-white">Followers</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-muted-ghost" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-border-subtle">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-3 text-muted-ghost" />
                        <input
                            type="text"
                            placeholder="Search followers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-base border border-border-subtle rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-muted-ghost focus:outline-none focus:border-pulse"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader size={24} className="text-pulse animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center">
                            <p className="text-red-400">{error}</p>
                            <button
                                onClick={loadFollowers}
                                className="mt-3 px-4 py-2 bg-pulse/10 text-pulse rounded-lg hover:bg-pulse/20 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredFollowers.length === 0 ? (
                        <div className="p-6 text-center text-muted-ghost">
                            {searchQuery ? 'No followers match your search' : 'No followers yet'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                            {filteredFollowers.map((follower) => (
                                <div
                                    key={follower.id}
                                    className="p-4 rounded-lg bg-surface-base/50 border border-border-subtle hover:border-pulse/50 transition-all"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className="shrink-0">
                                            {follower.profileImage ? (
                                                <img
                                                    src={follower.profileImage}
                                                    alt={follower.username}
                                                    className="w-12 h-12 rounded-full object-cover border border-pulse/50"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-pulse/20 flex items-center justify-center border border-pulse/50">
                                                    <span className="text-pulse font-bold">
                                                        {follower.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white truncate">
                                                {follower.firstName} {follower.lastName}
                                            </p>
                                            <p className="text-sm text-muted-ghost truncate">@{follower.username}</p>
                                        </div>

                                        {/* Action Button */}
                                        {isOwnProfile && (
                                            <button
                                                onClick={() => handleRemoveFollower(follower.id)}
                                                disabled={removingId === follower.id}
                                                className="shrink-0 px-3 py-1.5 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 hover:border-red-500/50 transition-colors disabled:opacity-50"
                                            >
                                                {removingId === follower.id ? '...' : 'Remove'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
