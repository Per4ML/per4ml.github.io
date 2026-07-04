import { useEffect, useRef, useState } from 'react';
import newsData from '../../contents/news.json';

interface NewsEntry {
  date: string;
  emoji: string;
  category: string;
  headline: string;
  body: string;
  image?: string;
}

const news = newsData as NewsEntry[];
const ITEMS_PER_PAGE = 10;

const DOT_COLORS: Record<string, string> = {
  'Funding':     '#f5c518',
  'Publication': '#00c9a7',
  'Award':       '#a78bfa',
  'Service':     '#64b5f6',
  'Talk':        '#f472b6',
};

export default function News() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const totalPages = Math.ceil(news.length / ITEMS_PER_PAGE);
  const visibleItems = news.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const handlePrev = () => setPage(p => Math.max(0, p - 1));
  const handleNext = () => setPage(p => Math.min(totalPages - 1, p + 1));

  return (
    <section
      id="news"
      ref={sectionRef}
      style={{
        background: 'var(--color-surface)',
        padding: '6rem 1.5rem',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 3rem 0', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)' }}>
          Recent Updates
        </h2>

        <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute',
            left: '0.6rem',
            top: 0,
            bottom: 0,
            width: 2,
            background: 'var(--color-border)',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {visibleItems.map((item, i) => {
              const dotColor = DOT_COLORS[item.category] || 'var(--color-accent)';
              const globalIndex = page * ITEMS_PER_PAGE + i;
              return (
                <article
                  key={globalIndex}
                  style={{
                    position: 'relative',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem 1.5rem',
                    transition: 'border-color 0.2s',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = dotColor; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
                >
                  {/* Dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-2.15rem',
                    top: '1.35rem',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: dotColor,
                    boxShadow: `0 0 0 3px var(--color-surface)`,
                  }} />

                  {item.image && (
                    <div style={{
                      flexShrink: 0,
                      width: 96,
                      height: 72,
                      overflow: 'hidden',
                      borderRadius: '0.5rem',
                      backgroundColor: 'var(--color-border)'
                    }}>
                      <img
                        src={`/${item.image}`}
                        alt={item.headline}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem' }} role="img" aria-label={item.category}>{item.emoji}</span>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, color: dotColor, border: `1px solid ${dotColor}`, borderRadius: '9999px', padding: '1px 8px' }}>
                          {item.category}
                        </span>
                      </div>
                      <time dateTime={item.date} style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                        {item.date}
                      </time>
                    </div>

                    <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      {item.headline}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                      {item.body}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {news.length > ITEMS_PER_PAGE && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            marginTop: '3rem'
          }}>
            <button
              onClick={handlePrev}
              disabled={page === 0}
              aria-label="Previous page"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1.5px solid var(--color-accent)',
                background: 'transparent',
                color: 'var(--color-accent)',
                cursor: page === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                transition: 'all 0.2s',
                opacity: page === 0 ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                if (page !== 0) (e.currentTarget as HTMLElement).style.background = 'rgba(0,201,167,0.1)';
              }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              ‹
            </button>

            <div style={{
              fontSize: '0.85rem',
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--color-muted)',
              fontWeight: 500
            }}>
              {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, news.length)} of {news.length}
            </div>

            <button
              onClick={handleNext}
              disabled={page === totalPages - 1}
              aria-label="Next page"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1.5px solid var(--color-accent)',
                background: 'transparent',
                color: 'var(--color-accent)',
                cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                transition: 'all 0.2s',
                opacity: page === totalPages - 1 ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                if (page !== totalPages - 1) (e.currentTarget as HTMLElement).style.background = 'rgba(0,201,167,0.1)';
              }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
