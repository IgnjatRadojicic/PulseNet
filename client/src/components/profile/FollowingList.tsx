import { useState, useEffect, useRef } from 'react';
import { X, Search, Loader } from 'lucide-react';
import { UserProfileAPIService } from '../../api_services/users/UserProfileAPIService';
import type { UserDto } from '../../models/users/UserDto';

interface Props {
    userId: number;
    isOpen: boolean;
    onClose: () => void;
    onFollowingChanged?: () => void;
    currentUserId?: number;
    token?: string;
}

export default function FollowingList({ userId, isOpen, onClose, onFollowingChanged, currentUserId, token }: Props) {
    const [following, setFollowing] = useState<UserDto[]>([]);
    const [filteredFollowing, setFilteredFollowing] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [unfollowingId, setUnfollowingId] = useState<number | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const isOwnProfile = currentUserId === userId;

    useEffect(() => {
        if (isOpen) {
            loadFollowing();
        }
    }, [isOpen, userId]);

    useEffect(() => {
        const filtered = following.filter(user =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredFollowing(filtered);
    }, [searchQuery, following]);

    const loadFollowing = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await UserProfileAPIService.getUserFollowing(userId);
            if (res.success && res.data) {
                setFollowing(res.data);
                setFilteredFollowing(res.data);
            } else {
                setError(res.message || 'Failed to load following');
            }
        } catch (err) {
            setError('Error loading following');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async (followingId: number) => {
        if (!token) return;

        setUnfollowingId(followingId);
        try {
            const res = await UserProfileAPIService.unfollowUser(token, followingId);
            if (res.success) {
                setFollowing(following.filter(f => f.id !== followingId));
                setFilteredFollowing(filteredFollowing.filter(f => f.id !== followingId));
                onFollowingChanged?.();
            } else {
                alert(res.message || 'Failed to unfollow');
            }
        } catch (err) {
            console.error('Error unfollowing user:', err);
            alert('Error unfollowing user');
        } finally {
            setUnfollowingId(null);
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
                    <h2 className="font-syne text-xl font-bold text-white">Following</h2>
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
                            placeholder="Search following..."
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
                                onClick={loadFollowing}
                                className="mt-3 px-4 py-2 bg-pulse/10 text-pulse rounded-lg hover:bg-pulse/20 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredFollowing.length === 0 ? (
                        <div className="p-6 text-center text-muted-ghost">
                            {searchQuery ? 'No users match your search' : 'Not following anyone yet'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                            {filteredFollowing.map((user) => (
                                <div
                                    key={user.id}
                                    className="p-4 rounded-lg bg-surface-base/50 border border-border-subtle hover:border-pulse/50 transition-all"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className="shrink-0">
                                            {user.profileImage ? (
                                                <img
                                                    src={user.profileImage}
                                                    alt={user.username}
                                                    className="w-12 h-12 rounded-full object-cover border border-pulse/50"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-pulse/20 flex items-center justify-center border border-pulse/50">
                                                    <span className="text-pulse font-bold">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white truncate">
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <p className="text-sm text-muted-ghost truncate">@{user.username}</p>
                                        </div>

                                        {/* Action Button */}
                                        {isOwnProfile && (
                                            <button
                                                onClick={() => handleUnfollow(user.id)}
                                                disabled={unfollowingId === user.id}
                                                className="shrink-0 px-3 py-1.5 text-xs bg-surface-hover border border-border-subtle rounded-lg text-muted hover:border-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                            >
                                                {unfollowingId === user.id ? '...' : 'Unfollow'}
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
