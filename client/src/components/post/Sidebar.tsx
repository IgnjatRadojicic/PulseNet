import { Link, useLocation } from 'react-router-dom';
import { Home, Info, HelpCircle , Plus, Activity, ChevronDown, ChevronUp, Menu, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FEED } from '../../constants/feed';
import CreateCommunityModal from '../../pages/communities/CreateCommunityModal';
import JoinCommunityModal from '../../pages/communities/JoinCommunityModal';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { communityApi } from '../../api_services/community/CommunityAPIService';

interface SidebarItem {
    label: string;
    path: string;
    icon: React.ReactNode;
}

interface SidebarSection {
    title?: string;
    items: SidebarItem[];
    collapsible?: boolean;
}

function iconProps() {
    return { size: FEED.ICON_SIZE, strokeWidth: FEED.ICON_STROKE, className: 'text-white/70' };
}

function useMyCommunities(isLoggedIn: boolean) {
    const [fetched, setFetched] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        if (!isLoggedIn) return;

        communityApi.getMine().then(res => {
            if (res.success && res.data) {
                setFetched(res.data.map(c => ({ id: c.id, name: c.name })));
            }
        });
    }, [isLoggedIn]);

    // Derive  no setState needed when logged out
    const communities = isLoggedIn ? fetched : [];

    function addCommunity(community: { id: number; name: string }) {
        setFetched(prev =>
            prev.some(c => c.id === community.id) ? prev : [...prev, community]
        );
    }

    return { communities, addCommunity };
}

function buildSections(isLoggedIn: boolean, isAdmin: boolean, userCommunities: { id: number; name: string }[]): SidebarSection[] {
    const sections: SidebarSection[] = [];

    sections.push({
        items: [
            { label: 'Home', path: '/feed', icon: <Home {...iconProps()} /> },
        ],
    });

    if (isLoggedIn && userCommunities.length > 0) {
        sections.push({
            title: 'MY COMMUNITIES',
            collapsible: true,
            items: userCommunities.map(c => ({
                label: c.name,
                path: `/communities/${c.id}`,
                icon: (
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/70">
                        {c.name.charAt(0).toUpperCase()}
                    </div>
                ),
            })),
        });
    }

    if (isAdmin) {
        sections.push({
            title: 'ADMIN',
            collapsible: true,
            items: [
                { label: 'Dashboard', path: '/admin', icon: <Activity {...iconProps()} /> },
            ],
        });
    }

    sections.push({
        title: 'RESOURCES',
        collapsible: true,
        items: [
            { label: 'About', path: '/about', icon: <Info {...iconProps()} /> },
            { label: 'Help', path: '/help', icon: <HelpCircle {...iconProps()} /> },
        ],
    });

    return sections;
}

function SidebarSectionBlock({ section }: { section: SidebarSection }) {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="mb-1">
            {section.title && (
                <button
                    onClick={() => section.collapsible && setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-bold tracking-[0.15em] text-white/40 uppercase hover:text-white/60 transition-colors"
                    style={{ cursor: section.collapsible ? 'pointer' : 'default', background: 'none', border: 'none' }}
                >
                    <span>{section.title}</span>
                    {section.collapsible && (
                        collapsed
                            ? <ChevronDown size={14} strokeWidth={2} className="text-white/30" />
                            : <ChevronUp size={14} strokeWidth={2} className="text-white/30" />
                    )}
                </button>
            )}

            {!collapsed && (
                <div className="flex flex-col gap-0.5">
                    {section.items.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path} className="no-underline">
                                <div
                                    className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-150 ${
                                        isActive
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    {item.icon}
                                    <span className="text-sm font-medium truncate">{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const { user } = useAuth();
    const isLoggedIn = !!user;
    const isAdmin = user?.role === 'admin';
    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);

    const { communities, addCommunity } = useMyCommunities(isLoggedIn);
    const sections = buildSections(isLoggedIn, isAdmin, communities);

    if (!isOpen) {
        return (
            <div className="fixed top-14 left-0 w-[50px] h-[calc(100vh-56px)] hidden lg:block" style={{ zIndex: 40 }}>
                <aside
                    className="w-full h-full"
                    style={{
                        background: 'rgba(10, 10, 16, 0.95)',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                    }}
                />
                <button
                    onClick={onToggle}
                    className="absolute top-20 -right-4 z-10 p-1.5 rounded-full hover:bg-white/10 transition-colors hidden lg:block"
                    style={{
                        background: 'rgba(10, 10, 16, 0.95)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        cursor: 'pointer',
                    }}
                >
                    <Menu size={20} strokeWidth={1.5} className="text-white/60" />
                </button>
            </div>
        );
    }

    return (
        <div className="fixed top-14 left-0 w-[270px] h-[calc(100vh-56px)]" style={{ zIndex: 40 }}>
            <div
                className="fixed inset-0 top-14 bg-black/50 lg:hidden"
                style={{ zIndex: -1 }}
                onClick={onToggle}
            />
            <button
                onClick={onToggle}
                className="absolute top-20 -right-4 z-10 p-1.5 rounded-full hover:bg-white/10 transition-colors hidden lg:block"
                style={{
                    background: 'rgba(10, 10, 16, 0.95)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    cursor: 'pointer',
                }}
            >
                <Menu size={20} strokeWidth={1.5} className="text-white/60" />
            </button>

            <aside
                className="w-full h-full overflow-y-auto"
                style={{
                    background: 'rgba(10, 10, 16, 0.95)',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <div className="py-3 pt-6 flex flex-col">
                    {sections.map((section, i) => (
                        <div key={i}>
                            {i > 0 && <div className="mx-4 my-2 border-t border-white/6" />}
                            <SidebarSectionBlock section={section} />
                        </div>
                    ))}

                    {isLoggedIn && (
                        <>
                            <div className="mx-4 my-2 border-t border-white/6" />
                            <div className="px-2 flex flex-col gap-0.5">
                                <button
                                    onClick={() => setJoinOpen(true)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-white/60 hover:bg-white/5 hover:text-white"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(108,99,255,0.15)' }}>
                                        <UserPlus size={11} strokeWidth={2.5} style={{ color: '#6c63ff' }} />
                                    </div>
                                    Join Community
                                </button>

                                <button
                                    onClick={() => setCreateOpen(true)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-white/60 hover:bg-white/5 hover:text-white"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(108,99,255,0.15)' }}>
                                        <Plus size={12} strokeWidth={2.5} style={{ color: '#6c63ff' }} />
                                    </div>
                                    Create Community
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </aside>

            <CreateCommunityModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={(community) => {
                    setCreateOpen(false);
                    addCommunity(community);
                }}
            />

            <JoinCommunityModal
                isOpen={joinOpen}
                onClose={() => setJoinOpen(false)}
                onJoined={(community) => {
                    setJoinOpen(false);
                    addCommunity(community);
                }}
            />
        </div>
    );
}