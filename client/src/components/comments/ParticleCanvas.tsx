import { useCallback, useEffect, useRef, useState } from 'react';

const REPEL_RADIUS  = 130;
const MAX_PARTICLES = 160;
const SHAPE_TYPES   = ['circle', 'square', 'triangle', 'line'] as const;
type ShapeType = (typeof SHAPE_TYPES)[number];

interface Shape {
    ox: number; oy: number;
    x: number;  y: number;
    vx: number; vy: number;
    size: number;
    type: ShapeType;
    rotation: number;
    rotSpeed: number;
    baseAlpha: number;
}

function drawShape(ctx: CanvasRenderingContext2D, s: Shape, alpha: number) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.strokeStyle = `rgba(108,99,255,${alpha})`;
    ctx.lineWidth = 1;
    if (s.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, s.size, 0, Math.PI * 2);
        ctx.stroke();
    } else if (s.type === 'square') {
        ctx.strokeRect(-s.size, -s.size, s.size * 2, s.size * 2);
    } else if (s.type === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(0, -s.size);
        ctx.lineTo(s.size, s.size);
        ctx.lineTo(-s.size, s.size);
        ctx.closePath();
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(-s.size, 0);
        ctx.lineTo(s.size, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -s.size);
        ctx.lineTo(0, s.size);
        ctx.stroke();
    }
    ctx.restore();
}

function useParticles(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    mouseRef: React.RefObject<{ x: number; y: number } | null>,
    W: number,
    H: number
) {
    "use no memo";
    const shapesRef = useRef<Shape[]>([]);

    useEffect(() => {
        if (!W || !H) return;
        const count = Math.min(Math.floor((W * H) / 18000), MAX_PARTICLES);
        const shapes: Shape[] = [];
        for (let i = 0; i < count; i++) {
            const ox = Math.random() * W;
            const oy = Math.random() * H;
            shapes.push({
                ox, oy, x: ox, y: oy, vx: 0, vy: 0,
                size: Math.random() * 8 + 3,
                type: SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)],
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.01,
                baseAlpha: Math.random() * 0.12 + 0.04,
            });
        }
        shapesRef.current = shapes;
    }, [W, H]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H);
        const mouse = mouseRef.current;
        for (const s of shapesRef.current) {
            let dist = Infinity;
            if (mouse) {
                const dx = mouse.x - s.x;
                const dy = mouse.y - s.y;
                dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < REPEL_RADIUS && dist > 0) {
                    //const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
                    //s.vx -= (dx / dist) * force * REPEL_FORCE;
                    //s.vy -= (dy / dist) * force * REPEL_FORCE;
                }
            }
            //s.vx = (s.vx + (s.ox - s.x) * RETURN_SPEED) * FRICTION;
            //s.vy = (s.vy + (s.oy - s.y) * RETURN_SPEED) * FRICTION;
            //s.x += s.vx;
            //s.y += s.vy;
            //s.rotation += s.rotSpeed;
            const dxO = s.x - s.ox;
            const dyO = s.y - s.oy;
            const displaced = Math.sqrt(dxO * dxO + dyO * dyO);
            const proximityBoost = mouse ? Math.max(0, 1 - dist / REPEL_RADIUS) : 0;
            const alpha = s.baseAlpha + proximityBoost * 0.5 + Math.min(displaced / 80, 0.3);
            drawShape(ctx, s, alpha);
        }
    }, [canvasRef, mouseRef, W, H]);

    return { draw };
}

// ─────────────────────────────────────────────
// useEKG
// ─────────────────────────────────────────────
const SCROLL_SPEED    = 1.4;
const GLOW_HALF_WIDTH = 140;
const BEATS_PER_WIDTH = 6;

function ekgY(x: number, offset: number, amplitude: number, centerY: number, W: number) {
    const pos  = ((x + offset) % W + W) % W;
    const beat = (pos / W * BEATS_PER_WIDTH) % 1;
    let y = 0;
    if      (beat < 0.04) y = -amplitude * 0.15 * Math.sin(beat / 0.04 * Math.PI);
    else if (beat < 0.08) y =  amplitude * 0.12 * Math.sin((beat - 0.04) / 0.04 * Math.PI);
    else if (beat < 0.11) y = -amplitude * 0.7  * Math.sin((beat - 0.08) / 0.03 * Math.PI);
    else if (beat < 0.16) y =  amplitude * 2.8  * Math.sin((beat - 0.11) / 0.05 * Math.PI);
    else if (beat < 0.21) y = -amplitude * 0.55 * Math.sin((beat - 0.16) / 0.05 * Math.PI);
    else if (beat < 0.27) y = -amplitude * 0.25 * Math.sin((beat - 0.21) / 0.06 * Math.PI);
    else if (beat < 0.34) y =  amplitude * 0.35 * Math.sin((beat - 0.27) / 0.07 * Math.PI);
    return centerY + y;
}

