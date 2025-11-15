// React conversion of provided refined path UI (game-style progress map)
import React, { useEffect, useRef, useState, useCallback } from 'react';

const ProgressMapContainer = ({ onClose }) => {
  // Steps data (could be passed via props later)
  const [steps, setSteps] = useState([
    { id: 1, label: '01', initials: 'YA', color: '#10b981' },
    { id: 2, label: '02', initials: 'AL', color: '#06b6d4' },
    { id: 3, label: '03', initials: 'YO', color: '#34d399' },
    { id: 4, label: '04', initials: 'RK', color: '#60a5fa' },
    { id: 5, label: '05', initials: 'SS', color: '#7c3aed' },
    { id: 6, label: '06', initials: 'MJ', color: '#f97316' }
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const canvasRef = useRef(null);
  const phoneRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const [positions, setPositions] = useState([]); // [{x,y}]

  // Compute positions along path
  const computePositions = useCallback(() => {
    if (!pathRef.current || !svgRef.current || !canvasRef.current) return;
    const length = pathRef.current.getTotalLength();
    const paddingStart = 0.06 * length;
    const paddingEnd = 0.06 * length;
    const usable = length - paddingStart - paddingEnd;
    const svg = svgRef.current;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const ctm = svg.getScreenCTM();
    const rawPts = steps.map((s, i) => {
      const tBase = i / (steps.length - 1);
      const offset = Math.sin(i * 1.7) * 0.02;
      const t = Math.max(0, Math.min(1, tBase + offset));
      const ptLen = paddingStart + t * usable;
      const p = pathRef.current.getPointAtLength(ptLen);
      const svgPoint = svg.createSVGPoint();
      svgPoint.x = p.x; svgPoint.y = p.y;
      const transformed = svgPoint.matrixTransform(ctm);
      return { x: transformed.x - canvasRect.left, y: transformed.y - canvasRect.top, idx: i };
    });
    // Resolve overlaps with minimum vertical spacing
    rawPts.sort((a, b) => a.y - b.y);
    const minSpacing = 72;
    for (let i = 1; i < rawPts.length; i++) {
      if (rawPts[i].y - rawPts[i - 1].y < minSpacing) {
        rawPts[i].y = rawPts[i - 1].y + minSpacing;
      }
    }
    // Restore original order
    rawPts.sort((a, b) => a.idx - b.idx);
    setPositions(rawPts.map(p => ({ x: p.x, y: p.y })));
    setPathLength(length);
  }, [steps]);

  useEffect(() => { computePositions(); }, [computePositions]);
  useEffect(() => {
    const handleResize = () => computePositions();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [computePositions]);

  // Center scroll on active card
  const centerOnActive = useCallback((index) => {
    if (!canvasRef.current || positions.length === 0) return;
    const pos = positions[index];
    if (!pos) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const target = pos.y - canvasRect.height / 2;
    canvasRef.current.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, [positions]);

  useEffect(() => { centerOnActive(activeIndex); }, [activeIndex, centerOnActive]);

  const advance = () => {
    const next = Math.min(steps.length - 1, activeIndex + 1);
    if (next !== activeIndex) setActiveIndex(next);
  };
  const reset = () => setActiveIndex(0);

  const containerStyle = {
    position: 'relative', width: '100%', height: '100%', fontFamily: 'Inter, system-ui, sans-serif',
    background: 'linear-gradient(135deg,#d4f1f9,#b3e5fc)', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch', overflow: 'hidden'
  };
  const phoneStyle = {
    width: '100%', height: '100%', borderRadius: 0, background: 'linear-gradient(180deg,#d4f1f9,#e0f7fa)',
    boxShadow: 'none', padding: 0, position: 'relative', overflow: 'hidden',
    border: 'none'
  };
  const headerStyle = { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.5)' };
  const btnBase = { padding: '8px 14px', borderRadius: 999, fontWeight: 600, cursor: 'pointer', border: 'none' };
  const btnAdvance = { ...btnBase, background: '#2dd4bf', color: 'white', boxShadow: '0 6px 14px rgba(45,212,191,0.18)' };
  const btnClose = { ...btnBase, background: 'rgba(255,255,255,0.8)', color: '#222', border: '1px solid rgba(0,0,0,0.03)' };
  const canvasStyle = {
    position: 'relative', width: '100%', height: 'calc(100% - 60px)', borderRadius: 0,
    background: 'transparent', padding: 20, overflow: 'auto'
  };
  const metaStyle = { position: 'absolute', left: 14, bottom: 14, color: '#7b8794', fontSize: 13 };

  const stepBase = {
    width: 68, height: 68, borderRadius: 12, background: 'rgba(255,255,255,0.95)', boxShadow: '0 8px 20px rgba(16,24,40,0.06)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', transform: 'translate(-50%,-50%)',
    transition: 'transform .28s cubic-bezier(.2,.9,.4,1), box-shadow .2s ease, background .2s ease', padding: 8, overflow: 'visible', cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <div style={phoneStyle} ref={phoneRef}>
        <div style={headerStyle}>
          <button style={btnAdvance} onClick={advance}>Advance</button>
          <button style={btnClose} onClick={() => { reset(); onClose && onClose(); }}>Close</button>
        </div>
        <div style={canvasStyle} ref={canvasRef}>
          <svg ref={svgRef} viewBox='0 0 360 640' preserveAspectRatio='xMidYMid meet' style={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0 }}>
            <defs>
              <linearGradient id='g1' x1='0' y1='0' x2='1' y2='1'>
                <stop offset='0%' stopColor='#4fc3f7' stopOpacity='0.85' />
                <stop offset='100%' stopColor='#b3e5fc' stopOpacity='0.85' />
              </linearGradient>
            </defs>
            <path
              ref={pathRef}
              id='track'
              d='M40,80 C120,0 160,160 80,240 C0,320 200,380 280,300 C340,240 320,440 190,520'
              stroke='url(#g1)'
              strokeWidth='20'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
              opacity='1'
            />
          </svg>
          {positions.map((p, i) => {
            const step = steps[i];
            const isActive = i === activeIndex;
            const style = {
              ...stepBase,
              left: p.x,
              top: p.y,
              transform: `translate(-50%,-50%) ${isActive ? 'scale(1.06)' : ''}`,
              boxShadow: isActive ? '0 18px 40px rgba(15,23,42,0.14)' : stepBase.boxShadow,
              width: i > 1 ? 56 : 72,
              height: i > 1 ? 56 : 72,
              borderRadius: i > 1 ? 12 : 14
            };
            return (
              <div
                key={step.id}
                style={style}
                onClick={() => setActiveIndex(i)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                      color: 'white', fontSize: 13, background: step.color
                    }}
                  >{step.initials}</div>
                  <div style={{ fontWeight: 700, color: '#1f2937' }}>{step.label}</div>
                </div>
                <div style={{ position: 'absolute', right: -6, top: -6, width: 28, height: 28, borderRadius: 10, background: 'linear-gradient(180deg,#fff,#f3f7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, boxShadow: '0 4px 12px rgba(2,6,23,0.06)' }}>✓</div>
                {/* Tooltip */}
                {isActive && (
                  <div style={{ position: 'absolute', transform: 'translate(-50%,-120%)', left: '50%', top: 0, padding: '8px 10px', borderRadius: 8, background: 'white', boxShadow: '0 10px 25px rgba(16,24,40,0.08)', fontSize: 13, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                    Step {step.label} — {step.initials}
                  </div>
                )}
              </div>
            );
          })}
          <div style={metaStyle}>Tap cards or Advance to step through.</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressMapContainer;
