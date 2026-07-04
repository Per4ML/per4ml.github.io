import { useEffect, useRef, useState, type CSSProperties } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
// ─── Edit project data in: contents/projects.json ───────────────────────────
import projectsRaw from '../../contents/projects.json';

interface KeywordEntry { text: string; value: number }
type CloudWord = cloud.Word & { text: string; value: number; size: number }

interface Project {
  id: string;
  title: string;
  abstract: string;  // 2–4 sentences; carousel shows first 2
  image: string;
  tags: string[];
  url: string;
  featured: boolean;
  active: boolean;
}

const allProjects = projectsRaw as Project[];

// ─────────────────────────────────────────────────────────────────────────────
// Word Cloud
// ─────────────────────────────────────────────────────────────────────────────
function WordCloud({ keywords, onWordClick }: { keywords: KeywordEntry[]; onWordClick: (word: string) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || keywords.length === 0) return;
    const W = containerRef.current.offsetWidth || 700;
    const H = 320;

    const minVal = Math.min(...keywords.map(k => k.value));
    const maxVal = Math.max(...keywords.map(k => k.value));
    const fontScale = d3.scaleLinear().domain([minVal, maxVal]).range([14, 52]);
    const PALETTE = ['#00c9a7', '#f5c518', '#64b5f6', '#a78bfa', '#f472b6', '#34d399'];
    const colorScale = d3.scaleOrdinal(PALETTE);

    const layout = cloud<CloudWord>()
      .size([W, H])
      .words(keywords.map(k => ({ ...k, size: fontScale(k.value) } as CloudWord)))
      .padding(6)
      // Keep multi-word / hyphenated keywords horizontal; only single words may rotate.
      .rotate(d => (/[\s/-]/.test(d.text) ? 0 : (Math.random() > 0.7 ? 90 : 0)))
      .font('Plus Jakarta Sans, Inter, sans-serif')
      .fontSize(d => d.size)
      .on('end', (words: CloudWord[]) => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        svg.attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`);

        const g = svg.append('g').attr('transform', `translate(${W / 2},${H / 2})`);
        g.selectAll('text')
          .data(words).enter().append('text')
          .style('font-size', d => `${d.size}px`)
          .style('font-family', 'Plus Jakarta Sans, Inter, sans-serif')
          .style('font-weight', '700')
          .style('fill', (_, i) => colorScale(String(i)))
          .style('cursor', 'pointer')
          .style('opacity', '0.85')
          .attr('text-anchor', 'middle')
          .attr('transform', d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
          .text(d => d.text)
          .on('click', (_, d) => onWordClick(d.text))
          .on('mouseover', function () { d3.select(this).style('opacity', '1').style('text-decoration', 'underline'); })
          .on('mouseout', function () { d3.select(this).style('opacity', '0.85').style('text-decoration', 'none'); });
      });
    layout.start();
  }, [keywords, onWordClick]);

  if (keywords.length === 0) {
    return <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>Word cloud unavailable.</div>;
  }
  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} aria-label="Research keyword cloud" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual project card
// ─────────────────────────────────────────────────────────────────────────────
const CARD_WIDTH = 320; // px — adjust to taste
const CARD_GAP   = 20;  // px — must match gap in track style

function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  // Show first 2 sentences of the abstract
  const snippet = project.abstract.split(/(?<=\.)\s+/).slice(0, 2).join(' ');

  return (
    <article
      style={{
        flexShrink: 0,
        width: CARD_WIDTH,
        background: 'var(--color-surface)',
        border: `1px solid ${hovered ? 'var(--color-accent)' : 'var(--color-border)'}`,
        borderRadius: '1rem',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? '0 8px 24px rgba(0,201,167,0.12)' : '0 2px 8px rgba(0,0,0,0.2)',
        cursor: project.url ? 'pointer' : 'default',
        userSelect: 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (project.url) window.open(project.url, '_blank', 'noopener,noreferrer'); }}
      aria-label={project.title}
    >
      {/* Image / placeholder */}
      <div style={{
        height: 160,
        background: 'var(--color-border)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <img
          src={`/${project.image}`}
          alt={project.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
          onError={e => {
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            // Show a teal gradient placeholder when image is missing
            (img.parentElement as HTMLElement).style.background =
              'linear-gradient(135deg, #0d1b2a 0%, #0a2a24 100%)';
          }}
        />
        {project.featured && (
          <span style={{
            position: 'absolute', top: 10, right: 10,
            fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
            color: 'var(--color-gold)', border: '1px solid var(--color-gold)',
            borderRadius: '9999px', padding: '2px 8px', background: 'rgba(10,15,30,0.7)',
          }}>
            Featured
          </span>
        )}
      </div>

      {/* Content — every region is fixed-height so all cards match in size */}
      <div style={{ padding: '1.1rem 1.25rem 1.25rem' }}>
        <h3 style={{
          margin: '0 0 0.6rem 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.35,
          height: '2.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {project.title}
        </h3>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem',
          height: '3.6rem', overflow: 'hidden', alignContent: 'flex-start',
        }}>
          {project.tags.map(tag => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>
        <p style={{
          margin: 0, fontSize: '0.83rem', color: 'var(--color-muted)', lineHeight: 1.65,
          height: '8.25rem', display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {snippet}
        </p>
        <div style={{ height: '1.5rem', marginTop: '0.75rem' }}>
          {project.url && (
            <span style={{ display: 'inline-block', fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600 }}>
              Learn More →
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Carousel — RAF infinite marquee + arrow navigation
// ─────────────────────────────────────────────────────────────────────────────
// Each card "unit" = card width + gap; marginRight carries the gap so copy
// boundaries are exact (no CSS gap asymmetry).
const STEP = CARD_WIDTH + CARD_GAP;

const arrowStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 3,
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.10)',
  border: '1px solid rgba(255,255,255,0.22)',
  borderRadius: '50%',
  color: 'rgba(255,255,255,0.90)',
  fontSize: '1.3rem',
  lineHeight: 1,
  cursor: 'pointer',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  transition: 'background 0.2s',
  userSelect: 'none',
};

function ProjectCarousel({ projects }: { projects: Project[] }) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);           // current scroll position in px
  const rafRef    = useRef<number>(0);
  const pausedRef = useRef(false);       // hover pause
  const boostRef  = useRef<'none' | 'fwd' | 'rev'>('none'); // arrow held

  if (projects.length === 0) return null;

  // One "set" width: N cards × (card + gap), using marginRight so math is exact
  const singleSetWidth = projects.length * STEP;

  // 4 copies ensures the container (≈1050px) is always filled even mid-loop
  const repeated = [...projects, ...projects, ...projects, ...projects];

  // Single RAF loop; speed/direction read from refs so changes never restart it.
  useEffect(() => {
    const BASE = 0.8;  // px/frame ≈ 48 px/s
    const BOOST = 6;   // multiplier while an arrow is held
    const tick = () => {
      const boost = boostRef.current;
      const moving = boost !== 'none' || !pausedRef.current;
      if (moving && trackRef.current) {
        const speed = boost === 'none'
          ? BASE
          : BASE * BOOST * (boost === 'rev' ? -1 : 1);
        // Wrap into [0, singleSetWidth) so the loop stays seamless both ways.
        offsetRef.current = ((offsetRef.current + speed) % singleSetWidth + singleSetWidth) % singleSetWidth;
        trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [singleSetWidth]);

  const hold = (dir: 'fwd' | 'rev') => { boostRef.current = dir; };
  const release = () => { boostRef.current = 'none'; };

  return (
    <div
      style={{ position: 'relative', overflow: 'hidden', paddingBlock: '0.75rem' }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* Left arrow — hold to rewind faster */}
      <button
        onMouseDown={() => hold('rev')}
        onMouseUp={release}
        onMouseLeave={release}
        onTouchStart={() => hold('rev')}
        onTouchEnd={release}
        style={{ ...arrowStyle, left: 12 }}
        aria-label="Scroll left faster"
      >‹</button>

      {/* Right arrow — hold to fast-forward */}
      <button
        onMouseDown={() => hold('fwd')}
        onMouseUp={release}
        onMouseLeave={release}
        onTouchStart={() => hold('fwd')}
        onTouchEnd={release}
        style={{ ...arrowStyle, right: 12 }}
        aria-label="Scroll right faster"
      >›</button>

      {/* Left / right gradient fades */}
      <div style={{ position: 'absolute', inset: '0 auto 0 0', width: 72, background: 'linear-gradient(to right, var(--color-surface), transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: '0 0 0 auto', width: 72, background: 'linear-gradient(to left,  var(--color-surface), transparent)', zIndex: 2, pointerEvents: 'none' }} />

      {/* Marquee track — position driven by RAF via direct style mutation */}
      <div
        ref={trackRef}
        style={{ display: 'flex', gap: 0, width: 'max-content', willChange: 'transform' }}
      >
        {repeated.map((project, i) => (
          // marginRight carries the gap so copy boundaries are seamless
          <div key={`${project.id}-${i}`} style={{ flexShrink: 0, marginRight: CARD_GAP }}>
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Research section
// ─────────────────────────────────────────────────────────────────────────────
export default function Research() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [keywords, setKeywords] = useState<KeywordEntry[]>([]);
  const [kwError, setKwError] = useState(false);

  useEffect(() => {
    import('../data/keywords_computed.json')
      .then(m => setKeywords(m.default as KeywordEntry[]))
      .catch(() => setKwError(true));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleWordClick = (word: string) => {
    window.location.href = `#publications?keyword=${encodeURIComponent(word)}`;
  };

  // Featured first, then remaining active projects
  const featured = allProjects.filter(p => p.active && p.featured);
  const others   = allProjects.filter(p => p.active && !p.featured);
  const sorted   = [...featured, ...others];

  return (
    <section
      id="research"
      ref={sectionRef}
      style={{
        background: 'var(--color-bg)',
        padding: '6rem 0',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      {/* Contained header + word cloud */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 0.75rem 0', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)' }}>
          Research Areas
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-muted)', marginBottom: '3rem', fontSize: '1rem', maxWidth: 560, margin: '0 auto 3rem auto' }}>
          Click a keyword to filter publications by research area.
        </p>

        {/* Word Cloud */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '1rem', padding: '2rem', marginBottom: '3rem', border: '1px solid var(--color-border)' }}>
          {kwError ? (
            <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>
              Keyword cloud — run the build step to generate keyword data.
            </div>
          ) : keywords.length > 0 ? (
            <WordCloud keywords={keywords} onWordClick={handleWordClick} />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>Loading keyword cloud…</div>
          )}
        </div>

        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
          Active Projects
          <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-border)', textTransform: 'none', letterSpacing: 0 }}>
            — hover to pause
          </span>
        </h3>

        {/* Carousel aligned with the content column */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '1rem', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          <ProjectCarousel projects={sorted} />
        </div>
      </div>
    </section>
  );
}
