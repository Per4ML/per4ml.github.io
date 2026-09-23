import { Fragment, useEffect, useState } from 'react';
import NavBar from './NavBar';
// ─── Card data (title, image, tags) lives in: contents/projects.json ─────────
import projectsRaw from '../../contents/projects.json';
// ─── Section text + paper keys live in: contents/project-details.json ───────
// Each entry's `id` must match a project id; its section anchor is /projects/#<id>.
import detailsRaw from '../../contents/project-details.json';
import publicationsRaw from '../data/publications.json';

type Theme = 'dark' | 'light';

interface Project {
  id: string;
  title: string;
  image: string;
  tags: string[];
  featured: boolean;
  active: boolean;
}

interface ProjectDetail {
  id: string;
  problem: string;
  importance: string;
  challenges: string;
  approach: string;
  impact: string;
  papers: string[];  // BibTeX keys from contents/pubs.bib, one per piece of work
  // Other versions of the same work (journal extension, poster, tech report),
  // shown on one line under the primary entry instead of as separate papers
  versions?: Record<string, string[]>;
}

interface Publication {
  key: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  doi: string;
  url: string;
  pdf: string;
  award: string;
}

const projects = projectsRaw as Project[];
const details = detailsRaw as ProjectDetail[];
const pubsByKey = new Map((publicationsRaw as Publication[]).map(p => [p.key, p]));

// Details in file order; skip entries whose project is missing or inactive
const entries = details
  .map(d => ({ detail: d, project: projects.find(p => p.id === d.id && p.active) }))
  .filter((e): e is { detail: ProjectDetail; project: Project } => Boolean(e.project));

const SUBSECTIONS: { field: keyof Omit<ProjectDetail, 'id' | 'papers' | 'versions'>; label: string }[] = [
  { field: 'problem',    label: 'The problem' },
  { field: 'importance', label: 'Why it matters' },
  { field: 'challenges', label: 'Why it is hard' },
  { field: 'approach',   label: 'What we did' },
  { field: 'impact',     label: 'Impact' },
];

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// "Islam, Tanzima Z" → "T. Z. Islam"
function shortName(author: string) {
  const [last, first = ''] = author.split(',').map(s => s.trim());
  const initials = first.split(/[\s.]+/).filter(Boolean).map(n => `${n[0]}.`).join(' ');
  return initials ? `${initials} ${last}` : last;
}

function pubHref(pub: Publication) {
  return pub.doi ? `https://doi.org/${pub.doi}` : (pub.url || pub.pdf);
}

const linkStyle = { color: 'var(--color-accent)', textDecoration: 'none' } as const;

function PaperItem({ pub, others }: { pub: Publication; others: Publication[] }) {
  const href = pubHref(pub);
  return (
    <li style={{ marginBottom: '0.6rem', lineHeight: 1.55, fontSize: '0.9rem', color: 'var(--color-muted)' }}>
      {href
        ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text)', fontWeight: 600, textDecoration: 'none' }}>{pub.title}</a>
        : <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{pub.title}</span>}
      {'. '}
      {pub.authors.map(shortName).join(', ')}. {pub.venue && <><em>{pub.venue}</em>, </>}{pub.year}.
      {pub.award && <span style={{ marginLeft: '0.5rem', color: 'var(--color-gold)', fontWeight: 600 }}>{pub.award}</span>}
      {pub.pdf && pub.pdf !== href && (
        <> <a href={pub.pdf} target="_blank" rel="noopener noreferrer" style={linkStyle}>[PDF]</a></>
      )}
      {others.length > 0 && (
        <div style={{ fontSize: '0.82rem' }}>
          Also: {others.map((o, i) => {
            const h = pubHref(o);
            const label = o.venue ? `${o.venue}, ${o.year}` : String(o.year);
            return (
              <span key={o.key}>
                {i > 0 && '; '}
                {h ? <a href={h} target="_blank" rel="noopener noreferrer" style={linkStyle}>{label}</a> : label}
                {o.pdf && o.pdf !== h && <> <a href={o.pdf} target="_blank" rel="noopener noreferrer" style={linkStyle}>[PDF]</a></>}
              </span>
            );
          })}
        </div>
      )}
    </li>
  );
}

