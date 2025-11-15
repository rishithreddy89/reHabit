import React from 'react';
import UserAvatarStack from './UserAvatarStack';

const LevelNode = ({
  level,
  size = 52,
  isCurrent = false,
  onClick,
}) => {
  const state = level.status; // 'locked' | 'unlocked' | 'completed'

  const bgByState = {
    locked: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)',
    unlocked: 'linear-gradient(135deg,#99f6e4,#5eead4)',
    completed: 'linear-gradient(135deg,#34d399,#10b981)',
  };
  const ringByState = {
    locked: '0 0 0 2px rgba(148,163,184,0.6)',
    unlocked: '0 0 0 3px rgba(45,212,191,0.55)',
    completed: '0 0 0 3px rgba(16,185,129,0.7)',
  };
  const icon = state === 'completed' ? '✓' : state === 'locked' ? '🔒' : '★';

  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${level.x}%`,
        top: `${level.y}%`,
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        borderRadius: 12,
        background: bgByState[state],
        boxShadow: `0 10px 24px rgba(13,148,136,.18), ${ringByState[state]}`,
        border: '1px solid rgba(15,23,42,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform .25s ease, box-shadow .25s ease',
        outline: isCurrent ? '3px solid rgba(16,185,129,.5)' : 'none',
      }}
    >
      {/* Avatar clip */}
      <div style={{ position: 'absolute', inset: 4, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.35)' }} />
        <div style={{ position: 'absolute', left: 6, bottom: 6 }}>
          <UserAvatarStack users={level.users} highlightSelf />
        </div>
      </div>

      <div style={{ position: 'absolute', top: -12, right: -12, width: 28, height: 28, borderRadius: 999, background: 'white', boxShadow: '0 6px 12px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
        {icon}
      </div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 14, fontWeight: 700, color: state === 'locked' ? '#475569' : '#0f172a' }}>
        {String(level.levelNumber || '').padStart(2, '0')}
      </div>
    </button>
  );
};

export default LevelNode;
