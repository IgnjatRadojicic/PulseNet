import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function LandingCTA() {
    const navigate = useNavigate();
    const dotRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        let frame: number;
        let t = 0;
        function pulse() {
            t += 0.05;
            if (dotRef.current) {
                dotRef.current.style.opacity = String(Math.sin(t) * 0.35 + 0.65);
            }
            frame = requestAnimationFrame(pulse);
        }
        frame = requestAnimationFrame(pulse);
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <section className="px-6 md:px-16 py-20 md:py-32 text-center border-t border-border-subtle">
            <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase mb-8 text-pulse-half border border-pulse-50 py-1 px-3 rounded-px">
                <span ref={dotRef} className="w-1.5 h-1.5 rounded-full inline-block bg-pulse" />
                Master node active
            </div>
            <h2 className="font-syne text-section leading-none tracking-display text-white font-black mb-6">
                Spreman za<br />konekciju?
            </h2>
            <p className="text-base font-light leading-loose mb-10 md:mb-12 max-w-sm mx-auto text-muted-soft">
                Registruj se i postani deo mreže zajednica izgrađene na distribuiranoj infrastrukturi.
            </p>
            <button
                onClick={() => navigate('/register')}
                className="text-white text-sm tracking-widest px-9 py-3 cursor-pointer transition-all hover:-translate-y-px bg-pulse border-none rounded-half"
            >
                Kreiraj nalog
            </button>
        </section>
    );
}