import { useEffect, useRef, useState } from 'react';
import { CommentSection } from '../../components/comments/CommentSection';
import { useEKG } from '../../hooks/other/useEKG';
import { useParticles } from '../../hooks/other/useParticles';

export default function CommentsPage() {
  const testPostId = 1;

  const landingRef = useRef<HTMLDivElement>(null);
  const ekgWrapRef = useRef<HTMLDivElement>(null);

  const pCanvasRef = useRef<HTMLCanvasElement>(null);
  const eCanvasRef = useRef<HTMLCanvasElement>(null);

  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  const [ekgDims, setEkgDims] = useState({ W: 0, H: 0 });
  const [particleDims, setParticleDims] = useState({ W: 0, H: 0 });

  const { draw: drawEKG } = useEKG(eCanvasRef, ekgDims.W, ekgDims.H);
  const { draw: drawParticles } = useParticles(
    pCanvasRef,
    mouseRef,
    particleDims.W,
    particleDims.H
  );

  // Resize + observers
  useEffect(() => {
    const landing = landingRef.current;
    const ekgWrap = ekgWrapRef.current;
    if (!landing || !ekgWrap) return;

    function resize() {
      if (!landing || !ekgWrap) return;
      const W = landing.offsetWidth;
      const ekgH = ekgWrap.offsetHeight;

      // EKG canvas
      if (eCanvasRef.current) {
        eCanvasRef.current.width = W;
        eCanvasRef.current.height = ekgH;
      }
      setEkgDims({ W, H: ekgH });

      // Particle canvas
      const vh = window.innerHeight;
      if (pCanvasRef.current) {
        pCanvasRef.current.width = W;
        pCanvasRef.current.height = vh;
      }
      setParticleDims({ W, H: vh });
    }

    resize();
    window.addEventListener('resize', resize);

    const ekgObserver = new ResizeObserver(resize);
    ekgObserver.observe(ekgWrap);

    // Mouse tracking (for particles)
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

  // Animation loop
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
      {/* Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400&display=swap"
        rel="stylesheet"
      />

      {/* PARTICLES BACKGROUND */}
      <canvas
        ref={pCanvasRef}
        className="fixed top-0 left-0 w-full pointer-events-none"
        style={{ zIndex: 0, height: '100vh' }}
      />

      {/* CONTENT + EKG */}
      <div ref={ekgWrapRef} className="relative">
        {/* EKG */}
        <canvas
          ref={eCanvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        />

        {/* MAIN CONTENT */}
        <div className="relative z-10 px-4 md:px-10 py-10 md:py-16 max-w-4xl mx-auto">
          <CommentSection postId={testPostId} />
        </div>
      </div>
    </div>
  );
}