function ProjectSection({ project, detail }: { project: Project; detail: ProjectDetail }) {
  const pubs = detail.papers
    .map(k => pubsByKey.get(k))
    .filter((p): p is Publication => Boolean(p))
    .sort((a, b) => b.year - a.year);

  return (
    <section
      id={project.id}
      style={{ padding: '3rem 0', borderTop: '1px solid var(--color-border)' }}
    >
      <div className="project-detail__head">
        <img
          src={`/${project.image}`}
          alt=""
          className="project-detail__img"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div>
          <h2 style={{ margin: '0 0 0.75rem 0', fontSize: 'clamp(1.35rem, 2.4vw, 1.75rem)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.25 }}>
            <a href={`#${project.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{project.title}</a>
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {project.tags.map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
          </div>
        </div>
      </div>

      {SUBSECTIONS.map(({ field, label }) => detail[field] && (
        <div key={field} style={{ marginTop: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', fontFamily: 'JetBrains Mono, monospace' }}>
            {label}
          </h3>
          {detail[field].split(/\n\n+/).map((para, i) => (
            <p key={i} style={{ margin: '0 0 0.75rem 0', color: 'var(--color-text)', lineHeight: 1.7, maxWidth: '72ch' }}>{para}</p>
          ))}
        </div>
      ))}

      {pubs.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.6rem 0', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', fontFamily: 'JetBrains Mono, monospace' }}>
            Papers
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {pubs.map(p => (
              <Fragment key={p.key}>
                <PaperItem
                  pub={p}
                  others={(detail.versions?.[p.key] ?? [])
                    .map(k => pubsByKey.get(k))
                    .filter((o): o is Publication => Boolean(o))}
                />
              </Fragment>
            ))}
          </ul>
        </div>
      )}

      <a href="#top" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-muted)', textDecoration: 'none' }}>↑ All projects</a>
    </section>
  );
}

export default function ProjectsPage() {
  const [theme, setTheme] = useState<Theme>(getSystemTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // The browser's native hash-scroll fires before React renders the sections,
  // so scroll to /projects/#<id> once they have mounted — and again after web
  // fonts and images load, since their reflow pushes the section down the page.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const scroll = () => document.getElementById(id)?.scrollIntoView();
    const t = setTimeout(scroll, 100);
    document.fonts?.ready.then(scroll);
    window.addEventListener('load', scroll, { once: true });
    return () => { clearTimeout(t); window.removeEventListener('load', scroll); };
  }, []);

  return (
    <>
      <NavBar theme={theme} toggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))} linkPrefix="/" />

      <main id="top" style={{ background: 'var(--color-bg)', padding: '7rem 1.5rem 4rem' }}>
        <div className="content-col">
          <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-accent)', fontFamily: 'JetBrains Mono, monospace' }}>
            Research Projects
          </span>
          <h1 style={{ margin: '0.5rem 0 1rem 0', fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--color-text)' }}>
            What we work on, and why
          </h1>
          <p style={{ margin: '0 0 2rem 0', color: 'var(--color-muted)', maxWidth: '68ch', lineHeight: 1.7 }}>
            Each project below states the problem, why it matters, why it is hard, what we built, and what changed because of it, with the papers behind it.
          </p>

          {/* Jump index */}
          <nav aria-label="Projects on this page" className="project-index">
            {entries.map(({ project }) => (
              <a key={project.id} href={`#${project.id}`} className="project-index__link">{project.title}</a>
            ))}
          </nav>

          {entries.map(({ project, detail }) => (
            <Fragment key={project.id}><ProjectSection project={project} detail={detail} /></Fragment>
          ))}
        </div>
      </main>

      <footer style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} Per4ML Research Group · Texas State University
        </p>
      </footer>
    </>
  );
}
