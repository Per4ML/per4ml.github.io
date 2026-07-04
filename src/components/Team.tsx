import { useEffect, useRef, useState, type CSSProperties } from 'react';
import membersData from '../../contents/members.json';
// ─── Edit these lists directly, or via the content form (npm run admin) ──────
import alumniData from '../../contents/alumni.json';
import collaboratorsData from '../../contents/collaborators.json';

interface Member {
  id: string;
  name: string;
  level: 'PI' | 'Postdoc' | 'PhD' | 'MS' | 'Undergraduate' | 'Alumni';
  image: string;
  url: string;
  interests: string[];
  joined: string;
  active: boolean;
}

interface Alum { id: string; name: string; note: string }
interface Collaborator { id: string; name: string; affiliation: string }

const members = membersData as Member[];
const alumniList = alumniData as Alum[];
const collaborators = collaboratorsData as Collaborator[];

// What "degree" note to show when an inactive member is auto-listed as alumni.
const LEVEL_DEGREE: Record<string, string> = {
  PhD: 'Ph.D.', MS: 'M.Sc.', Undergraduate: 'B.Sc.', Postdoc: 'Postdoc', PI: 'PI',
};

const LEVEL_ORDER = ['PI', 'Postdoc', 'PhD', 'MS', 'Undergraduate', 'Alumni'];
const LEVEL_COLORS: Record<string, string> = {
  PI:           '#f5c518',
  Postdoc:      '#a78bfa',
  PhD:          '#00c9a7',
  MS:           '#64b5f6',
  Undergraduate:'#f472b6',
  Alumni:       '#94a3b8',
};

export default function Team() {
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

  // Flatten and sort members by level
  const activeMembers = members.filter(m => m.active);
  const sortedMembers = [...activeMembers].sort((a, b) => 
    LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
  );

  // Duplicate for seamless loop
  const loopedMembers = [...sortedMembers, ...sortedMembers];

  // Alumni list = curated alumni.json + members marked inactive (auto-moved here).
  const activeNames = new Set(activeMembers.map(m => m.name.toLowerCase()));
  const inactiveAsAlumni: Alum[] = members
    .filter(m => !m.active)
    .map(m => ({ id: m.id, name: m.name, note: LEVEL_DEGREE[m.level] || m.level }));
  const mergedAlumni = [...inactiveAsAlumni, ...alumniList]
    .filter(a => !activeNames.has(a.name.toLowerCase()))
    .filter((a, i, arr) => arr.findIndex(x => x.name.toLowerCase() === a.name.toLowerCase()) === i)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section
      id="team"
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
        <h2 style={{ textAlign: 'center', margin: '0 0 3rem 0', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)' }}>
          Meet the Team
        </h2>

        <MemberCarousel members={loopedMembers} />

        <NameList title="Alumni" items={mergedAlumni.map(a => ({ name: a.name, note: a.note }))} />
        <NameList title="Collaborators" items={collaborators.map(c => ({ name: c.name, note: c.affiliation }))} />
      </div>
    </section>
  );
}

