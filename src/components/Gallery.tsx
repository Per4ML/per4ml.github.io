import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
// ─── Add photos in: contents/gallery.json (files live in public/images/gallery) ─
import galleryData from '../../contents/gallery.json';

interface Photo {
  image: string;
  caption: string;   // one short line, e.g. "Zaeed@MUG'26" / "Per4ML@SC'26"
}

const photos = galleryData as Photo[];

// Same card geometry as the project carousel in Research.tsx
const CARD_WIDTH = 320; // px
const CARD_GAP   = 20;  // px — carried by marginRight so copy boundaries are exact
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
  // Theme-aware rather than the project carousel's fixed white-on-dark, so the
  // arrows stay legible on this section's light-mode cream background.
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '50%',
  color: 'var(--color-text)',
  fontSize: '1.3rem',
  lineHeight: 1,
  cursor: 'pointer',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  transition: 'background 0.2s',
  userSelect: 'none',
};

function PhotoCard({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <figure
      style={{
        flexShrink: 0,
        width: CARD_WIDTH,
        margin: 0,
        background: 'var(--color-bg)',
        border: `1px solid ${hovered ? 'var(--color-accent)' : 'var(--color-border)'}`,
        borderRadius: '1rem',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? '0 8px 24px rgba(245,158,11,0.12)' : '0 2px 8px rgba(0,0,0,0.2)',
        cursor: 'zoom-in',
        userSelect: 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
    >
      <div style={{ height: 200, background: 'var(--color-border)', overflow: 'hidden' }}>
        <img
          src={`/${photo.image}`}
          alt={photo.caption}
          loading="lazy"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.4s', transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />
      </div>

      <figcaption style={{
        padding: '0.9rem 1.15rem',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: 'var(--color-text)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {photo.caption}
      </figcaption>
    </figure>
  );
}

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const colRef     = useRef<HTMLDivElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const offsetRef  = useRef(0);                              // scroll position in px
  const rafRef     = useRef<number>(0);
  const pausedRef  = useRef(false);                          // hover pause
  const boostRef   = useRef<'none' | 'fwd' | 'rev'>('none'); // arrow held

  const [visible, setVisible]     = useState(false);
  const [colWidth, setColWidth]   = useState(0);
  const [lightbox, setLightbox]   = useState<Photo | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0, rootMargin: '0px 0px -80px 0px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Measured on the always-full-width column, not the panel — the panel itself
  // shrinks to fit while the gallery is small, which would make this circular.
  useEffect(() => {
    const el = colRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setColWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Only scroll once there are enough photos to fill the row — otherwise the
  // repeated copies would show the same photo several times across the strip.
  const scrolls = colWidth > 0 && photos.length * STEP > colWidth;

  // Single RAF loop; speed/direction read from refs so changes never restart it.
  useEffect(() => {
    if (!scrolls) return;
    const singleSetWidth = photos.length * STEP;
    const BASE = 0.8;  // px/frame ≈ 48 px/s
    const BOOST = 6;   // multiplier while an arrow is held
    const tick = () => {
      const boost = boostRef.current;
      const moving = boost !== 'none' || !pausedRef.current;
      if (moving && trackRef.current) {
        const speed = boost === 'none'
          ? BASE
          : BASE * BOOST * (boost === 'rev' ? -1 : 1);
        offsetRef.current = ((offsetRef.current + speed) % singleSetWidth + singleSetWidth) % singleSetWidth;
        trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scrolls]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  if (photos.length === 0) return null;

  const hold = (dir: 'fwd' | 'rev') => { boostRef.current = dir; };
  const release = () => { boostRef.current = 'none'; };

  // 4 copies ensures the panel is always filled even mid-loop
  const rendered = scrolls ? [...photos, ...photos, ...photos, ...photos] : photos;

  return (
    <section
      id="gallery"
      ref={sectionRef}
      style={{
        background: 'var(--color-surface)',
        padding: '0 1.5rem 6rem 1.5rem',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div className="content-col" ref={colRef}>
        <h2 style={{ textAlign: 'center', margin: '0 0 0.75rem 0', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)' }}>
          Life in the Lab
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace', margin: '0 auto 2.5rem auto' }}>
          {scrolls ? 'hover to pause · click a photo to enlarge' : 'click a photo to enlarge'}
        </p>

        <div
          style={{
            background: 'var(--color-bg)',
            borderRadius: '1rem',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            // Hug the cards until there are enough photos to fill the column
            width: scrolls ? 'auto' : 'fit-content',
            maxWidth: '100%',
            margin: '0 auto',
          }}
        >
          <div
            style={{ position: 'relative', overflow: 'hidden', paddingBlock: '0.75rem' }}
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
          >
            {scrolls && (
              <>
                {/* Hold to rewind / fast-forward */}
                <button
                  onMouseDown={() => hold('rev')}
                  onMouseUp={release}
                  onMouseLeave={release}
                  onTouchStart={() => hold('rev')}
                  onTouchEnd={release}
                  style={{ ...arrowStyle, left: 12 }}
                  aria-label="Scroll left faster"
                >‹</button>
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
                <div style={{ position: 'absolute', inset: '0 auto 0 0', width: 72, background: 'linear-gradient(to right, var(--color-bg), transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: '0 0 0 auto', width: 72, background: 'linear-gradient(to left,  var(--color-bg), transparent)', zIndex: 2, pointerEvents: 'none' }} />
              </>
            )}

            {/* Marquee track — position driven by RAF via direct style mutation */}
            <div
              ref={trackRef}
              style={{
                display: 'flex',
                // Scrolling uses marginRight so the copy boundaries stay exact;
                // a static row uses a plain gap so it has no trailing space.
                gap: scrolls ? 0 : CARD_GAP,
                width: 'max-content',
                margin: scrolls ? undefined : '0 auto',
                paddingInline: scrolls ? 0 : '0.75rem',
                willChange: 'transform',
              }}
            >
              {rendered.map((photo, i) => (
                // marginRight carries the gap so copy boundaries are seamless
                <div key={`${photo.image}-${i}`} style={{ flexShrink: 0, marginRight: scrolls ? CARD_GAP : 0 }}>
                  <PhotoCard photo={photo} onOpen={() => setLightbox(photo)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Portalled to <body>: this section is transformed for its reveal animation,
          and a transformed ancestor becomes the containing block for position:fixed,
          which would trap the overlay inside the section and under the navbar. */}
      {lightbox && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.caption}
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '2rem 1.5rem',
            cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 20,
              right: 24,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: '1.2rem',
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >✕</button>

          <img
            src={`/${lightbox.image}`}
            alt={lightbox.caption}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 'min(1100px, 92vw)', maxHeight: '80vh', objectFit: 'contain', borderRadius: '0.5rem', cursor: 'default' }}
          />

          <h3
            onClick={e => e.stopPropagation()}
            style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff', textAlign: 'center', cursor: 'default' }}
          >
            {lightbox.caption}
          </h3>
        </div>,
        document.body
      )}
    </section>
  );
}
