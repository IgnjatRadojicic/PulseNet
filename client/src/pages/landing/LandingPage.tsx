import { useRef } from 'react';
import LandingNav from '../../components/landing/LandingNav';
import LandingHero from '../../components/landing/LandingHero';
import LandingStats from '../../components/landing/LandingStats';
import LandingFeatures from '../../components/landing/LandingFeatures';
import LandingRoles from '../../components/landing/LandingRoles';
import LandingCTA from '../../components/landing/LandingCta';
import LandingFooter from '../../components/landing/LandingFooter';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { useAnimatedBackground } from '../../hooks/other/useAnimatedBackground';
import handImg from '../../assets/pointing-hand.png';

export default function LandingPage() {
    const landingRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { pCanvasRef, ekgWrapRef, eCanvasRef } = useAnimatedBackground('fullpage');

    return (
        <div
            ref={landingRef}
            className="relative overflow-hidden min-h-screen bg-surface-base text-muted font-dm"
        >
            <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400&display=swap" rel="stylesheet" />

            <canvas
                ref={pCanvasRef}
                className="fixed top-0 left-0 w-full pointer-events-none"
                style={{ zIndex: 0, height: '100vh' }}
            />

            <img
                src={handImg}
                alt=""
                className="hidden [@media(min-width:1800px)]:block absolute top-0 right-0 w-[1100px] pointer-events-none select-none"
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
                {!user && (
                    <>
                        
                        <LandingStats />
                        <LandingFeatures />
                        <LandingRoles />
                    </>
                )}


                <div ref={ekgWrapRef} className="relative" >
                    <canvas 
                        
                        ref={eCanvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none "
                        style={{ zIndex: 0 }}
                    />
                    <div className="relative" style={{ zIndex: 1 }}>
                        <LandingCTA />
                    </div>
                </div>

                <LandingFooter />
            </div>
        </div>
    );
}