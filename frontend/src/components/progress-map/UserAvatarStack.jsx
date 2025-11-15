import React from 'react';
import { anonymizeUser } from './utils/progressMapUtils';

const avatarSize = 22;

const UserAvatarStack = ({ users = [], seed = 0, highlightSelf = false }) => {
  const processed = users.map((u, i) => anonymizeUser(u, seed + i));
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {processed.slice(0, 4).map((u, i) => (
        <div key={u.id + i} title={u.name}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: '0 2px 6px rgba(13,148,136,0.25)',
            border: u.role === 'self' && highlightSelf ? '2px solid #10b981' : '2px solid white',
            transform: `translateX(${-i * 10}px)`,
            background: '#e2e8f0',
          }}
        >
          <img
            src={u.avatarUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(u.name)}`}
            alt={u.role === 'anonymous' ? 'Anonymous traveler' : u.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ))}
      {processed.length > 4 && (
        <span style={{ fontSize: 10, marginLeft: 4, color: '#334155' }}>+{processed.length - 4}</span>
      )}
    </div>
  );
};

export default UserAvatarStack;
