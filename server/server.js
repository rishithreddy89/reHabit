const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// try to load optional morgan logger
let morgan = null;
try {
  morgan = require('morgan');
} catch (err) {
  console.warn('Optional dependency "morgan" not found. Install with "npm install morgan" to enable request logging.');
}

require('dotenv').config();

const app = express();

// build MONGO_URI from env pieces if provided (useful to avoid committing credentials)
const {
  MONGO_URI: RAW_MONGO_URI,
  MONGO_USER,
  MONGO_PASS,
  MONGO_HOST,
  MONGO_DB
} = process.env;

let MONGO_URI = RAW_MONGO_URI || '';

// if separate pieces provided, construct a connection string
if (!MONGO_URI && MONGO_USER && MONGO_PASS && MONGO_HOST) {
  const db = MONGO_DB || 'rehabit';
  // prefer SRV style if host looks like a cluster host
  if (MONGO_HOST.includes('mongodb+srv') || MONGO_HOST.includes('cluster')) {
    MONGO_URI = `mongodb+srv://${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASS)}@${MONGO_HOST}/${db}?retryWrites=true&w=majority`;
  } else {
    MONGO_URI = `mongodb://${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASS)}@${MONGO_HOST}/${db}`;
  }
}

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const corsOptions = {
  origin: Array.isArray(CORS_ORIGIN) ? CORS_ORIGIN : CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// ensure preflight requests are handled
app.options('*', cors(corsOptions));

app.use(express.json());

// use morgan if available, otherwise a minimal fallback logger in dev
if (morgan) {
  app.use(morgan('dev'));
} else {
  app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${req.method} ${req.originalUrl}`);
    }
    next();
  });
}

const PORT = process.env.PORT || 4000;

// fail-fast: disable mongoose command buffering so operations error when no connection
mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', false); // optional, keep default behavior

async function connectDb() {
  if (!MONGO_URI) {
    console.warn('No MONGO_URI provided — running without DB connection. To enable DB, set MONGO_URI in server/.env or provide MONGO_USER/MONGO_PASS/MONGO_HOST/MONGO_DB.');
    return;
  }
  try {
    // set a reasonable server selection timeout so failures surface quickly
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
  } catch (err) {
    // improve error messages for common issues
    console.warn('MongoDB connection failed, continuing without DB:', err.message);
    if (/auth|bad auth|Authentication failed/i.test(err.message)) {
      console.warn('MongoDB authentication failed. Check MONGO_URI or MONGO_USER/MONGO_PASS in server/.env.');
      console.warn('If you intended to run locally, set MONGO_URI=mongodb://127.0.0.1:27017/rehabit (start a local mongod).');
    }
  }
}

// log mongoose connection events to help debugging
mongoose.connection.on('connected', () => console.log('Mongoose connection state: connected'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err && err.message));
mongoose.connection.on('disconnected', () => console.warn('Mongoose connection state: disconnected'));

const tryRequire = (candidate) => {
  try {
    const full = path.resolve(candidate);
    if (fs.existsSync(full)) return require(full);
  } catch (e) {
    /* ignore */
  }
  return null;
};

async function gatherAnalytics() {
  const defaults = {
    total_users: 0,
    total_habits: 0,
    total_communities: 0,
    total_completions: 0,
  };

  // try common model locations relative to project
  const candidates = [
    path.join(__dirname, './models/User.js'),
    path.join(__dirname, '../backend/models/User.js'),
    path.join(__dirname, '../models/User.js'),
  ];
  const User = candidates.map(tryRequire).find(Boolean);

  const habitCandidates = [
    path.join(__dirname, './models/Habit.js'),
    path.join(__dirname, '../backend/models/Habit.js'),
    path.join(__dirname, '../models/Habit.js'),
  ];
  const Habit = habitCandidates.map(tryRequire).find(Boolean);

  const communityCandidates = [
    path.join(__dirname, './models/Community.js'),
    path.join(__dirname, '../backend/models/Community.js'),
    path.join(__dirname, '../models/Community.js'),
  ];
  const Community = communityCandidates.map(tryRequire).find(Boolean);

  const completionCandidates = [
    path.join(__dirname, './models/Completion.js'),
    path.join(__dirname, '../backend/models/Completion.js'),
    path.join(__dirname, '../models/Completion.js'),
  ];
  const Completion = completionCandidates.map(tryRequire).find(Boolean);

  try {
    const promises = [
      User ? User.countDocuments().exec() : Promise.resolve(0),
      Habit ? Habit.countDocuments().exec() : Promise.resolve(0),
      Community ? Community.countDocuments().exec() : Promise.resolve(0),
      Completion ? Completion.countDocuments().exec() : Promise.resolve(0),
    ];

    const [total_users, total_habits, total_communities, total_completions] = await Promise.all(promises);

    return { total_users, total_habits, total_communities, total_completions };
  } catch (err) {
    console.error('Error gathering analytics:', err.message);
    return defaults;
  }
}

// mount auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// mount habit routes
const habitRoutes = require('./routes/habits');
app.use('/api/habits', habitRoutes);

// mount community routes
const communityRoutes = require('./routes/communities');
app.use('/api/communities', communityRoutes);

// mount challenge routes
const challengeRoutes = require('./routes/challenges');
app.use('/api/challenges', challengeRoutes);

// mount mentor routes
const mentorRoutes = require('./routes/mentor');
app.use('/api/mentor', mentorRoutes);

// mount admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// mount AI routes
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

// mount user stats routes (was missing, caused 404 on /api/users/stats)
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// mount leaderboard routes (was missing, caused 404 on /api/leaderboard)
const leaderboardRoutes = require('./routes/leaderboard');
app.use('/api/leaderboard', leaderboardRoutes);

// API route for admin analytics
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const data = await gatherAnalytics();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Basic health endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// global error handler (should be after routes)
app.use((err, req, res, next) => {
  console.error('Unhandled route/middleware error:', err.stack || err);
  res.status(500).json({ message: err.message || 'Internal Server Error', error: err.message });
});

// log unhandled rejections / uncaught exceptions to aid debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err.stack || err);
  // in production you might process.exit(1) after cleanup
});

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`CORS origin allowed: ${CORS_ORIGIN}`);
  });
});

module.exports = app;
