import { useEffect, useRef, useState } from 'react';
import piData from '../../contents/pi.json';
// ─── Edit funder list in: contents/funders.json ──────────────────────────────
import fundersRaw from '../../contents/funders.json';

interface Funder { name: string; label: string }

const FUNDERS = fundersRaw as Funder[];

export default function Funding() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="funding"
      ref={sectionRef}
      style={{
        background: 'var(--color-surface)',
        padding: '6rem 1.5rem',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 0.75rem 0', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)' }}>
          Our Funders
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-muted)', marginBottom: '3rem', fontSize: '1rem' }}>
          The lab has secured <strong style={{ color: 'var(--color-gold)' }}>{piData.funding_total}</strong> in research funding from federal agencies and national laboratories.
        </p>

        {/* Funder name list — plain typographic, no boxes */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'center',
          columnGap: '2.5rem',
          rowGap: '1.75rem',
        }}>
          {FUNDERS.map(funder => (
            <div
              key={funder.name}
              title={funder.label}
              style={{ textAlign: 'center', cursor: 'default' }}
            >
              <div style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--color-text)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}>
                {funder.name}
              </div>
              <div style={{
                fontSize: '0.72rem',
                color: 'var(--color-muted)',
                marginTop: '0.3rem',
                letterSpacing: '0.02em',
              }}>
                {funder.label.split(' / ')[0]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
