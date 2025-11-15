import React from 'react';

// Renders a smooth SVG path based on percentage points
const PathGraphic = ({ points, stroke = 'url(#pm-gradient)', strokeWidth = 10 }) => {
  // Convert points to cubic bezier path
  const d = points.reduce((acc, p, i, arr) => {
    const x = p.x + '%';
    const y = p.y + '%';
    if (i === 0) return `M ${x} ${y}`;
    // Control points for smooth curve (simple heuristic)
    const prev = arr[i - 1];
    const cx1 = prev.x + (p.x - prev.x) * 0.4;
    const cy1 = prev.y;
    const cx2 = prev.x + (p.x - prev.x) * 0.6;
    const cy2 = p.y;
    return acc + ` C ${cx1}% ${cy1}%, ${cx2}% ${cy2}%, ${x} ${y}`;
  }, '');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="pm-gradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        <filter id="pm-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" filter="url(#pm-glow)" />
    </svg>
  );
};

export default PathGraphic;
