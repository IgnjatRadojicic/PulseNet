import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center"
            style={{ background: '#050508', fontFamily: 'DM Sans, sans-serif' }}
        >
            <p className="text-xs tracking-widest uppercase mb-4" style={{ color: 'rgba(108,99,255,0.6)', letterSpacing: '0.18em' }}>
                404
            </p>
            <h1
                className="text-white font-black mb-4"
                style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(3rem,8vw,6rem)', lineHeight: '1', letterSpacing: '-0.03em' }}
            >
                Not found
            </h1>
            <p className="text-sm font-light mb-12 text-center max-w-xs" style={{ color: 'rgba(232,230,240,0.4)', lineHeight: '1.8' }}>
                The page you are looking for does not exist or has been moved.
            </p>
            <button
                onClick={() => navigate('/')}
                className="text-white text-sm tracking-widest px-9 py-3 cursor-pointer transition-all hover:-translate-y-px"
                style={{ background: '#6c63ff', border: 'none', borderRadius: '2px' }}
            >
                Back to home
            </button>
        </div>
    );
}