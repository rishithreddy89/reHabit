// Sample JSON data for Progress Map
// Coordinates are in percentage (0-100) relative to the container
export const sampleLevels = [
  { id: 'lvl-1', x: 6,  y: 70, status: 'completed', users: [
    { id: 'u-self', name: 'You', role: 'self', avatarUrl: 'https://ui-avatars.com/api/?name=You&background=14b8a6&color=fff' },
    { id: 'u-f1', name: 'Ava', role: 'friend', avatarUrl: 'https://i.pravatar.cc/64?img=10' },
    { id: 'u-a1', name: 'Traveler42', role: 'anonymous', avatarUrl: null }
  ]},
  { id: 'lvl-2', x: 22, y: 40, status: 'completed', users: [
    { id: 'u-f2', name: 'Liam', role: 'friend', avatarUrl: 'https://i.pravatar.cc/64?img=12' },
    { id: 'u-a2', name: 'Traveler93', role: 'anonymous', avatarUrl: null }
  ]},
  { id: 'lvl-3', x: 38, y: 18, status: 'unlocked', users: [
    { id: 'u-self', name: 'You', role: 'self', avatarUrl: 'https://ui-avatars.com/api/?name=You&background=14b8a6&color=fff' }
  ]},
  { id: 'lvl-4', x: 56, y: 34, status: 'locked', users: [
    { id: 'u-a3', name: 'Traveler11', role: 'anonymous', avatarUrl: null }
  ]},
  { id: 'lvl-5', x: 74, y: 62, status: 'locked', users: [] },
  { id: 'lvl-6', x: 90, y: 30, status: 'locked', users: [] }
];

export const pathPoints = [
  { x: 0, y: 80 },
  { x: 15, y: 45 },
  { x: 30, y: 20 },
  { x: 50, y: 35 },
  { x: 70, y: 65 },
  { x: 100, y: 30 },
];
