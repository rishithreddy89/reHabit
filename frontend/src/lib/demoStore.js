import { mockPosts as _mockPosts } from './mockCommunityFeed';
import { mockStudios as _mockStudios, sampleMicroStories as _sampleMicroStories } from './mockStudios';
import { mockCommunities as _mockCommunities } from './mockData';

const JOIN_KEY = 'rehabit_demo_joined';
const POSTS_KEY = 'rehabit_demo_posts';
const STUDIOS_KEY = 'rehabit_demo_studios';
const STORIES_KEY = 'rehabit_demo_stories';
const COMMUNITIES_KEY = 'rehabit_demo_communities';

function readJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    // ignore
  }
}

export function getJoinedCommunities() {
  return new Set(readJSON(JOIN_KEY, []));
}

export function joinCommunity(id) {
  const s = getJoinedCommunities();
  s.add(id);
  writeJSON(JOIN_KEY, Array.from(s));
  dispatchUpdate();
}

export function leaveCommunity(id) {
  const s = getJoinedCommunities();
  s.delete(id);
  writeJSON(JOIN_KEY, Array.from(s));
  dispatchUpdate();
}

export function getPosts() {
  const local = readJSON(POSTS_KEY, []);
  // merge defaults: local posts first, then mock posts that don't duplicate
  const ids = new Set(local.map(p=>p._id));
  const merged = [...local, ..._mockPosts.filter(p=>!ids.has(p._id))];
  return merged;
}

export function getStudios() {
  const local = readJSON(STUDIOS_KEY, []);
  const ids = new Set(local.map(s=>s.id));
  return [...local, ..._mockStudios.filter(s=>!ids.has(s.id))];
}

export function getCommunities() {
  const local = readJSON(COMMUNITIES_KEY, []);
  const ids = new Set(local.map(c=>c.id));
  return [...local, ..._mockCommunities.filter(c=>!ids.has(c.id))];
}

export function addCommunity(community) {
  const list = readJSON(COMMUNITIES_KEY, []);
  const id = community.id || `c-demo-${Date.now()}`;
  const c = { ...community, id, members: community.members || [] };
  list.unshift(c);
  writeJSON(COMMUNITIES_KEY, list);
  dispatchUpdate();
  return c;
}

export function joinStudio(studioId, userId) {
  const studios = readJSON(STUDIOS_KEY, []);
  const idx = studios.findIndex(s=>s.id===studioId);
  if (idx !== -1) {
    const s = studios[idx];
    s.members = Array.isArray(s.members) ? s.members : [];
    if (!s.members.includes(userId)) s.members.push(userId);
  } else {
    const mock = _mockStudios.find(s=>s.id===studioId);
    if (mock) {
      const copy = { ...mock, members: [...(mock.members||[]), userId] };
      studios.unshift(copy);
    }
  }
  writeJSON(STUDIOS_KEY, studios);
  dispatchUpdate();
}

export function leaveStudio(studioId, userId) {
  const studios = readJSON(STUDIOS_KEY, []);
  const idx = studios.findIndex(s=>s.id===studioId);
  if (idx !== -1) {
    const s = studios[idx];
    s.members = (s.members || []).filter(m=>m!==userId);
    writeJSON(STUDIOS_KEY, studios);
    dispatchUpdate();
  }
}

export function checkInStudio(studioId, userId) {
  const studios = readJSON(STUDIOS_KEY, []);
  let target = studios.find(s=>s.id===studioId);
  if (!target) {
    const mock = _mockStudios.find(s=>s.id===studioId);
    target = mock ? { ...mock } : null;
    if (target) studios.unshift(target);
  }
  if (target) {
    target.checkins = target.checkins || [];
    target.checkins.push({ userId, at: new Date().toISOString() });
    // energy = number of checkins in last hour (demo)
    const oneHourAgo = Date.now() - 1000*60*60;
    target.energy = target.checkins.filter(c => new Date(c.at).getTime() >= oneHourAgo).length;
    writeJSON(STUDIOS_KEY, studios);
    dispatchUpdate();
  }
}

export function getMicroStories() {
  const local = readJSON(STORIES_KEY, []);
  if (local && local.length) return local;
  return _sampleMicroStories;
}

export function addMicroStory(story) {
  const stories = readJSON(STORIES_KEY, []);
  const s = { ...story, likes: 0, comments: [] };
  stories.unshift(s);
  writeJSON(STORIES_KEY, stories);
  dispatchUpdate();
}

export function reactToStory(storyId) {
  const stories = readJSON(STORIES_KEY, []);
  const idx = stories.findIndex(s => s.id === storyId);
  if (idx !== -1) {
    stories[idx].likes = (stories[idx].likes || 0) + 1;
  } else {
    const mock = _sampleMicroStories.find(s => s.id === storyId);
    if (mock) {
      const copy = { ...mock, likes: (mock.likes || 0) + 1 };
      stories.unshift(copy);
    }
  }
  writeJSON(STORIES_KEY, stories);
  dispatchUpdate();
}

export function addCommentToStory(storyId, comment) {
  const stories = readJSON(STORIES_KEY, []);
  const idx = stories.findIndex(s => s.id === storyId);
  if (idx !== -1) {
    stories[idx].comments = stories[idx].comments || [];
    stories[idx].comments.push(comment);
  } else {
    const mock = _sampleMicroStories.find(s => s.id === storyId);
    if (mock) {
      const copy = { ...mock, comments: [comment] };
      stories.unshift(copy);
    }
  }
  writeJSON(STORIES_KEY, stories);
  dispatchUpdate();
}

export function addPost(post) {
  const posts = readJSON(POSTS_KEY, []);
  posts.unshift(post);
  writeJSON(POSTS_KEY, posts);
  dispatchUpdate();
}

export function reactToPost(postId) {
  const posts = readJSON(POSTS_KEY, []);
  const idx = posts.findIndex(p=>p._id===postId);
  if (idx !== -1) {
    posts[idx].likeCount = (posts[idx].likeCount||0) + 1;
  } else {
    // if not in local, modify mock posts by saving modified copy to local
    const mock = _mockPosts.find(p=>p._id===postId);
    if (mock) {
      const copy = { ...mock, likeCount: (mock.likeCount||0) + 1 };
      posts.unshift(copy);
    }
  }
  writeJSON(POSTS_KEY, posts);
  dispatchUpdate();
}

export function dispatchUpdate() {
  try { window.dispatchEvent(new Event('rehabit-demo-updated')); } catch(e){}
}

export function subscribe(cb) {
  window.addEventListener('rehabit-demo-updated', cb);
  return () => window.removeEventListener('rehabit-demo-updated', cb);
}

export default {
  getJoinedCommunities,
  joinCommunity,
  leaveCommunity,
  getPosts,
  addPost,
  reactToPost,
  getStudios,
  joinStudio,
  leaveStudio,
  checkInStudio,
  getMicroStories,
  addMicroStory,
  reactToStory,
  addCommentToStory,
  getCommunities,
  addCommunity,
  subscribe
};
