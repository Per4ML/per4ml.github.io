import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import projectsRaw from '../../contents/projects.json';

interface Project {
  id: string;
  title: string;
  abstract: string;
  image: string;
  tags: string[];
  url: string;
  featured: boolean;
  active: boolean;
}

const allProjects = projectsRaw as Project[];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const featured = allProjects.filter(p => p.active && p.featured);
  const others = allProjects.filter(p => p.active && !p.featured);
  const projects = [...featured, ...others];

  return (
    <section
      id="projects"
      ref={sectionRef}
      style={{
        background: 'var(--color-bg)',
        padding: '6rem 1.5rem',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-accent)', fontFamily: 'JetBrains Mono, monospace' }}>
            Active Projects
          </span>
        </div>
        <h2 style={{ textAlign: 'center', margin: '0 0 3rem 0', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)' }}>
          Research Projects
        </h2>

        {/* TODO: replace no-op with router navigation to /projects/:id */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {projects.map(project => (
            // key is on Fragment to avoid React 19 JSX types checking key against ProjectCard's own props
            <div key={project.id}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      console.log('Project clicked:', project.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      data-project-id={project.id}
      onClick={() => console.log('Project clicked:', project.id)}
      onKeyDown={handleKey}
      style={{
        display: 'flex',
        flexDirection: 'row',
        background: 'var(--color-surface)',
        border: `1px solid ${hovered ? 'var(--color-accent)' : 'var(--color-border)'}`,
        borderRadius: '1rem',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
        outline: 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {/* Image panel — 40% width */}
      <div
        style={{
          width: '40%',
          flexShrink: 0,
          aspectRatio: '4/3',
          background: 'var(--color-border)',
          overflow: 'hidden',
          maxWidth: 360,
        }}
      >
        <img
          src={`/${project.image}`}
          alt={project.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
          onError={e => {
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            img.parentElement!.style.background = 'linear-gradient(135deg, #111827 0%, #1e293b 100%)';
          }}
        />
      </div>

      {/* Text panel — 60% width */}
      <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-accent)', lineHeight: 1.3 }}>
          {project.title}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
          {project.tags.map(tag => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-muted)', lineHeight: 1.7 }}>
          {project.abstract}
        </p>
      </div>
    </div>
  );
}
