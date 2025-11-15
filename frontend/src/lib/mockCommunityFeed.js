// Mock data for community feed, recommendations, leaderboard and users
export const mockUsers = [
  { id: 'u1', name: 'Asha', username: 'asha', avatar: '', level: 5, streak: 12, xp: 420, location: { lat: 37.7749, lng: -122.4194 } },
  { id: 'u2', name: 'David', username: 'david', avatar: '', level: 4, streak: 9, xp: 360, location: { lat: 37.7849, lng: -122.4094 } },
  { id: 'u3', name: 'Maya', username: 'maya', avatar: '', level: 6, streak: 18, xp: 580, location: { lat: 37.7649, lng: -122.4294 } },
  { id: 'u4', name: 'Liam', username: 'liam', avatar: '', level: 3, streak: 4, xp: 210, location: { lat: 37.7549, lng: -122.4394 } },
  { id: 'u5', name: 'Zoe', username: 'zoe', avatar: '', level: 4, streak: 7, xp: 300, location: { lat: 37.7740, lng: -122.4314 } },
  { id: 'u6', name: 'Noah', username: 'noah', avatar: '', level: 2, streak: 3, xp: 120, location: { lat: 37.7680, lng: -122.4150 } },
  { id: 'u7', name: 'Sara', username: 'sara', avatar: '', level: 5, streak: 14, xp: 480, location: { lat: 37.7800, lng: -122.4200 } }
];

export const mockCommunities = [
  { id: 'c1', name: 'Morning Risers', type: 'group', description: 'Early morning routine builders', members: ['u1','u2','u3'], leader: 'u3', coords: { lat: 37.7749, lng: -122.4194 }, category: 'productivity', matchScore: 95 },
  { id: 'c2', name: '30-Day Fitness', type: 'challenge', description: 'Daily bodyweight routines', members: ['u2','u4'], leader: 'u2', coords: { lat: 37.7849, lng: -122.4094 }, category: 'fitness', matchScore: 88 },
  { id: 'c3', name: 'Focus Hour', type: 'group', description: 'Deep work and Pomodoro', members: ['u1','u5'], leader: 'u1', coords: { lat: 37.7649, lng: -122.4294 }, category: 'productivity', matchScore: 92 },
  { id: 'c4', name: 'Evening Walkers', type: 'group', description: 'Casual evening walks and steps', members: ['u5','u6'], leader: 'u5', coords: { lat: 37.7685, lng: -122.4250 }, category: 'fitness', matchScore: 85 },
  { id: 'c5', name: 'Meditation Circle', type: 'group', description: 'Short daily mindfulness practice', members: ['u7','u1'], leader: 'u7', coords: { lat: 37.7790, lng: -122.4180 }, category: 'mindfulness', matchScore: 90 },
  { id: 'c6', name: 'Book Club Daily', type: 'group', description: 'Read 30 minutes every day together', members: ['u2','u3'], leader: 'u2', coords: { lat: 37.7700, lng: -122.4150 }, category: 'learning', matchScore: 87 },
  { id: 'c7', name: 'Hydration Heroes', type: 'challenge', description: 'Track 8 glasses of water daily', members: ['u4','u5','u6'], leader: 'u4', coords: { lat: 37.7800, lng: -122.4100 }, category: 'health', matchScore: 82 },
  { id: 'c8', name: 'Code Daily', type: 'group', description: 'Practice coding challenges daily', members: ['u1','u3','u7'], leader: 'u1', coords: { lat: 37.7650, lng: -122.4300 }, category: 'learning', matchScore: 94 },
  { id: 'c9', name: 'Gratitude Journal', type: 'group', description: 'Share daily gratitude reflections', members: ['u2','u6'], leader: 'u6', coords: { lat: 37.7720, lng: -122.4220 }, category: 'mindfulness', matchScore: 89 },
  { id: 'c10', name: 'Meal Prep Masters', type: 'group', description: 'Weekly meal planning and prep', members: ['u3','u4','u5'], leader: 'u3', coords: { lat: 37.7770, lng: -122.4170 }, category: 'health', matchScore: 80 },
  { id: 'c11', name: 'Sleep Champions', type: 'challenge', description: '8 hours sleep for 30 days', members: ['u1','u7'], leader: 'u7', coords: { lat: 37.7760, lng: -122.4190 }, category: 'health', matchScore: 91 },
  { id: 'c12', name: 'Creative Writing', type: 'group', description: 'Write 500 words daily', members: ['u2','u5'], leader: 'u2', coords: { lat: 37.7730, lng: -122.4210 }, category: 'creativity', matchScore: 86 }
];

export const mockPosts = [
  {
    _id: 'p1',
    userId: mockUsers[2],
    content: "Completed day 18 of the morning routine! Feeling sharper today. 🔥",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    aiSentiment: 'celebrating',
    aiTags: ['morning','energy'],
    aiSuggestedSupport: 'Amazing consistency — keep that energy going! 🎉',
    likeCount: 18,
    commentCount: 4,
    postType: 'progress',
    habitId: { title: 'Morning routine' },
    communityId: 'c1',
    comments: [
      { _id: 'cm1', userId: mockUsers[0], content: 'Love this — keep going!', createdAt: new Date().toISOString() },
      { _id: 'cm2', userId: mockUsers[1], content: 'Inspiring! What time do you start?', createdAt: new Date().toISOString() }
    ]
  },
  {
    _id: 'p2',
    userId: mockUsers[0],
    content: "Missed yesterday but bounced back with a 20 minute walk today. Small wins.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    aiSentiment: 'positive',
    aiTags: ['walking','recovery'],
    likeCount: 8,
    commentCount: 2,
    postType: 'progress',
    habitId: { title: 'Daily walk' },
    communityId: 'c4',
    comments: [
      { _id: 'cm3', userId: mockUsers[4], content: 'Nice recovery, small wins add up!', createdAt: new Date().toISOString() }
    ]
  },
  {
    _id: 'p3',
    userId: mockUsers[1],
    content: "Struggling with motivation today. Any tips to get back on track?",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    aiSentiment: 'struggling',
    aiTags: ['motivation','support'],
    likeCount: 5,
    commentCount: 6,
    postType: 'struggle',
    communityId: 'c1',
    comments: [
      { _id: 'cm4', userId: mockUsers[2], content: 'Try breaking tasks into 5-minute chunks.', createdAt: new Date().toISOString() }
    ]
  },
  {
    _id: 'p4',
    userId: mockUsers[6],
    content: "Joined the 30-day fitness challenge — day 3 done! Anyone wants a workout buddy?",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    aiSentiment: 'positive',
    aiTags: ['fitness','challenge'],
    likeCount: 12,
    commentCount: 3,
    postType: 'achievement',
    communityId: 'c2',
    comments: [
      { _id: 'cm5', userId: mockUsers[1], content: 'I can pair up for evening sessions!', createdAt: new Date().toISOString() }
    ]
  }
];

export const mockRecommendations = {
  communities: [mockCommunities[0], mockCommunities[2], mockCommunities[3]],
  challenges: [mockCommunities[1]],
  leaders: [mockUsers[2], mockUsers[0], mockUsers[1]],
  usersByHabits: [
    { user: mockUsers[0], commonHabits: ['walking', 'mindfulness'] },
    { user: mockUsers[4], commonHabits: ['walking'] },
    { user: mockUsers[6], commonHabits: ['fitness'] }
  ],
  nearbyCommunities: mockCommunities.filter(c=>c.coords).map(c=>({ id: c.id, name: c.name, coords: c.coords }))
};

export default { mockUsers, mockCommunities, mockPosts, mockRecommendations };