function useEKG(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    W: number,
    H: number
) {
    const offsetRef = useRef(0);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !W || !H) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H);
        const cy  = H * 0.76;
        const amp = 28;
        const lineOffset = offsetRef.current * 0.7;

        // Base trace
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
            const y = ekgY(x, lineOffset, amp, cy, W);
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(108,99,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glow pass
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
            const y = ekgY(x, lineOffset, amp, cy, W);
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(108,99,255,0.12)';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Travelling highlight
        const gx     = (lineOffset * 1.3) % W;
        const xStart = Math.max(0, gx - GLOW_HALF_WIDTH);
        const xEnd   = Math.min(W, gx + GLOW_HALF_WIDTH);
        const grad   = ctx.createLinearGradient(gx - GLOW_HALF_WIDTH, 0, gx + GLOW_HALF_WIDTH, 0);
        grad.addColorStop(0,    'rgba(108,99,255,0)');
        grad.addColorStop(0.45, 'rgba(160,154,255,0.25)');
        grad.addColorStop(0.5,  'rgba(200,196,255,0.7)');
        grad.addColorStop(0.55, 'rgba(160,154,255,0.25)');
        grad.addColorStop(1,    'rgba(108,99,255,0)');
        ctx.beginPath();
        for (let x = xStart; x <= xEnd; x += 2) {
            const y = ekgY(x, lineOffset, amp, cy, W);
            if (x === xStart) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.stroke();

        offsetRef.current += SCROLL_SPEED;
    }, [canvasRef, W, H]);

    return { draw };
}

// ─────────────────────────────────────────────
// ParticleCanvas — two layered canvases
// ─────────────────────────────────────────────
export function ParticleCanvas() {
    const containerRef      = useRef<HTMLDivElement>(null);
    const particleCanvasRef = useRef<HTMLCanvasElement>(null);
    const ekgCanvasRef      = useRef<HTMLCanvasElement>(null);
    const mouseRef          = useRef<{ x: number; y: number } | null>(null);
    const rafRef            = useRef<number>(0);
    const [dims, setDims]   = useState({ W: 0, H: 0 });

    // Observe container size
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const ro = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setDims({ W: Math.floor(width), H: Math.floor(height) });
        });
        ro.observe(container);
        return () => ro.disconnect();
    }, []);

    // Sync canvas pixel dimensions
    useEffect(() => {
        const { W, H } = dims;
        if (!W || !H) return;
        if (particleCanvasRef.current) {
            particleCanvasRef.current.width  = W;
            particleCanvasRef.current.height = H;
        }
        if (ekgCanvasRef.current) {
            ekgCanvasRef.current.width  = W;
            ekgCanvasRef.current.height = H;
        }
    }, [dims]);

    // Mouse tracking relative to container
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const onMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        const onLeave = () => { mouseRef.current = null; };
        container.addEventListener('mousemove', onMove);
        container.addEventListener('mouseleave', onLeave);
        return () => {
            container.removeEventListener('mousemove', onMove);
            container.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    const { draw: drawParticles } = useParticles(particleCanvasRef, mouseRef, dims.W, dims.H);
    const { draw: drawEKG }       = useEKG(ekgCanvasRef, dims.W, dims.H);

    // Animation loop
    useEffect(() => {
        if (!dims.W || !dims.H) return;
        const loop = () => {
            drawParticles();
            drawEKG();
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, [dims, drawParticles, drawEKG]);

    const canvasStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
    };

    return (
        <div
            ref={containerRef}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
            {/* Shapes layer — repels on mouse proximity */}
            <canvas ref={particleCanvasRef} style={{ ...canvasStyle, opacity: 0.9 }} />
            {/* EKG layer — scrolling heartbeat trace */}
            <canvas ref={ekgCanvasRef} style={{ ...canvasStyle, opacity: 0.7 }} />
        </div>
    );
}
