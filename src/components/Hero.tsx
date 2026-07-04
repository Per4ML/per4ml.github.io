import { useEffect, useRef } from 'react';

const PARTICLE_DARK  = '245,158,11';
const PARTICLE_LIGHT = '217,119,6';

interface HeroProps { theme: 'dark' | 'light' }

export default function Hero({ theme }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rgb = theme === 'light' ? PARTICLE_LIGHT : PARTICLE_DARK;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; alpha: number };
    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.45 + 0.1,
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${p.alpha})`;
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${rgb},${0.07 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [theme]);

  const isDark = theme === 'dark';
  const accentHoverBg = isDark ? 'rgba(245,158,11,0.12)' : 'rgba(217,119,6,0.10)';

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: 'clamp(300px, 52vh, 460px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, var(--color-surface) 0%, var(--color-bg) 100%)',
        overflow: 'hidden',
        transition: 'background 0.4s ease',
        paddingTop: 72, // clear the fixed nav
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: isDark ? 0.9 : 0.6 }}
        aria-hidden="true"
      />

      {/* Vignette overlay for depth */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: isDark
          ? 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(11,15,30,0.55) 100%)'
          : 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(250,247,240,0.45) 100%)',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2rem 1.5rem 3rem', maxWidth: 860, width: '100%' }}>
        <span style={{
          display: 'inline-block',
          marginBottom: '0.75rem',
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          Texas State University · Computer Science
        </span>

        <h1 style={{
          fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
          fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
          fontWeight: 800,
          color: 'var(--color-text)',
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          margin: '0 0 0.6rem 0',
        }}>
          Per4ML
        </h1>

        <p style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.2rem)',
          color: 'var(--color-muted)',
          fontWeight: 400,
          margin: '0 auto 0.5rem auto',
          lineHeight: 1.5,
          maxWidth: 540,
        }}>
          Data-Efficient ML for High-Performance Computing
        </p>

        <p style={{
          fontSize: '0.82rem',
          color: 'var(--color-muted)',
          fontFamily: 'JetBrains Mono, monospace',
          margin: '0 auto 2rem auto',
          opacity: 0.7,
          letterSpacing: '0.04em',
        }}>
          Few-shot learning · Transfer learning · Multimodal HPC analytics
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="#research"
            style={{
              padding: '0.6rem 1.6rem',
              borderRadius: '0.4rem',
              fontWeight: 600,
              fontSize: '0.88rem',
              background: 'var(--color-accent)',
              color: '#fff',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '1'; }}
          >
            Our Research ↓
          </a>
          <a
            href="#contact"
            style={{
              padding: '0.6rem 1.6rem',
              borderRadius: '0.4rem',
              fontWeight: 600,
              fontSize: '0.88rem',
              border: '1.5px solid var(--color-accent)',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              transition: 'background 0.2s',
              background: 'transparent',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = accentHoverBg; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}
          >
            Join the Lab
          </a>
        </div>
      </div>
    </section>
  );
}
