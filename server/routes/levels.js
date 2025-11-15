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
    // if header contains only token
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
    console.log('🔐 Auth Debug - Token found:', token ? 'YES' : 'NO');
    
    if (!token) {
      console.log('❌ Auth Debug - No token in request');
      return res.status(401).json({ message: 'Unauthorized: missing token' });
    }
    
    // Use the same secret as your main auth middleware
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    let decoded = null;
    
    try {
      decoded = jwt.verify(token, secret);
      console.log('✅ Auth Debug - Token verified with JWT_SECRET');
      console.log('✅ Auth Debug - Decoded payload:', decoded);
    } catch (err) {
      console.log('❌ Auth Debug - Token verification failed:', err.message);
      return res.status(401).json({ message: 'Unauthorized: invalid token', error: err.message });
    }
    
    // Normalize the user payload - your auth.js uses decoded.id
    req.user = {
      userId: decoded.id || decoded.userId || decoded._id,
      id: decoded.id || decoded.userId || decoded._id,
      _id: decoded.id || decoded.userId || decoded._id,
      ...decoded
    };
    
    console.log('✅ Auth Debug - User set on request:', { userId: req.user.userId, id: req.user.id });
    
    return next();
  } catch (err) {
    console.error('❌ Auth Debug - Error:', err.message);
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

import Level from '../models/Level.js';
import World from '../models/World.js';
import User from '../models/User.js';

const router = express.Router();

// Get all levels for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const uid = req.user?.userId ?? req.user?._id;
    if (!uid) return res.status(401).json({ message: 'Unauthorized' });

    const levels = await Level.find({ userId: uid })
      .sort({ worldId: 1, levelNumber: 1 });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific level
router.get('/:levelNumber', authMiddleware, async (req, res) => {
  try {
    const uid = req.user?.userId ?? req.user?._id;
    if (!uid) return res.status(401).json({ message: 'Unauthorized' });

    const { levelNumber } = req.params;
    const { worldId } = req.query;

    const level = await Level.findOne({
      userId: uid,
      worldId: worldId || 'forest',
      levelNumber: parseInt(levelNumber)
    });

    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    res.json(level);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start a level
router.post('/:levelNumber/start', authMiddleware, async (req, res) => {
  try {
    const uid = req.user?.userId ?? req.user?._id;
    if (!uid) return res.status(401).json({ message: 'Unauthorized' });

    const { levelNumber } = req.params;
    const { worldId = 'forest' } = req.body;

    let level = await Level.findOne({
      userId: uid,
      worldId,
      levelNumber: parseInt(levelNumber)
    });

    if (!level) {
      // Create level if doesn't exist
      level = new Level({
        userId: uid,
        worldId,
        levelNumber: parseInt(levelNumber),
        status: levelNumber === '1' || parseInt(levelNumber) === 1 ? 'current' : 'locked'
      });
    }

    if (level.status === 'locked') {
      return res.status(403).json({ message: 'Level is locked. Complete previous levels first.' });
    }

    level.status = 'current';
    level.startedAt = new Date();
    level.attempts += 1;
    await level.save();

    res.json({
      message: 'Level started successfully',
      level
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete a level
router.post('/:levelNumber/complete', authMiddleware, async (req, res) => {
  try {
    const uid = req.user?.userId ?? req.user?._id;
    if (!uid) return res.status(401).json({ message: 'Unauthorized' });

    const { levelNumber } = req.params;
    const { worldId = 'forest', stars = 0 } = req.body;

    const level = await Level.findOne({
      userId: uid,
      worldId,
      levelNumber: parseInt(levelNumber)
    });

    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    level.status = 'completed';
    level.stars = Math.max(level.stars, stars);
    level.bestStars = Math.max(level.bestStars, stars);
    level.completedAt = new Date();
    await level.save();

    // Unlock next level
    const nextLevel = parseInt(levelNumber) + 1;
    if (nextLevel <= 50) {
      let nextLevelDoc = await Level.findOne({
        userId: uid,
        worldId,
        levelNumber: nextLevel
      });

      if (!nextLevelDoc) {
        nextLevelDoc = new Level({
          userId: uid,
          worldId,
          levelNumber: nextLevel,
          status: 'unlocked'
        });
        await nextLevelDoc.save();
      } else if (nextLevelDoc.status === 'locked') {
        nextLevelDoc.status = 'unlocked';
        await nextLevelDoc.save();
      }
    }

    // Update world progress
    const world = await World.findOne({ userId: uid, worldId });
    if (world) {
      world.completedLevels += 1;
      world.totalStars += stars;
      world.currentLevel = Math.max(world.currentLevel, nextLevel);
      
      if (world.completedLevels >= 50) {
        world.status = 'completed';
        world.completedAt = new Date();
      }
      await world.save();
    }

    // Award rewards
    const user = await User.findById(uid);
    if (user) {
      const xpReward = 100 + (stars * 50);
      const coinsReward = 50 + (stars * 25);

      user.totalXP = (user.totalXP || 0) + xpReward;
      user.coins = (user.coins || 0) + coinsReward;
      await user.save();

      res.json({
        message: 'Level completed successfully!',
        level,
        rewards: {
          xp: xpReward,
          coins: coinsReward
        },
        nextLevelUnlocked: nextLevel <= 50
      });
    } else {
      // user not found (shouldn't happen if auth succeeded)
      res.status(500).json({ message: 'User record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Retry a level
router.post('/:levelNumber/retry', authMiddleware, async (req, res) => {
  try {
    const uid = req.user?.userId ?? req.user?._id;
    if (!uid) return res.status(401).json({ message: 'Unauthorized' });

    const { levelNumber } = req.params;
    const { worldId = 'forest' } = req.body;

    const level = await Level.findOne({
      userId: uid,
      worldId,
      levelNumber: parseInt(levelNumber)
    });

    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    level.status = 'current';
    level.stars = 0;
    level.startedAt = new Date();
    await level.save();

    res.json({
      message: 'Level reset successfully',
      level
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
