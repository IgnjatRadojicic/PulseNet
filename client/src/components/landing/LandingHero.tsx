import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuthHook';

export default function LandingHero() {
    const navigate = useNavigate();
    const {user} = useAuth();

    return (
        <section className="px-6 md:px-16 pt-16 md:pt-24 pb-12 md:pb-16 max-w-4xl">
            <p className="text-xs tracking-mega uppercase mb-6 font-normal text-pulse-80">
                Distributed social infrastructure
            </p>
            <h1 className="font-syne text-white font-black mb-6" style={{ fontSize: 'clamp(2.2rem, 6vw, 5.5rem)', lineHeight: '0.95', letterSpacing: '-0.03em' }}>
                Where{' '}
                <em className="not-italic text-transparent" style={{ WebkitTextStroke: '1px rgba(108,99,255,0.7)' }}>
                    communities
                </em>
                <br />pulse with signal
            </h1>
            <p className="text-base md:text-lg font-light leading-relaxed mb-10 md:mb-12 max-w-xl text-muted">
                PulseNet is a distributed social networking platform combining the depth of community forums
                with the immediacy of real-time discussion. Built on a master-slave replicated database
                architecture with automatic failover.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center">
                { user ? (
                <button
                    onClick={() => navigate('/register')}
                    className="text-white text-sm tracking-widest px-9 py-3 cursor-pointer transition-all hover:-translate-y-px bg-pulse border-none rounded-half"
                >
                    See the Feed
                </button> ) :
                (
                <button
                    onClick={() => navigate('/register')}
                    className="text-white text-sm tracking-widest px-9 py-3 cursor-pointer transition-all hover:-translate-y-px bg-pulse border-none rounded-half"
                >
                    Join the network
                </button> )                    
                
               } 
                <button
                    onClick={() => navigate('/feed')}
                    className="bg-transparent text-white/45 text-sm font-light tracking-widest flex items-center gap-2 cursor-pointer border-none transition-colors hover:text-white"
                >
                    Explore communities
                    <span
                        className="inline-block w-3 h-3 rotate-45"
                        style={{ borderRight: '1px solid currentColor', borderTop: '1px solid currentColor' }}
                    />
                </button>
            </div>
        </section>
    );
}