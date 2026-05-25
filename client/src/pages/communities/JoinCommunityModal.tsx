import { useEffect, useState, useRef } from 'react';
import { X, Search, Users, Globe, Lock, Loader2, UserPlus, Check } from 'lucide-react';
import { communityApi } from '../../api_services/community/CommunityAPIService';
import { useNavigate } from 'react-router-dom';
import type { CommunityDto } from '../../models/communities/CommunityDto';

interface JoinCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Called with the newly joined community so the sidebar can update */
    onJoined?: (community: { id: number; name: string }) => void;
}

export default function JoinCommunityModal({ isOpen, onClose, onJoined }: JoinCommunityModalProps) {
    const navigate = useNavigate();
    const searchRef = useRef<HTMLInputElement>(null);

    const [allPublic, setAllPublic] = useState<CommunityDto[]>([]);
    const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    // Track join loading per community id
    const [joiningId, setJoiningId] = useState<number | null>(null);
    // Track newly joined in this session so we can show a checkmark
    const [sessionJoined, setSessionJoined] = useState<Set<number>>(new Set());

    // Load communities when modal opens
    useEffect(() => {
        if (!isOpen) return;

        setQuery('');
        setSessionJoined(new Set());

        async function load() {
            setLoading(true);
            try {
                const [publicRes, mineRes] = await Promise.all([
                    communityApi.getPublic(),
                    communityApi.getMine(),
                ]);

                if (publicRes.success && publicRes.data) {
                    setAllPublic(publicRes.data);
                }
                if (mineRes.success && mineRes.data) {
                    setJoinedIds(new Set(mineRes.data.map(c => c.id)));
                }
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        }

        load();
        // Auto-focus search after data loads
        setTimeout(() => searchRef.current?.focus(), 100);
    }, [isOpen]);

    async function handleJoin(community: CommunityDto) {
        if (joiningId !== null) return;
        setJoiningId(community.id);
        try {
            const res = await communityApi.join(community.id);
            if (res.success) {
                setJoinedIds(prev => new Set([...prev, community.id]));
                setSessionJoined(prev => new Set([...prev, community.id]));
                onJoined?.({ id: community.id, name: community.name });
            }
        } catch {
            // silent
        } finally {
            setJoiningId(null);
        }
    }

    function handleNavigate(id: number) {
        onClose();
        navigate(`/communities/${id}`);
    }

    // Filter: search + exclude already-joined (unless just joined this session)
    const filtered = allPublic.filter(c => {
        const matchesQuery =
            !query.trim() ||
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            (c.description ?? '').toLowerCase().includes(query.toLowerCase());

        // Show unjоined, or ones joined this session (so user sees the checkmark)
        const showable = !joinedIds.has(c.id) || sessionJoined.has(c.id);

        return matchesQuery && showable;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-[480px] rounded-xl overflow-hidden flex flex-col"
                style={{
                    background: 'rgba(14, 14, 22, 0.98)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,99,255,0.08)',
                    maxHeight: '80vh',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 shrink-0"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <h2
                        className="text-base font-bold text-white/90"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Join a Community
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <X size={18} strokeWidth={1.5} className="text-white/40" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 py-3 shrink-0">
                    <div
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all focus-within:ring-1 focus-within:ring-pulse"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}
                    >
                        <Search size={14} strokeWidth={1.5} className="text-white/30 shrink-0" />
                        <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search communities…"
                            className="bg-transparent border-none outline-none text-sm text-white/80 placeholder:text-white/25 w-full"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="shrink-0"
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <X size={12} strokeWidth={2} className="text-white/30 hover:text-white/60" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Community list */}
                <div className="overflow-y-auto flex-1 px-4 pb-4">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={20} strokeWidth={1.5} className="text-white/30 animate-spin" />
                        </div>
                    )}

                    {!loading && filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Users size={28} strokeWidth={1.5} className="text-white/15 mb-3" />
                            <p className="text-sm text-white/35">
                                {query ? 'No communities match your search.' : "You've already joined all public communities!"}
                            </p>
                        </div>
                    )}

                    {!loading && filtered.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {filtered.map(community => {
                                const alreadyJoined = joinedIds.has(community.id);
                                const isJustJoined = sessionJoined.has(community.id);
                                const isJoining = joiningId === community.id;

                                return (
                                    <div
                                        key={community.id}
                                        className="flex items-center gap-3 p-3 rounded-lg transition-all"
                                        style={{
                                            background: isJustJoined
                                                ? 'rgba(108,99,255,0.06)'
                                                : 'rgba(255,255,255,0.02)',
                                            border: isJustJoined
                                                ? '1px solid rgba(108,99,255,0.2)'
                                                : '1px solid rgba(255,255,255,0.05)',
                                        }}
                                    >
                                        {/* Avatar */}
                                        <button
                                            onClick={() => handleNavigate(community.id)}
                                            className="shrink-0"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center"
                                                style={{
                                                    background: community.avatar
                                                        ? 'transparent'
                                                        : 'rgba(108,99,255,0.12)',
                                                }}
                                            >
                                                {community.avatar ? (
                                                    <img
                                                        src={community.avatar}
                                                        alt={community.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span
                                                        className="text-base font-black text-white/50"
                                                        style={{ fontFamily: "'Syne', sans-serif" }}
                                                    >
                                                        {community.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </button>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <button
                                                onClick={() => handleNavigate(community.id)}
                                                className="text-left w-full"
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-semibold text-white/85 hover:text-white transition-colors truncate">
                                                        c/{community.name}
                                                    </span>
                                                    {community.type === 'private' ? (
                                                        <Lock size={11} strokeWidth={1.5} className="text-white/30 shrink-0" />
                                                    ) : (
                                                        <Globe size={11} strokeWidth={1.5} className="text-white/30 shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Users size={11} strokeWidth={1.5} className="text-white/25" />
                                                    <span className="text-xs text-white/30">
                                                        {community.memberCount} member{community.memberCount !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                {community.description && (
                                                    <p className="text-xs text-white/35 mt-1 truncate">
                                                        {community.description}
                                                    </p>
                                                )}
                                            </button>
                                        </div>

                                        {/* Join / Joined button */}
                                        <div className="shrink-0">
                                            {isJustJoined ? (
                                                <div
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                                                    style={{
                                                        color: '#6c63ff',
                                                        background: 'rgba(108,99,255,0.1)',
                                                    }}
                                                >
                                                    <Check size={13} strokeWidth={2.5} />
                                                    Joined
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleJoin(community)}
                                                    disabled={!!joiningId || alreadyJoined}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110"
                                                    style={{
                                                        background: 'var(--color-pulse, #6c63ff)',
                                                        border: 'none',
                                                        cursor: joiningId ? 'not-allowed' : 'pointer',
                                                        opacity: joiningId && joiningId !== community.id ? 0.5 : 1,
                                                    }}
                                                >
                                                    {isJoining ? (
                                                        <Loader2 size={12} strokeWidth={2} className="animate-spin" />
                                                    ) : (
                                                        <UserPlus size={12} strokeWidth={1.5} />
                                                    )}
                                                    {community.type === 'private' ? 'Request' : 'Join'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
