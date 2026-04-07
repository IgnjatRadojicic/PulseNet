import { useEffect, useRef, useState } from 'react';
import LandingNav from '../../components/landing/LandingNav';
import LandingHero from '../../components/landing/LandingHero';
import LandingStats from '../../components/landing/LandingStats';
import LandingFeatures from '../../components/landing/LandingFeatures';
import LandingRoles from '../../components/landing/LandingRoles';
import LandingCTA from '../../components/landing/LandingCta';
import LandingFooter from '../../components/landing/LandingFooter';
import { useParticles } from '../../hooks/other/useParticles';
import { useEKG } from '../../hooks/other/useEKG';
import handImg from '../../assets/pointing-hand.png';

export default function LandingPage() {
    const landingRef = useRef<HTMLDivElement>(null);
    const ekgWrapRef = useRef<HTMLDivElement>(null);
    const pCanvasRef = useRef<HTMLCanvasElement>(null);
    const eCanvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef<{ x: number; y: number } | null>(null);

    const [ekgDims, setEkgDims] = useState({ W: 0, H: 0 });
    const [particleDims, setParticleDims] = useState({ W: 0, H: 0 });

    const { draw: drawParticles } = useParticles(pCanvasRef, mouseRef, particleDims.W, particleDims.H);
    const { draw: drawEKG } = useEKG(eCanvasRef, ekgDims.W, ekgDims.H);

    useEffect(() => {
        const landing = landingRef.current;
        const ekgWrap = ekgWrapRef.current;
        if (!landing || !ekgWrap) return;

        function resize() {
            if (!landing || !ekgWrap) return;
            const W = landing.offsetWidth;

            const ekgH = ekgWrap.offsetHeight;
            if (eCanvasRef.current) {
                eCanvasRef.current.width = W;
                eCanvasRef.current.height = ekgH;
            }
            setEkgDims({ W, H: ekgH });

            const vh = window.innerHeight;
            if (pCanvasRef.current) {
                pCanvasRef.current.width = W;
                pCanvasRef.current.height = vh;
            }
            setParticleDims({ W, H: vh });
        }

        resize();
        window.addEventListener('resize', resize);

        const ekgObserver = new ResizeObserver(() => {
            if (!landing || !ekgWrap) return;
            const W = landing.offsetWidth;
            const ekgH = ekgWrap.offsetHeight;
            if (eCanvasRef.current) {
                eCanvasRef.current.width = W;
                eCanvasRef.current.height = ekgH;
            }
            setEkgDims({ W, H: ekgH });
        });
        ekgObserver.observe(ekgWrap);

        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const onMouseLeave = () => {
            mouseRef.current = null;
        };

        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseleave', onMouseLeave);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseleave', onMouseLeave);
            ekgObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!ekgDims.W || !ekgDims.H || !particleDims.W || !particleDims.H) return;
        let animFrame: number;

        function loop() {
            drawParticles();
            drawEKG();
            animFrame = requestAnimationFrame(loop);
        }

        animFrame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animFrame);
    }, [ekgDims, particleDims, drawParticles, drawEKG]);

    return (
        <div
            ref={landingRef}
            className="relative overflow-hidden min-h-screen bg-surface-base text-muted font-dm"
        >
            <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400&display=swap" rel="stylesheet" />

            <canvas ref={pCanvasRef} className="fixed top-0 left-0 w-full pointer-events-none" style={{ zIndex: 0, height: '100vh' }} />

            <img
                src={handImg}
                alt=""
                className="hidden lg:block absolute top-0 right-0 w-[1100px] pointer-events-none select-none"
                style={{
                    filter: 'brightness(0.4) sepia(1) saturate(3) hue-rotate(220deg) brightness(1.2)',
                    maskImage: 'linear-gradient(to bottom left, transparent 5%, black 35%)',
                    WebkitMaskImage: 'linear-gradient(to bottom left, transparent 5%, black 35%)',
                    zIndex: 3,
                }}
            />

            <div className="relative" style={{ zIndex: 2 }}>
                <LandingNav />
                <LandingHero />
                <LandingStats />
                <LandingFeatures />
                <LandingRoles />

                <div ref={ekgWrapRef} className="relative">
                    <canvas ref={eCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
                    <div className="relative" style={{ zIndex: 1 }}>
                        <LandingCTA />
                    </div>
                </div>

                <LandingFooter />
            </div>
        </div>
    );
}