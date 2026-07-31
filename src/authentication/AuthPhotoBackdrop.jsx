import { useEffect, useRef } from 'react';

// Small floating chat-bubble shapes drifting upward — ties the background to "this is a chat app"
const BUBBLE_COUNT = 6;

function FloatingBubbles() {
  return (
    <>
      {Array.from({ length: BUBBLE_COUNT }).map((_, i) => {
        const size = 24 + (i % 3) * 14;
        const left = `${8 + i * 15 + (i % 2 === 0 ? 3 : -3)}%`;
        const delay = `${i * 1.7}s`;
        const duration = `${14 + (i % 4) * 3}s`;
        return (
          <span
            key={i}
            className="absolute bottom-[-10%] rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm animate-bubble-rise"
            style={{
              width: size,
              height: size,
              left,
              animationDelay: delay,
              animationDuration: duration,
            }}
          />
        );
      })}
    </>
  );
}

function AuthBackdrop() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    let width, height, sparks, frameId;

    const resize = () => {
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };

    const init = () => {
      const count = Math.min(45, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 22000));
      sparks = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: (Math.random() * 1.3 + 0.3) * window.devicePixelRatio,
        vy: (Math.random() * 0.18 + 0.04) * window.devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.1 * window.devicePixelRatio,
        alpha: Math.random() * 0.5 + 0.15,
        twinkleSpeed: Math.random() * 0.02 + 0.006,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, width, height);
      for (const s of sparks) {
        s.y -= s.vy;
        s.x += s.vx;
        if (s.y < -8) { s.y = height + 8; s.x = Math.random() * width; }
        const tw = (Math.sin(t * s.twinkleSpeed + s.phase) + 1) / 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,200,140,${(s.alpha * tw).toFixed(3)})`;
        ctx.fill();
      }
      frameId = requestAnimationFrame(draw);
    };

    resize();
    init();
    if (!prefersReducedMotion) {
      frameId = requestAnimationFrame(draw);
    } else {
      draw(0);
    }

    const onResize = () => { resize(); init(); };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden bg-[#1a1025]">
      {/* aurora mesh base */}
      <div
        className="absolute inset-0 animate-aurora-drift"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 20% 15%, rgba(251,146,60,0.35), transparent 60%),
            radial-gradient(ellipse 70% 60% at 85% 20%, rgba(244,114,182,0.22), transparent 60%),
            radial-gradient(ellipse 80% 70% at 50% 100%, rgba(129,89,217,0.3), transparent 60%),
            radial-gradient(ellipse 60% 50% at 90% 90%, rgba(251,191,36,0.2), transparent 60%)
          `,
        }}
      />

      {/* drifting glow orbs for extra parallax depth */}
      <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl animate-blob-drift" />
      <div
        className="absolute bottom-[-15%] right-[-8%] w-96 h-96 rounded-full bg-pink-400/15 blur-3xl animate-blob-drift"
        style={{ animationDelay: '5s' }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-purple-400/15 blur-3xl animate-blob-drift"
        style={{ animationDelay: '9s' }}
      />

      {/* floating chat bubbles */}
      <FloatingBubbles />

      {/* twinkling spark field */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* fine grain so gradients don't band */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* vignette so the card stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
    </div>
  );
}

export default AuthBackdrop;