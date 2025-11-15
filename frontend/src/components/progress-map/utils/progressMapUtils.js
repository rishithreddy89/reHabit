export const ANON_NAMES = ['Traveler42','Pathfinder7','Wanderer11','Ranger5','Drifter9','Voyager21'];

export function anonymizeUser(user, seed = 0) {
  if (!user || user.role === 'self' || user.role === 'friend') return user;
  const name = ANON_NAMES[(seed + (user.id?.length || 0)) % ANON_NAMES.length];
  return {
    ...user,
    name,
    avatarUrl: user.avatarUrl || getAnonymousAvatar(name)
  };
}

export function getAnonymousAvatar(label = 'Traveler') {
  const hue = 160 + Math.floor(Math.random() * 60);
  const bg = `hsl(${hue} 60% 45%)`;
  const text = 'ffffff';
  const safeLabel = encodeURIComponent(label);
  return `https://ui-avatars.com/api/?name=${safeLabel}&background=${bg.replace(/[^0-9a-f]/gi,'')}&color=${text}`;
}

export function resolveLevelState(level, currentLevelId) {
  if (level.status === 'completed') return 'completed';
  if (level.id === currentLevelId || level.status === 'unlocked') return 'unlocked';
  return 'locked';
}

export function updateProgress(levels, completedLevelId) {
  // Returns a new array with the specified level completed and next unlocked
  const idx = levels.findIndex(l => l.id === completedLevelId);
  if (idx === -1) return levels;
  const nextIdx = idx + 1;
  return levels.map((l, i) => {
    if (i === idx) return { ...l, status: 'completed' };
    if (i === nextIdx && l.status === 'locked') return { ...l, status: 'unlocked' };
    return l;
  });
}
