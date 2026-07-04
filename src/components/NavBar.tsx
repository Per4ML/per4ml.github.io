import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { href: '#about',        label: 'About' },
  { href: '#research',     label: 'Research' },
  { href: '#news',         label: 'News' },
  { href: '#team',         label: 'Team' },
  { href: '#publications', label: 'Publications' },
  { href: '#projects',     label: 'Projects' },
  { href: '#funding',      label: 'Funding' },
  { href: '#contact',      label: 'Contact' },
];

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

interface NavBarProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export default function NavBar({ theme, toggleTheme }: NavBarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.href.slice(1));
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'background 0.3s, box-shadow 0.3s, backdrop-filter 0.3s',
        background: scrolled ? 'var(--color-nav-bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 1px 0 var(--color-border)' : 'none',
      }}
    >
      <nav
        style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: 64 }}
        aria-label="Main navigation"
      >
        <a
          href="#hero"
          style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-accent)', textDecoration: 'none', letterSpacing: '-0.02em' }}
        >
          Per4ML
        </a>

        <ul style={{ display: 'flex', gap: '0.25rem', listStyle: 'none', margin: 0, padding: 0, overflowX: 'auto' }}>
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <a
                href={link.href}
                style={{
                  display: 'block',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.85rem',
                  fontWeight: active === link.href.slice(1) ? 600 : 400,
                  color: active === link.href.slice(1) ? 'var(--color-accent)' : 'var(--color-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--color-text)'; }}
                onMouseLeave={e => {
                  const el = e.target as HTMLElement;
                  el.style.color = active === link.href.slice(1) ? 'var(--color-accent)' : 'var(--color-muted)';
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              transition: 'border-color 0.2s, color 0.2s, background 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              const btn = e.currentTarget;
              btn.style.borderColor = 'var(--color-accent)';
              btn.style.color = 'var(--color-accent)';
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget;
              btn.style.borderColor = 'var(--color-border)';
              btn.style.color = 'var(--color-muted)';
            }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <a
            href="#contact"
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: theme === 'light' ? '#fff' : 'var(--color-bg)',
              background: 'var(--color-accent)',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '1'; }}
          >
            Join Us
          </a>
        </div>
      </nav>
    </header>
  );
}
