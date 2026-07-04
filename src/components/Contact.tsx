import { useEffect, useRef, useState } from 'react';
import piData from '../../contents/pi.json';

export default function Contact() {
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
      id="contact"
      ref={sectionRef}
      style={{
        background: 'var(--color-bg)',
        padding: '6rem 1.5rem',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)' }}>
          Interested in Joining the Lab?
        </h2>
        <p style={{ color: 'var(--color-muted)', lineHeight: 1.8, marginBottom: '2rem', fontSize: '1rem' }}>
          The Per4ML lab welcomes motivated PhD applicants, MS students, and undergraduate researchers interested in data-efficient ML for HPC, few-shot learning, and AI for systems.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <a
            href={piData.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
              textDecoration: 'none',
            }}
          >
            Contact via PI's Website
          </a>
        </div>

        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.75rem',
          padding: '1.5rem 2rem',
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
            <strong style={{ color: 'var(--color-text)' }}>Institution:</strong> {piData.institution}
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-muted)' }}>
            <strong style={{ color: 'var(--color-text)' }}>Department:</strong> Computer Science
          </p>
        </div>
      </div>
    </section>
  );
}
