import express from 'express';
import * as authModule from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

// Resolve exported auth (could be default, named, or CommonJS-like module)
const resolvedAuthExport = authModule.default ?? authModule.auth ?? authModule;

// helper to get token from multiple places
const getTokenFromReq = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === 'string') {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') return parts[1];
    if (parts.length === 1) return parts[0];
  }
  if (req.body && req.body.token) return req.body.token;
  if (req.query && req.query.token) return req.query.token;
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
    if (match) return decodeURIComponent(match.split('=')[1]);
  }
  return null;
};

// fallback JWT auth middleware (used only if resolved export is not a function)
const fallbackJwtAuth = (req, res, next) => {
  try {
    const token = getTokenFromReq(req);
    console.log('🔐 Worlds Auth Debug - Token found:', token ? 'YES' : 'NO');
    
    if (!token) {
      console.log('❌ Worlds Auth Debug - No token in request');
      return res.status(401).json({ message: 'Unauthorized: missing token' });
    }
    
    // Use the same secret as your main auth middleware
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    let decoded = null;
    
    try {
      decoded = jwt.verify(token, secret);
      console.log('✅ Worlds Auth Debug - Token verified');
    } catch (err) {
      console.log('❌ Worlds Auth Debug - Token verification failed:', err.message);
      return res.status(401).json({ message: 'Unauthorized: invalid token', error: err.message });
    }
    
    // Normalize the user payload
    req.user = {
      userId: decoded.id || decoded.userId || decoded._id,
      id: decoded.id || decoded.userId || decoded._id,
      _id: decoded.id || decoded.userId || decoded._id,
      ...decoded
    };
    
    return next();
  } catch (err) {
    console.error('❌ Worlds Auth Debug - Error:', err.message);
    return res.status(401).json({ message: 'Unauthorized: invalid token', error: err.message });
  }
};

// unified auth middleware: prefer real middleware export, otherwise fallback to JWT
const authMiddleware = (req, res, next) => {
  if (typeof resolvedAuthExport === 'function') {
    return resolvedAuthExport(req, res, next);
  }
  return fallbackJwtAuth(req, res, next);
};

import World from '../models/World.js';
import Level from '../models/Level.js';

const router = express.Router();

const WORLD_DATA = [
  {
    id: 'forest',
    name: 'Focus Forest',
    description: 'Master your concentration',
    icon: '🌲',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    unlockRequirement: 0
  },
  {
    id: 'ocean',
    name: 'Wellness Waves',
    description: 'Flow with healthy habits',
    icon: '🌊',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    unlockRequirement: 15
  },
  {
    id: 'mountain',
    name: 'Productivity Peak',
    description: 'Climb to new heights',
    icon: '⛰️',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    unlockRequirement: 30
  },
  {
    id: 'gym',
    name: 'MindGym',
    description: 'Strengthen your mind',
    icon: '💪',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    unlockRequirement: 40
  },
  {
    id: 'garden',
    name: 'Growth Garden',
    description: 'Nurture your potential',
    icon: '🌺',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    unlockRequirement: 50
  }
];

// Get all worlds for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const uid = req.user?.userId ?? req.user?._id;
    if (!uid) return res.status(401).json({ message: 'Unauthorized' });

    const worlds = await World.find({ userId: uid });

    // Initialize Forest world if no worlds exist
    if (worlds.length === 0) {
      const forestWorld = new World({
        userId: uid,
        worldId: 'forest',
        status: 'active',
        currentLevel: 1,
        unlockedAt: new Date()
      });
      await forestWorld.save();

      // Create level 1
      const level1 = new Level({
        userId: uid,
        worldId: 'forest',
        levelNumber: 1,
        status: 'unlocked'
      });
      await level1.save();

      worlds.push(forestWorld);
    }

    const worldsWithData = WORLD_DATA.map(worldInfo => {
      const userWorld = worlds.find(w => w.worldId === worldInfo.id);
      const totalLevels = 50;

      return {
        ...worldInfo,
        status: userWorld ? userWorld.status : 'locked',
        progress: userWorld ? Math.round((userWorld.completedLevels / totalLevels) * 100) : 0,
        completedLevels: userWorld ? userWorld.completedLevels : 0,
        totalLevels,
        stars: userWorld ? userWorld.totalStars : 0,
        currentLevel: userWorld ? userWorld.currentLevel : 1
      };
    });

    res.json(worldsWithData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get levels for a specific world
router.get('/:worldId/levels', authMiddleware, async (req, res) => {
  try {
    const uid = req.user?.userId ?? req.user?._id;
    if (!uid) return res.status(401).json({ message: 'Unauthorized' });

    const { worldId } = req.params;

    const levels = await Level.find({
      userId: uid,
      worldId
    }).sort({ levelNumber: 1 });

    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unlock a world
router.post('/:worldId/unlock', authMiddleware, async (req, res) => {
  try {
    const uid = req.user?.userId ?? req.user?._id;
    if (!uid) return res.status(401).json({ message: 'Unauthorized' });

    const { worldId } = req.params;

    const worldInfo = WORLD_DATA.find(w => w.id === worldId);
    if (!worldInfo) {
      return res.status(404).json({ message: 'World not found' });
    }

    // Check if user meets unlock requirement
    const forestWorld = await World.findOne({
      userId: uid,
      worldId: 'forest'
    });

    if (!forestWorld || forestWorld.completedLevels < worldInfo.unlockRequirement) {
      return res.status(403).json({
        message: `Complete ${worldInfo.unlockRequirement} levels in Focus Forest to unlock this world`
      });
    }

    let world = await World.findOne({
      userId: uid,
      worldId
    });

    if (!world) {
      world = new World({
        userId: uid,
        worldId,
        status: 'active',
        currentLevel: 1,
        unlockedAt: new Date()
      });
      await world.save();

      // Create level 1 for new world
      const level1 = new Level({
        userId: uid,
        worldId,
        levelNumber: 1,
        status: 'unlocked'
      });
      await level1.save();
    }

    res.json({
      message: 'World unlocked successfully!',
      world
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
