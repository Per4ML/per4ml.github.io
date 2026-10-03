import { useEffect, useRef, useState } from 'react';
// ─── Edit press coverage in: contents/press.json (newest first) ──────────────
import pressData from '../../contents/press.json';

interface PressEntry {
  date: string;      // YYYY-MM
  title: string;
  outlet: string;
  link: string;
  also?: { label: string; link: string }[];
}

const press = pressData as PressEntry[];
const INITIAL_COUNT = 6;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(date: string) {
  const [year, month] = date.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export default function Press() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0, rootMargin: '0px 0px -80px 0px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const items = expanded ? press : press.slice(0, INITIAL_COUNT);

  return (
    <section
      id="press"
      ref={sectionRef}
      style={{
        background: 'var(--color-surface)',
        padding: '0 1.5rem 6rem 1.5rem',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div className="content-col">
        <h2 style={{ textAlign: 'center', margin: '0 0 3rem 0', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)' }}>
          In the News
        </h2>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: '1px solid var(--color-border)' }}>
          {items.map(item => (
            <li
              key={item.link}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                columnGap: '1.5rem',
                rowGap: '0.25rem',
                padding: '1rem 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <time dateTime={item.date} style={{ flex: '0 0 5.5rem', fontSize: '0.8rem', color: 'var(--color-muted)', fontFamily: 'JetBrains Mono, monospace', paddingTop: '0.15rem' }}>
                {formatDate(item.date)}
              </time>

              <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', textDecoration: 'none', lineHeight: 1.5 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text)'; }}
                >
                  {item.title} ↗
                </a>
                <div style={{ marginTop: '0.2rem', fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                  {item.outlet}
                  {item.also?.map(a => (
                    <span key={a.link}>
                      {' · '}
                      <a href={a.link} target="_blank" rel="noopener noreferrer"
                         style={{ color: 'var(--color-accent)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                        {a.label}
                      </a>
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {press.length > INITIAL_COUNT && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                fontSize: '0.85rem',
                fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--color-accent)',
                background: 'transparent',
                border: '1.5px solid var(--color-accent)',
                borderRadius: '9999px',
                padding: '0.4rem 1.1rem',
                cursor: 'pointer',
              }}
            >
              {expanded ? 'Show fewer' : `Show all ${press.length}`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