// ─── Simple "Name (note)" list used for Alumni & Collaborators ───────────────
function NameList({ title, items }: { title: string; items: { name: string; note: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginTop: '4rem' }}>
      <h3 style={{
        textAlign: 'center', margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 800,
        color: 'var(--color-text)',
      }}>
        {title}
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '0.6rem 1.5rem',
        width: '100%',
      }}>
        {items.map(item => (
          <div key={item.name} style={{ fontSize: '0.92rem', lineHeight: 1.4, color: 'var(--color-muted)' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{item.name}</span>
            {item.note && <span> ({item.note})</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Auto-scrolling people strip with hold-to-speed-up end arrows ─────────────
// Driven by requestAnimationFrame (not CSS keyframes) so changing speed,
// pausing, or releasing an arrow always continues from the current position.
function MemberCarousel({ members }: { members: Member[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);            // current scroll position, px
  const rafRef = useRef(0);
  const pausedRef = useRef(false);        // true while hovering the strip
  const boostRef = useRef<'none' | 'fwd' | 'rev'>('none'); // arrow held
  const setWidthRef = useRef(0);          // width of one copy of the list

  // Measure one set's width (track holds two identical copies).
  useEffect(() => {
    const measure = () => {
      if (trackRef.current) setWidthRef.current = trackRef.current.scrollWidth / 2;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [members]);

  // Single RAF loop reads the refs each frame, so speed changes need no restart.
  useEffect(() => {
    const BASE = 0.5;   // px/frame ≈ 30 px/s
    const BOOST = 6;    // multiplier while an arrow is held
    const tick = () => {
      const w = setWidthRef.current;
      const boost = boostRef.current;
      const moving = boost !== 'none' || !pausedRef.current;
      if (w > 0 && moving && trackRef.current) {
        const speed = boost === 'none'
          ? BASE
          : BASE * BOOST * (boost === 'rev' ? -1 : 1);
        // Keep the offset wrapped into [0, w) for a seamless loop.
        offsetRef.current = ((offsetRef.current + speed) % w + w) % w;
        trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const arrowStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 4,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '50%',
    color: 'var(--color-text)',
    fontSize: '1.4rem',
    lineHeight: 1,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    userSelect: 'none',
  };

  const hold = (dir: 'fwd' | 'rev') => { boostRef.current = dir; };
  const release = () => { boostRef.current = 'none'; };

  return (
    <div style={{ position: 'relative' }}>
      {/* Left arrow — hold to rewind faster */}
      <button
        aria-label="Scroll left faster"
        style={{ ...arrowStyle, left: 0 }}
        onMouseDown={() => hold('rev')}
        onMouseUp={release}
        onMouseLeave={release}
        onTouchStart={() => hold('rev')}
        onTouchEnd={release}
      >‹</button>

      {/* Right arrow — hold to fast-forward */}
      <button
        aria-label="Scroll right faster"
        style={{ ...arrowStyle, right: 0 }}
        onMouseDown={() => hold('fwd')}
        onMouseUp={release}
        onMouseLeave={release}
        onTouchStart={() => hold('fwd')}
        onTouchEnd={release}
      >›</button>

      <div
        className="people-carousel-shell"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        {/* animation:none overrides the CSS marquee — position is RAF-driven */}
        <div className="people-carousel-track" ref={trackRef} style={{ animation: 'none', willChange: 'transform' }}>
          {members.map((member, index) => (
            <div key={`${member.id}-${index}`} style={{ flexShrink: 0 }}>
              <MemberCard member={member} levelColor={LEVEL_COLORS[member.level]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MemberCard({ member, levelColor }: { member: Member; levelColor: string }) {
  const [hovered, setHovered] = useState(false);
  const Tag = member.url ? 'a' : 'div';
  const linkProps = member.url
    ? { href: member.url, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Tag
      {...linkProps}
      style={{
        flexShrink: 0,
        width: 160,
        background: 'var(--color-surface)',
        border: `1px solid ${hovered ? levelColor : 'var(--color-border)'}`,
        borderRadius: '1rem',
        padding: '1.25rem 1rem',
        textAlign: 'center',
        textDecoration: 'none',
        cursor: member.url ? 'pointer' : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 8px 20px rgba(0,0,0,0.3)` : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        overflow: 'hidden',
        border: `2px solid ${levelColor}`,
        background: 'var(--color-border)',
        flexShrink: 0,
      }}>
        <img
          src={`/${member.image}`}
          alt={member.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => {
            const img = e.target as HTMLImageElement;
            img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=111827&color=${levelColor.replace('#', '')}&size=80`;
          }}
        />
      </div>
      <div style={{ width: '100%' }}>
        {/* Fixed 2-line height so long names never change the card size */}
        <div style={{ height: '2.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{
            margin: 0, fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {member.name}
          </p>
        </div>
        <span style={{
          display: 'inline-block',
          marginTop: '0.35rem',
          fontSize: '0.68rem',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 500,
          color: levelColor,
          border: `1px solid ${levelColor}`,
          borderRadius: '9999px',
          padding: '1px 7px',
        }}>
          {member.level}
        </span>
      </div>
    </Tag>
  );
}
