import { Link, useNavigate } from 'react-router-dom';
import { Search, LogIn, UserPlus, User, Menu, Users, Loader2, X } from 'lucide-react';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { communityApi } from '../../api_services/community/CommunityAPIService';
import type { CommunityDto } from '../../models/communities/CommunityDto';
import { useState, useEffect, useRef } from 'react';
 
interface NavbarProps {
    onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CommunityDto[]>([]);
    const [searching, setSearching] = useState(false);
    const [open, setOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setOpen(false);
            return;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await communityApi.search(query.trim());
                if (res.success && res.data) {
                    setResults(res.data);
                    setOpen(true);
                }
            } catch {
                // silent
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleSelect(id: number) {
        setQuery('');
        setResults([]);
        setOpen(false);
        navigate(`/communities/${id}`);
    }

    function clearSearch() {
        setQuery('');
        setResults([]);
        setOpen(false);
    }

    return (
        <nav
            className="fixed top-0 left-0 w-full h-14 flex items-center px-4 z-50"
            style={{
                background: 'rgba(10, 10, 16, 0.97)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',                
            }}
        >
            {onToggleSidebar && (
                <button
                    onClick={onToggleSidebar}
                    className="p-2 mr-2 lg:hidden"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <Menu size={20} strokeWidth={1.5} className="text-white/60" />
                </button>
            )}           
            <Link to="/" className="no-underline flex items-center gap-1 sm:mr-6 shrink-0">
                <span
                    className="text-white font-black text-xl tracking-tight hidden sm:inline"
                    style={{fontFamily:"'Syne', sans-serif"}}
                >
                    Pulse<span className="text-pulse">Net</span>
                </span>
            </Link>

                <div className="flex-1 flex px-2 sm:px-4 lg:justify-center lg:pl-[380px]">
                    <div className="w-full lg:max-w-[530px] relative" ref={searchRef}>
                        <div
                            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all focus-within:ring-1 focus-within:ring-pulse"
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(99,102,241,0.4)',
                            }}
                        >
                            {searching
                                ? <Loader2 size={16} strokeWidth={1.5} className="text-white/40 animate-spin shrink-0" />
                                : <Search size={16} strokeWidth={1.5} className="text-white/40 shrink-0" />
                            }
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onFocus={() => results.length > 0 && setOpen(true)}
                                placeholder="Search communities…"
                                className="bg-transparent border-none outline-none text-sm text-white/80 placeholder:text-white/30 w-full"
                            />
                            {query && (
                                <button
                                    onClick={clearSearch}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                    <X size={14} strokeWidth={2} className="text-white/30 hover:text-white/60 shrink-0" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown */}
                        {open && (
                            <div
                                className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
                                style={{
                                    background: 'rgba(14,14,22,0.98)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                                }}
                            >
                                {results.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-sm text-white/30">
                                        No communities found
                                    </div>
                                ) : (
                                    <div className="py-1.5 max-h-[320px] overflow-y-auto">
                                        {results.map(community => (
                                            <button
                                                key={community.id}
                                                onClick={() => handleSelect(community.id)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
                                                    style={{
                                                        background: community.avatar ? 'transparent' : 'rgba(108,99,255,0.12)',
                                                    }}
                                                >
                                                    {community.avatar ? (
                                                        <img src={community.avatar} alt={community.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-black text-white/50" style={{ fontFamily: "'Syne', sans-serif" }}>
                                                            {community.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white/80 truncate">
                                                        c/{community.name}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Users size={11} strokeWidth={1.5} className="text-white/25" />
                                                        <span className="text-xs text-white/30">
                                                            {community.memberCount} member{community.memberCount !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            <div className="flex items-center gap-2 ml-6">
                {user ? (
                    <div className="flex items-center gap-3">
                    <Link
                        to="/profile"
                        className="no-underline flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
                    >
                        {user.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt={user.username}
                                className="w-7 h-7 rounded-full object-cover"
                                style={{border: '1px solid rgba(255,255,255,0.12)'}}
                            />
                        ) : (
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(255,255,255,0.1)' }}
                                >
                                    <User size={14} strokeWidth={1.5} className="text-white/60" />
                                </div>
                            )}
                            <span className="text-sm text-white/80 font-medium hidden sm:block">
                                {user.username}
                            </span>
                </Link>
                  <button 
                    onClick={logout}
                    className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded"   
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            Log out
                        </button>                       
            </div>
                ) : (
                    
            <div className="flex items-center gap-1 shrink-0">
                <Link
                    to="/login"
                    className="no-underline flex items-center px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-white/80 hover:bg-white/5 transition-colors whitespace-nowrap"
                >
                    <LogIn size={14} strokeWidth={1.5} className="text-white/60 sm:mr-1.5" />
                    <span className="hidden md:inline">Log In</span>
                </Link>
                <Link
                    to="/register"
                    className="no-underline flex items-center px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-white whitespace-nowrap"
                    style={{ background: 'var(--color-pulse, #6366f1)' }}
                >
                    <UserPlus size={14} strokeWidth={1.5} className="sm:mr-1.5" />
                    <span className="hidden md:inline">Sign Up</span>
                </Link>
            </div>
                )}
            </div>
        </nav>
        );      
}