import { useEffect, useRef, useState } from 'react';

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        background: 'var(--color-surface)',
        padding: '6rem 1.5rem',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4rem',
            width: '100%'
          }}
        >
          {/* Content Section */}
          <div style={{ width: '100%' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.2 }}>
              About the Lab
            </h2>

            <p style={{
              color: 'var(--color-muted)',
              lineHeight: 1.8,
              margin: '0 0 2.5rem 0',
              fontSize: '1rem',
              width: '100%',
              textAlign: 'justify'
            }}>
              The Per4ML Laboratory develops cutting-edge AI and machine learning methods for modeling complex relationships among heterogeneous data objects spanning tables, text, graphs, trees, images, and count-based representations. Our research studies how diverse forms of information interact, align, and compose to reveal hidden structure that individual modalities alone cannot capture. We build representation learning and foundation-modeling approaches that transform these complex relationships into more time- and data-efficient predictive and generative systems. These models enable intelligent reasoning across tasks including prediction, generation, adaptation, and counterfactual decision-making while requiring fewer observations and less supervision. Beyond model development, we design end-to-end AI systems that operationalize these capabilities in real-world environments. Our work spans high-performance computing, healthcare, and emerging scientific applications where robust decision-making must occur under heterogeneous, noisy, and evolving conditions. From agentic systems to developing coding and performance-optimization skills, and from foundation models to interactive visualizations, we move fast and wide—building AI methods and systems that turn abstract ideas into usable intelligence.
            </p>
          </div>
          </div>
        </div>
    </section>
  );
}
