import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Mentor from '../models/Mentor.js';
import Admin from '../models/Admin.js';
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

function sanitizeUser(user) {
  const u = user.toObject ? user.toObject() : { ...user };
  delete u.password;
  return u;
}

async function generateUsername(base) {
  const sanitized = (base || 'user').toString().trim().toLowerCase().replace(/\s+/g, '');
  return `${sanitized}${Date.now().toString().slice(-4)}`;
}

const register = async (req, res) => {
  try {
    // fail fast if DB not connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected', detail: 'Cannot register while DB is unavailable. Check server logs / MONGO_URI.' });
    }

    const { name, email, password, role = 'user' } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const username = await generateUsername(name);
    const user = new User({
      username,
      name,
      email,
      password,
      role,
      profile: { fullName: name }
    });

    // Initialize mentor-specific fields if role is mentor
    if (role === 'mentor') {
      user.mentorProfile = {
        specialization: ['general'],
        experience: '',
        maxClients: 10,
        currentClients: 0
      };
      user.bio = '';
      console.log('Created user with mentor role and mentorProfile:', user._id);
    }

    await user.save();

    // Create admin doc if needed (separate collection)
    if (role === 'admin') {
      try {
        const adminDoc = new Admin({ userId: user._id, permissions: ['all'] });
        await adminDoc.save();
      } catch (err) {
        console.warn('Failed to create admin doc:', err.message);
      }
    }

    const token = signToken(user._id);
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Register error:', err.stack || err);
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    // fail fast if DB not connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected', detail: 'Cannot login while DB is unavailable. Check server logs / MONGO_URI.' });
    }

    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    if (role && user.role !== role) {
      return res.status(403).json({ message: 'Invalid credentials for this role' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err.stack || err);
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected', detail: 'Cannot fetch user while DB is unavailable.' });
    }
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Not authenticated' });
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('Me error:', err.stack || err);
    return res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

export default {
  register,
  login,
  getMe
};
