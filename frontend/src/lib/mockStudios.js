import { mockUsers } from './mockCommunityFeed';

export const mockStudios = [
  {
    id: 's1',
    name: '5AM Club',
    description: 'Early risers who build an unstoppable morning routine together.',
    members: ['u1','u3','u7'],
    scoreboard: [ { userId: 'u3', points: 120 }, { userId: 'u1', points: 90 }, { userId: 'u7', points: 80 } ],
    checkins: [],
    energy: 0
  },
  {
    id: 's2',
    name: 'Writers Sprint Room',
    description: 'Timed sprints, accountability and short feedback for writers.',
    members: ['u2','u4'],
    scoreboard: [ { userId: 'u2', points: 70 }, { userId: 'u4', points: 40 } ],
    checkins: [],
    energy: 0
  },
  {
    id: 's3',
    name: 'Fitness & Focus Circle',
    description: 'Hybrid group for quick workouts and focused sessions.',
    members: ['u5','u6'],
    scoreboard: [ { userId: 'u5', points: 110 }, { userId: 'u6', points: 60 } ],
    checkins: [],
    energy: 0
  }
];

export const sampleMicroStories = [
  { id: 'ms1', title: 'Small Win: 10 Minutes', text: 'I did 10 focused minutes writing today and it unlocked momentum.', author: 'Anonymous' },
  { id: 'ms2', title: 'Consistency Beat Perfection', text: 'Skipped a big session but completed small micro-task — progress!', author: 'Anonymous' }
];

export default { mockStudios, sampleMicroStories };
