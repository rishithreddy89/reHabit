import React, { useState, useEffect, useRef, useCallback } from 'react';

const ProgressMapContainer = ({ onClose, currentUserData }) => {
  // Define levels with percentages along the path - expanded to 15 levels
  const levels = [
    { id: 1, percent: 0.03, label: 'Level 1' },
    { id: 2, percent: 0.10, label: 'Level 2' },
    { id: 3, percent: 0.17, label: 'Level 3' },
    { id: 4, percent: 0.24, label: 'Level 4' },
    { id: 5, percent: 0.31, label: 'Level 5' },
    { id: 6, percent: 0.38, label: 'Level 6' },
    { id: 7, percent: 0.45, label: 'Level 7' },
    { id: 8, percent: 0.52, label: 'Level 8' },
    { id: 9, percent: 0.59, label: 'Level 9' },
    { id: 10, percent: 0.66, label: 'Level 10' },
    { id: 11, percent: 0.73, label: 'Level 11' },
    { id: 12, percent: 0.80, label: 'Level 12' },
    { id: 13, percent: 0.87, label: 'Level 13' },
    { id: 14, percent: 0.94, label: 'Level 14' },
    { id: 15, percent: 0.99, label: 'Level 15' }
  ];

  // Get user's actual level from props or default to 1
  const userActualLevel = currentUserData?.stats?.level || 1;

  // Sample users at different levels (for demo - can be replaced with real data later)
  const allUsers = [
    { name: 'You', level: userActualLevel, avatar: '👤', isCurrent: true, color: '#00d2ff' },
    { name: 'Alice', level: Math.min(userActualLevel + 2, 15), avatar: '👩', isCurrent: false, color: '#ff6b9d' },
    { name: 'Bob', level: Math.max(userActualLevel - 1, 1), avatar: '👨', isCurrent: false, color: '#ffa500' },
    { name: 'Chris', level: Math.min(userActualLevel + 3, 15), avatar: '🧑', isCurrent: false, color: '#9d4edd' },
    { name: 'Dana', level: Math.min(userActualLevel + 1, 15), avatar: '👧', isCurrent: false, color: '#06ffa5' }
  ];

  const currentUser = allUsers.find(u => u.isCurrent);
  const [userLevel, setUserLevel] = useState(currentUser.level);
  const [positions, setPositions] = useState({});
  const pathRef = useRef(null);
  const completedPathRef = useRef(null);
  const canvasRef = useRef(null);

  // Get position along path based on percentage
  const getPosition = useCallback((percent) => {
    if (!pathRef.current) return { x: 0, y: 0 };
    const path = pathRef.current;
    const length = path.getTotalLength();
    const point = path.getPointAtLength(length * percent);
    
    // Transform SVG coordinates to screen coordinates
    const svg = path.ownerSVGElement;
    const pt = svg.createSVGPoint();
    pt.x = point.x;
    pt.y = point.y;
    const screenPt = pt.matrixTransform(svg.getScreenCTM());
    
    // Get canvas bounding rect to make position relative to canvas
    if (!canvasRef.current) return { x: point.x, y: point.y };
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    return {
      x: screenPt.x - canvasRect.left + canvasRef.current.scrollLeft,
      y: screenPt.y - canvasRect.top + canvasRef.current.scrollTop
    };
  }, []);

  // Compute all level positions
  const computePositions = useCallback(() => {
    if (!pathRef.current || !canvasRef.current) return;
    
    const newPositions = {};
    levels.forEach(level => {
      newPositions[level.id] = getPosition(level.percent);
    });
    
    setPositions(newPositions);
  }, [levels, getPosition]);

  useEffect(() => {
    computePositions();
  }, [computePositions]);

  useEffect(() => {
    const handleResize = () => computePositions();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [computePositions]);

  // Update completed path based on current user level
  useEffect(() => {
    if (!pathRef.current || !completedPathRef.current) return;
    
    const currentLevel = levels.find(l => l.id === userLevel);
    if (!currentLevel) return;
    
    const path = pathRef.current;
    const totalLength = path.getTotalLength();
    const completedLength = totalLength * currentLevel.percent;
    
    // Update stroke-dasharray to show completed portion
    completedPathRef.current.style.strokeDasharray = `${completedLength} ${totalLength}`;
  }, [userLevel, levels]);

  // Center scroll on current user
  const centerOnUser = useCallback(() => {
    if (!canvasRef.current || !positions[userLevel]) return;
    
    const pos = positions[userLevel];
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const target = pos.y - canvasRect.height / 2;
    
    canvasRef.current.scrollTo({ 
      top: Math.max(0, target), 
      behavior: 'smooth' 
    });
  }, [userLevel, positions]);

  useEffect(() => {
    centerOnUser();
  }, [userLevel, centerOnUser]);

  const levelUp = () => {
    const maxLevel = levels[levels.length - 1].id;
    if (userLevel < maxLevel) {
      setUserLevel(userLevel + 1);
    }
  };

  const reset = () => setUserLevel(1);

  // Styles
  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    fontFamily: 'Inter, system-ui, sans-serif',
    background: 'linear-gradient(135deg, #d4f1f9, #b3e5fc)',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    overflow: 'hidden'
  };

  const phoneStyle = {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    background: 'linear-gradient(180deg, #d4f1f9, #e0f7fa)',
    padding: 0,
    position: 'relative',
    overflow: 'hidden'
  };

  const headerStyle = {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.5)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
  };

  const btnBase = {
    padding: '8px 14px',
    borderRadius: 999,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontSize: 14
  };

  const btnLevelUp = {
    ...btnBase,
    background: '#00d2ff',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0, 210, 255, 0.25)'
  };

  const btnClose = {
    ...btnBase,
    background: 'rgba(255, 255, 255, 0.8)',
    color: '#222',
    border: '1px solid rgba(0, 0, 0, 0.1)'
  };

  const canvasStyle = {
    position: 'relative',
    width: '100%',
    height: 'calc(100% - 60px)',
    borderRadius: 0,
    background: 'transparent',
    padding: 20,
    overflow: 'auto'
  };

  const levelInfoStyle = {
    position: 'absolute',
    left: 16,
    bottom: 16,
    color: '#555',
    fontSize: 13,
    background: 'rgba(255, 255, 255, 0.8)',
    padding: '8px 12px',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={containerStyle}>
      <div style={phoneStyle}>
        <div style={headerStyle}>
          <button style={btnClose} onClick={() => { reset(); onClose && onClose(); }}>
            Close
          </button>
          <div style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: '#00d2ff' }}>
            Your Level: {userActualLevel} / 15
          </div>
        </div>

        <div style={canvasStyle} ref={canvasRef}>
          <svg 
            viewBox="0 0 1200 2400" 
            preserveAspectRatio="xMidYMin meet"
            style={{ 
              width: '100%', 
              height: 'auto', 
              minHeight: '2000px',
              position: 'relative'
            }}
          >
            <defs>
              <linearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#BBDFFF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#e3f2fd" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00d2ff" stopOpacity="1" />
                <stop offset="100%" stopColor="#4fc3f7" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Base path (pending/future) */}
            <path
              ref={pathRef}
              id="progressPath"
              d="M100,200 C300,100 500,400 700,300 C900,200 1100,500 1200,400 L1200,600 C1100,700 900,1000 700,900 C500,800 300,1100 100,1000 L100,1200 C200,1300 400,1600 600,1500 C800,1400 1000,1700 1100,1600 L1100,1800 C1000,1900 800,2200 600,2100 C400,2000 200,2300 100,2200"
              stroke="url(#pathGradient)"
              strokeWidth="50"
              fill="none"
              strokeLinecap="round"
            />

            {/* Completed path overlay */}
            <path
              ref={completedPathRef}
              d="M100,200 C300,100 500,400 700,300 C900,200 1100,500 1200,400 L1200,600 C1100,700 900,1000 700,900 C500,800 300,1100 100,1000 L100,1200 C200,1300 400,1600 600,1500 C800,1400 1000,1700 1100,1600 L1100,1800 C1000,1900 800,2200 600,2100 C400,2000 200,2300 100,2200"
              stroke="url(#completedGradient)"
              strokeWidth="50"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="0 1000"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />

            {/* Render all users at their levels */}
            {allUsers.map((user) => {
              const level = levels.find(l => l.id === user.level);
              if (!level || !pathRef.current) return null;
              
              const path = pathRef.current;
              const length = path.getTotalLength();
              const point = path.getPointAtLength(length * level.percent);

              return (
                <g key={user.name}>
                  {/* User node container */}
                  <foreignObject
                    x={point.x - 35}
                    y={point.y - 35}
                    width="70"
                    height="70"
                  >
                    <div
                      style={{
                        width: '70px',
                        height: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        position: 'relative'
                      }}
                      xmlns="http://www.w3.org/1999/xhtml"
                    >
                      {/* Avatar circle */}
                      <div
                        style={{
                          width: user.isCurrent ? '60px' : '50px',
                          height: user.isCurrent ? '60px' : '50px',
                          borderRadius: '50%',
                          background: user.isCurrent 
                            ? `linear-gradient(135deg, ${user.color}, #4fc3f7)` 
                            : user.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: user.isCurrent ? '28px' : '24px',
                          border: user.isCurrent ? '4px solid #00d2ff' : '3px solid white',
                          boxShadow: user.isCurrent 
                            ? '0 0 20px rgba(0, 210, 255, 0.6), 0 4px 15px rgba(0, 0, 0, 0.2)' 
                            : '0 4px 12px rgba(0, 0, 0, 0.15)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          transform: user.isCurrent ? 'scale(1.1)' : 'scale(1)'
                        }}
                        title={`${user.name} - Level ${user.level}`}
                      >
                        {user.avatar}
                      </div>

                      {/* User name label */}
                      {user.isCurrent && (
                        <div
                          style={{
                            marginTop: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#333',
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {user.name}
                        </div>
                      )}
                    </div>
                  </foreignObject>

                  {/* Level marker below path */}
                  <text
                    x={point.x}
                    y={point.y + 55}
                    textAnchor="middle"
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      fill: user.isCurrent ? '#00d2ff' : '#999',
                      fontFamily: 'Inter, system-ui, sans-serif'
                    }}
                  >
                    {level.label}
                  </text>
                </g>
              );
            })}
          </svg>

          <div style={levelInfoStyle}>
            <div style={{ marginBottom: 4, fontWeight: 600, color: '#00d2ff' }}>
              Your Progress
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {allUsers.length} users on this journey
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressMapContainer;
