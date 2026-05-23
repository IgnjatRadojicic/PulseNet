import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/auth/useAuthHook';

export default function LandingNav() {
    const navigate = useNavigate();
    const {user} = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="flex items-center justify-between px-6 md:px-16 py-6 md:py-8 border-b border-white/5">
            <div className="font-syne text-white font-black text-2xl tracking-tight">
                Pulse<span className="text-pulse">Net</span>
            </div>

            {/* Desktop nav */}
            <ul className="hidden md:flex gap-10 list-none">
                <li><a href="#features" className="text-white/55 no-underline text-sm font-light tracking-wider hover:text-white transition-colors">Communities</a></li>
                <li><a href="#architecture" className="text-white/55 no-underline text-sm font-light tracking-wider hover:text-white transition-colors">Architecture</a></li>
                <li><a href="#roles" className="text-white/55 no-underline text-sm font-light tracking-wider hover:text-white transition-colors">Roles</a></li>
            </ul>

            {user ? (
                <button
                    onClick={() => navigate('/feed')}
                    className="hidden md:block bg-transparent text-purple-400 text-sm tracking-wider px-5 py-2 cursor-pointer transition-all hover:bg-pulse-50 border border-pulse-half rounded-half"
                >
                    Go to Feed
                </button>
            ) : (
                <button
                    onClick={() => navigate('/login')}
                    className="hidden md:block bg-transparent text-purple-400 text-sm tracking-wider px-5 py-2 cursor-pointer transition-all hover:bg-pulse-50 border border-pulse-half rounded-half"
                >
                    Get started
                </button>
            )}

            {/* Mobile hamburger */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden bg-transparent border-none text-white cursor-pointer p-1"
                aria-label="Toggle menu"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {menuOpen ? (
                        <path d="M6 6l12 12M6 18L18 6" />
                    ) : (
                        <path d="M4 7h16M4 12h16M4 17h16" />
                    )}
                </svg>
            </button>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="absolute top-[70px] left-0 w-full bg-surface-base border-b border-border-subtle flex flex-col px-6 py-6 gap-4 md:hidden" style={{ zIndex: 50 }}>
                    <a href="#features" onClick={() => setMenuOpen(false)} className="text-white/55 no-underline text-sm font-light tracking-wider">Communities</a>
                    <a href="#architecture" onClick={() => setMenuOpen(false)} className="text-white/55 no-underline text-sm font-light tracking-wider">Architecture</a>
                    <a href="#roles" onClick={() => setMenuOpen(false)} className="text-white/55 no-underline text-sm font-light tracking-wider">Roles</a>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-transparent text-purple-400 text-sm tracking-wider px-5 py-2 cursor-pointer border border-pulse-half rounded-half w-fit"
                    >
                        Get started
                    </button>
                </div>
            )}
        </nav>
    );
}