// ─── Featured video shown right under the hero ───────────────────────────────
// To feature a different video, change VIDEO_ID (the part after "v=" in the
// YouTube link) and the text below.
const VIDEO_ID = 'tFrO_1K9598';

export default function FeaturedVideo() {
  return (
    <section
      id="featured"
      style={{ background: 'var(--color-bg)', padding: '0 1.5rem 4rem' }}
    >
      <div className="content-col" style={{ maxWidth: 860 }}>
        <span style={{
          display: 'inline-block',
          marginBottom: '0.5rem',
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          Featured · SC'26 Best Research Poster Nominee
        </span>
        <h2 style={{
          margin: '0 0 0.5rem 0',
          fontSize: 'clamp(1.4rem, 2.6vw, 1.9rem)',
          fontWeight: 800,
          color: 'var(--color-text)',
          lineHeight: 1.2,
        }}>
          OptimasX in one minute
        </h2>
        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
          An agentic, end-to-end GPU performance optimization workflow that runs inside the code editor.
        </p>
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          background: '#000',
        }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?rel=0`}
            title="OptimasX one-minute demo"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      </div>
    </section>
  );
}
