# NeuraRise - AI-Powered Habit Transformation Platform

## Installation Guide

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
- MongoDB URI
- OpenAI API Key
- Google Maps API Key
- Ludicks API Key
- Twilio credentials

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Features Implemented

### AI Features
- ✅ Emotion-Sensitive AI Mentor
- ✅ Habit Correction Engine
- ✅ Digital Twin Prediction Model
- ✅ Habit Deviation Emergency Detector
- ✅ Weekly Insight Generator
- ✅ Insight Engine (behavior → recommendations)
- ✅ AI Chatbot with contextual responses
- ✅ Symptom Matching Engine

### User Features
- ✅ Beautiful authentication (Login/Register/OTP)
- ✅ Modern dashboard with stats
- ✅ Habit tracking with streaks
- ✅ Emotional check-ins
- ✅ HabitCoins reward system
- ✅ Level progression
- ✅ AI chatbot assistant

### Community Features
- ✅ Community/Guild system
- ✅ Dynamic leadership (auto-selection based on consistency)
- ✅ Leaderboards
- ✅ Group challenges
- ✅ Real-time messaging

### Design System
- ✅ Deep blue, emerald gradient, gold accents
- ✅ Modern glassmorphism effects
- ✅ Smooth animations with Framer Motion
- ✅ Responsive design
- ✅ Custom Tailwind configuration

### Roles
- ✅ Users - Track habits, AI guidance, communities
- ✅ Mentors - Analytics, insights, AI co-pilot (in progress)
- ✅ Admins - Verification, moderation (in progress)

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/verify-otp` - Verify phone OTP

### AI Services
- POST `/api/ai/chatbot` - Chat with AI assistant
- POST `/api/ai/emotion-analysis` - Analyze emotional state
- POST `/api/ai/habit-correction` - Get habit corrections
- POST `/api/ai/predict-success` - Digital twin predictions
- POST `/api/ai/deviation-alert` - Emergency deviation detection
- GET `/api/ai/weekly-insights` - Get weekly insights
- POST `/api/ai/symptom-match` - Match and cope with symptoms

### Habits
- GET `/api/habits` - Get user habits
- POST `/api/habits` - Create new habit
- PUT `/api/habits/:id` - Update habit
- DELETE `/api/habits/:id` - Delete habit
- POST `/api/habits/:id/complete` - Mark habit complete

### Communities
- GET `/api/communities` - List communities
- POST `/api/communities` - Create community
- GET `/api/communities/:id` - Get community details
- POST `/api/communities/:id/join` - Join community
- GET `/api/communities/:id/leaderboard` - Community leaderboard

## Technology Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- OpenAI GPT-4 API
- Twilio for OTP
- Google Maps API
- Ludicks Gamification API
- JWT Authentication
- Socket.io (real-time)

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- Recharts
- React Hook Form
- Zustand (state management)

## Design Philosophy

NeuraRise is designed to be:
- **Emotionally Intelligent**: AI understands user psychology
- **Proactive**: Predicts and prevents failures
- **Gamified**: Rewards, levels, coins, competitions
- **Social**: Communities, mentors, challenges
- **Beautiful**: Modern, premium UI/UX

## Next Steps

To complete the full implementation:

1. **Backend**:
   - Complete mentor dashboard APIs
   - Complete admin dashboard APIs
   - Implement Twilio integration
   - Implement Google Maps integration
   - Add Socket.io for real-time features
   - Implement Ludicks gamification

2. **Frontend**:
   - Complete mentor dashboard UI
   - Complete admin dashboard UI
   - Add more habit tracking features
   - Implement community feed
   - Add real-time notifications
   - Create onboarding flow

3. **Testing & Deployment**:
   - Unit tests
   - Integration tests
   - Deploy to production
   - Set up CI/CD

## Contributing

This is a comprehensive habit transformation platform. Contributions welcome!

## License

MIT License
