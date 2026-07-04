import React, { useEffect, useRef, useState } from 'react';

interface Entity {
  id: string;
  type: 'table' | 'text' | 'graph' | 'tree' | 'image' | 'counter' | 'code' | 'workflow' | 'trace';
  x: number;
  y: number;
  angle: number;
  phase: number;
  size: number;
  speed: number;
}

interface Destination {
  id: string;
  label: string;
  x: number;
  y: number;
}

export default function AbstractionEngine() {
  const svgRef = useRef<SVGSVGElement>(null);
  const requestRef = useRef<number>();
  const [time, setTime] = useState(0);

  useEffect(() => {
    const animate = (t: number) => {
      setTime(t / 1000);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, []);

  const entities: Entity[] = [
    { id: 'table', type: 'table', x: 0, y: 0, angle: 0, phase: 0, size: 12, speed: 0.002 },
    { id: 'text', type: 'text', x: 0, y: 0, angle: 0.7, phase: 1, size: 10, speed: 0.003 },
    { id: 'graph', type: 'graph', x: 0, y: 0, angle: 1.4, phase: 2, size: 14, speed: 0.0025 },
    { id: 'tree', type: 'tree', x: 0, y: 0, angle: 2.1, phase: 3, size: 12, speed: 0.002 },
    { id: 'image', type: 'image', x: 0, y: 0, angle: 2.8, phase: 4, size: 11, speed: 0.0035 },
    { id: 'counter', type: 'counter', x: 0, y: 0, angle: 3.5, phase: 5, size: 10, speed: 0.002 },
    { id: 'code', type: 'code', x: 0, y: 0, angle: 4.2, phase: 6, size: 12, speed: 0.0025 },
    { id: 'workflow', type: 'workflow', x: 0, y: 0, angle: 4.9, phase: 7, size: 14, speed: 0.003 },
    { id: 'trace', type: 'trace', x: 0, y: 0, angle: 5.6, phase: 8, size: 11, speed: 0.0025 },
  ];

  const destinations: Destination[] = [
    { id: 'pred', label: 'Prediction', x: 400, y: 100 },
    { id: 'gen', label: 'Generation', x: 500, y: 150 },
    { id: 'count', label: 'Counterfactual Decisions', x: 480, y: 200 },
    { id: 'opt', label: 'Optimization', x: 420, y: 250 },
    { id: 'trans', label: 'Transfer Learning', x: 350, y: 220 },
    { id: 'agent', label: 'Agentic Systems', x: 320, y: 150 },
  ];

  const renderEntity = (e: Entity, x: number, y: number, opacity: number, scale: number) => {
    const color = 'var(--color-accent)';
    const strokeWidth = 1.5;

    switch (e.type) {
      case 'table':
        return (
          <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
            {[0, 1].map(r => [0, 1].map(c => (
              <rect key={`${r}-${c}`} x={c * 4} y={r * 4} width={3} height={3} fill={color} stroke={color} strokeWidth={0.5} />
            )))}
          </g>
        );
      case 'text':
        return (
          <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
            {[0, 1, 2].map(i => <line key={i} x1={-4} y1={i * 3 - 3} x2={4} y2={i * 3 - 3} stroke={color} strokeWidth={strokeWidth} />)}
          </g>
        );
      case 'graph':
        return (
          <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
            <circle cx={-3} cy={-3} r={1.5} fill={color} />
            <circle cx={3} cy={-3} r={1.5} fill={color} />
            <circle cx={0} cy={3} r={1.5} fill={color} />
            <line x1={-3} y1={-3} x2={3} y2={-3} stroke={color} strokeWidth={strokeWidth} />
            <line x1={-3} y1={-3} x2={0} y2={3} stroke={color} strokeWidth={strokeWidth} />
            <line x1={3} y1={-3} x2={0} y2={3} stroke={color} strokeWidth={strokeWidth} />
          </g>
        );
      case 'tree':
        return (
          <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
            <circle cx={0} cy={-3} r={1.5} fill={color} />
            <circle cx={-3} cy={3} r={1.5} fill={color} />
            <circle cx={3} cy={3} r={1.5} fill={color} />
            <line x1={0} y1={-3} x2={-3} y2={3} stroke={color} strokeWidth={strokeWidth} />
            <line x1={0} y1={-3} x2={3} y2={3} stroke={color} strokeWidth={strokeWidth} />
          </g>
        );
      case 'image':
        return (
          <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
            <rect x={-4} y={-4} width={8} height={8} fill={color} fillOpacity={0.3} stroke={color} strokeWidth={strokeWidth} />
            <rect x={-2} y={-2} width={2} height={2} fill={color} />
            <rect x={2} y={2} width={2} height={2} fill={color} />
          </g>
        );
      case 'counter':
        return (
          <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
            <path d="M-4,0 L-2,-2 L0,2 L2,-1 L4,0" fill="none" stroke={color} strokeWidth={strokeWidth} />
          </g>
        );
      case 'code':
        return (
          <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
            <text x={-3} y={1} fontSize={6} fill={color} fontWeight="bold">{'{ }'}</text>
          </g>
        );
      case 'workflow':
        return (
          <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
            <rect x={-6} y={-2} width={4} height={4} fill="none" stroke={color} strokeWidth={strokeWidth} />
            <line x1={-2} y1={0} x2={0} y2={0} stroke={color} strokeWidth={strokeWidth} />
            <rect x={0} y={-2} width={4} height={4} fill="none" stroke={color} strokeWidth={strokeWidth} />
          </g>
        );
      case 'trace':
        return (
          <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
            <path d="M-4,0 Q-2,-4 0,0 T4,0" fill="none" stroke={color} strokeWidth={strokeWidth} />
          </g>
        );
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        ref={svgRef}
        viewBox="0 0 600 300"
        style={{ width: '100%', height: 'auto', maxWidth: '600px', overflow: 'visible' }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Latent Space Region */}
        <circle cx={200} cy={150} r={40} fill="var(--color-accent)" fillOpacity={0.05} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="4 4" filter="url(#glow)" />
        <text x={200} y={155} textAnchor="middle" fontSize={8} fill="var(--color-accent)" opacity={0.6} fontFamily="JetBrains Mono, monospace">LATENT SPACE</text>

        {/* Destinations */}
        {destinations.map(dest => (
          <g key={dest.id}>
            <circle cx={dest.x} cy={dest.y} r={3} fill="var(--color-accent)" filter="url(#glow)" />
            <text x={dest.x + 8} y={dest.y + 4} fontSize={10} fill="var(--color-text)" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={500}>
              {dest.label}
            </text>
          </g>
        ))}

        {/* Flowing Particles / Transitions */}
        {[...Array(20)].map((_, i) => {
          const t = (time * 0.2 + i * 0.1) % 1;
          const startIdx = i % entities.length;
          const endIdx = (i + 3) % destinations.length;
          const start = entities[startIdx];
          const end = destinations[endIdx];

          const centerX = 200, centerY = 150;
          const startX = 200 + Math.cos(start.angle + time * 0.1) * 120;
          const startY = 150 + Math.sin(start.angle + time * 0.1) * 120;

          let px, py, opacity;
          if (t < 0.5) {
            const progress = t * 2;
            px = startX + (centerX - startX) * progress;
            py = startY + (centerY - startY) * progress;
            opacity = progress;
          } else {
            const progress = (t - 0.5) * 2;
            px = centerX + (end.x - centerX) * progress;
            py = centerY + (end.y - centerY) * progress;
            opacity = 1 - progress;
          }

          return (
            <circle key={i} cx={px} cy={py} r={1.5} fill="var(--color-accent)" opacity={opacity} filter="url(#glow)" />
          );
        })}

        {/* Entities orbiting boundary */}
        {entities.map(e => {
          const x = 200 + Math.cos(e.angle + time * e.speed * 10) * 120;
          const y = 150 + Math.sin(e.angle + time * e.speed * 10) * 120;
          return (
            <g key={e.id}>
              {renderEntity(e, x, y, 0.8, 1)}
              <text x={x} y={y + 20} textAnchor="middle" fontSize={7} fill="var(--color-muted)" fontFamily="JetBrains Mono, monospace" opacity={0.5}>
                {e.type}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
