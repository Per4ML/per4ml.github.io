import { useEffect, useState, type ReactNode } from 'react';
import NavBar from './components/NavBar';
import Hero from './components/Hero';
import About from './components/About';
import Research from './components/Research';
import News from './components/News';
import Team from './components/Team';
import Publications from './components/Publications';
import Funding from './components/Funding';
import Contact from './components/Contact';

type Theme = 'dark' | 'light';

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// ─── SVG wave divider between zones ──────────────────────────────────────────
// `flip` reverses the curve direction for visual variety
// `surface` controls whether the wave fills toward --color-surface or --color-bg
function WaveDivider({ surface, flip = false }: { surface: boolean; flip?: boolean }) {
  const fill = surface ? 'var(--color-surface)' : 'var(--color-bg)';
  const bgColor = surface ? 'var(--color-bg)' : 'var(--color-surface)';
  const path = flip
    ? 'M0,0 C360,60 1080,0 1440,50 L1440,0 Z'
    : 'M0,60 C400,0 1040,60 1440,10 L1440,60 Z';

  return (
    <div style={{ background: bgColor, lineHeight: 0, overflow: 'hidden', marginTop: -1 }}>
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: 60 }}
        aria-hidden="true"
      >
        <path style={{ fill }} d={path} />
      </svg>
    </div>
  );
}

// ─── Zone wrapper — gives each section its alternating background ─────────────
function Zone({ surface, children }: { surface: boolean; children: ReactNode }) {
  return (
    <div style={{ background: surface ? 'var(--color-surface)' : 'var(--color-bg)' }}>
      {children}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(getSystemTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <>
      <NavBar theme={theme} toggleTheme={toggleTheme} />

      <main>
        {/* Zone 1 — bg */}
        <Hero theme={theme} />

        {/* bg → surface */}
        <WaveDivider surface={true} />
        <Zone surface={true}><About /></Zone>

        {/* surface → bg */}
        <WaveDivider surface={false} flip />
        <Zone surface={false}><Research /></Zone>

        {/* bg → surface */}
        <WaveDivider surface={true} />
        <Zone surface={true}><News /></Zone>

        {/* surface → bg */}
        <WaveDivider surface={false} flip />
        <Zone surface={false}><Team /></Zone>

        {/* bg → surface */}
        <WaveDivider surface={true} />
        <Zone surface={true}><Publications /></Zone>

        {/* surface → bg */}
        <WaveDivider surface={false} flip />
        <Zone surface={false}><Funding /></Zone>

        {/* bg → surface */}
        <WaveDivider surface={true} />
        <Zone surface={true}><Contact /></Zone>
      </main>

      <footer
        style={{
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--color-muted)',
        }}
      >
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} Per4ML Research Group · Texas State University
        </p>
      </footer>
    </>
  );
}
