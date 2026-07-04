import { useEffect, useRef, useState, useMemo } from 'react';

interface Publication {
  key: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  doi: string;
  pdf: string;
  url: string;
  award: string;
  keywords: string[];
}

export default function Publications() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterKeyword, setFilterKeyword] = useState('');

  useEffect(() => {
    // Check for keyword param from Research word-cloud deep link
    const hash = window.location.hash;
    const kwMatch = hash.match(/[?&]keyword=([^&]*)/);
    if (kwMatch) setFilterKeyword(decodeURIComponent(kwMatch[1]));
  }, []);

  useEffect(() => {
    import('../data/publications.json')
      .then(m => setPubs(m.default as Publication[]))
      .catch(() => setPubs([]));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const years = useMemo(() => {
    const ys = [...new Set(pubs.map(p => p.year))].sort((a: number, b: number) => b - a);
    return ys;
  }, [pubs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return pubs.filter(p => {
      const matchSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        p.authors.join(' ').toLowerCase().includes(q) ||
        p.venue.toLowerCase().includes(q) ||
        String(p.year).includes(q);
      const matchYear = filterYear === 'all' || String(p.year) === filterYear;
      const matchKw = !filterKeyword ||
        p.title.toLowerCase().includes(filterKeyword.toLowerCase()) ||
        p.keywords.some(k => k.toLowerCase().includes(filterKeyword.toLowerCase()));
      return matchSearch && matchYear && matchKw;
    });
  }, [pubs, search, filterYear, filterKeyword]);

  return (
    <section
      id="publications"
      ref={sectionRef}
      style={{
        background: 'var(--color-surface)',
        padding: '6rem 1.5rem',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 2rem 0', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)' }}>
          Publications
        </h2>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Search title, author, venue…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search publications"
            style={inputStyle}
          />
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            aria-label="Filter by year"
            style={{ ...inputStyle, maxWidth: 130, cursor: 'pointer' }}
          >
            <option value="all">All Years</option>
            {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>
          {filterKeyword && (
            <button
              onClick={() => setFilterKeyword('')}
              style={{
                ...inputStyle,
                background: 'rgba(0,201,167,0.1)',
                border: '1px solid var(--color-accent)',
                color: 'var(--color-accent)',
                cursor: 'pointer',
                fontWeight: 500,
                maxWidth: 'none',
              }}
            >
              ✕ Keyword: {filterKeyword}
            </button>
          )}
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
          {filtered.length} of {pubs.length} publications
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(pub => (
            <article
              key={pub.key}
              itemScope
              itemType="https://schema.org/ScholarlyArticle"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  {pub.url || pub.doi ? (
                    <a
                      href={pub.url || `https://doi.org/${pub.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      itemProp="name"
                      style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none', lineHeight: 1.4, display: 'block', marginBottom: '0.4rem' }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--color-accent)'; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--color-text)'; }}
                    >
                      {pub.title}
                    </a>
                  ) : (
                    <p itemProp="name" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.4rem 0', lineHeight: 1.4 }}>
                      {pub.title}
                    </p>
                  )}
                  <p itemProp="author" style={{ margin: '0 0 0.3rem 0', fontSize: '0.82rem', color: 'var(--color-muted)' }}>
                    {pub.authors.join(', ')}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {pub.venue && (
                      <span itemProp="publisher" style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {pub.venue}
                      </span>
                    )}
                    {pub.year > 0 && (
                      <span itemProp="datePublished" style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {pub.year}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end', flexShrink: 0 }}>
                  {pub.award && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: 'var(--color-gold)',
                      border: '1px solid var(--color-gold)',
                      borderRadius: '9999px',
                      padding: '2px 8px',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      ★ {pub.award}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>
              No publications match your filters.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

const inputStyle: import('react').CSSProperties = {
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontSize: '0.875rem',
  outline: 'none',
  flex: 1,
  minWidth: 0,
  maxWidth: 400,
};
