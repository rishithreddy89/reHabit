// Mock data for frontend demos (communities and analytics)
export const mockCommunities = [
  {
    id: 'c1',
    name: 'Morning Risers',
    type: 'group',
    description: 'Early birds building a morning routine',
    members: ['u1','u2','u3'],
    coords: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: 'c2',
    name: '30-Day Fitness Challenge',
    type: 'challenge',
    description: 'Daily workouts to build consistency',
    members: ['u3','u4'],
    coords: { lat: 37.7849, lng: -122.4094 }
  },
  {
    id: 'c3',
    name: 'Focus & Deep Work',
    type: 'group',
    description: 'Techniques for sustained focus and flow',
    members: ['u1'],
    coords: { lat: 37.7649, lng: -122.4294 }
  },
  {
    id: 'c4',
    name: 'Evening Walkers',
    type: 'group',
    description: 'Casual evening walks and steps',
    members: ['u5','u6'],
    coords: { lat: 37.7685, lng: -122.4250 }
  }
];

// Analytics mock: daily completions for last 30 days (0-5)
export const analyticsMock = {
  heatmap: Array.from({ length: 30 }).map((_, i) => ({
    day: i + 1,
    count: Math.floor(Math.random() * 6)
  })),
  consistency: Array.from({ length: 12 }).map((_, i) => ({
    month: `M${i + 1}`,
    value: Math.round(50 + Math.sin(i / 2) * 20 + Math.random() * 10)
  })),
  radar: {
    Consistency: 75,
    Difficulty: 50,
    'Emotional stability': 65,
    Engagement: 80,
    'Growth curve': 70,
    'Positive vs negative ratio': 65
  },
  positiveNegative: { positive: 72, negative: 28 }
};

export default { mockCommunities, analyticsMock };
