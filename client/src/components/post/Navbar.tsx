import { Link } from 'react-router-dom';
import { Search, LogIn, UserPlus, User } from 'lucide-react';
import { useAuth } from '../../hooks/auth/useAuthHook';
 
export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav
            className="fixed top-0 left-0 w-full h-14 flex items-center px-4 z-50"
            style={{
                background: 'rgba(10, 10, 16, 0.97)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',                
            }}
        >
            <Link to="/" className="no-underline flex items-center gap-1 mr-6">
                <span
                    className="text-white font-black text-xl tracking-tight"
                    style={{fontFamily:"'Syne', sans-serif"}}
                >
                    Pulse<span className="text-pulse">Net</span>
                </span>
            </Link>

            <div className="flex-1 max-w-[600px] mx-auto">
                <div 
                    className='flex items-center gap-2 px-4 py-2 rounded-full transition-colors'
                    style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    <Search size={16} strokeWidth={1.5} className="text-white/40" />
                    <input
                        type="text"
                        placeholder="Search PulseNet"
                        className="bg-transparent border-none outline-none text-sm text-white/80 placeholder:text-white/30 w-full"
                    />
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
                    
                    <div className="flex items-center gap-2">
                        <Link
                            to="/login"
                            className="no-underline flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:bg-white/5 transition-colors"
                        >
                            <LogIn size={16} strokeWidth={1.5} className="text-white/60" />
                            <span>Log In</span>
                        </Link>
                        <Link
                            to="/register"
                            className="no-underline flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white"
                            style={{
                                background: 'var(--color-pulse, #6366f1)',
                            }}
                        >
                            <UserPlus size={16} strokeWidth={1.5} />
                            <span>Sign Up</span>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
        );      
}