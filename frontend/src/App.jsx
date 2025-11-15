import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/index.css';
import axios from 'axios';

// Import pages
import SplashScreen from '@/pages/SplashScreen';
import AuthPage from '@/pages/AuthPage';
import OnboardingPage from '@/pages/OnboardingPage';

// User pages
import UserDashboard from '@/pages/user/Dashboard';
import HabitManagement from '@/pages/user/HabitManagement';
import HabitDetail from '@/pages/user/HabitDetail';
import CommunityPage from '@/pages/user/CommunityPage';
import LeaderboardPage from '@/pages/user/LeaderboardPage';
import BadgesPage from '@/pages/user/BadgesPage';
import AIChatbot from '@/pages/user/AIChatbot';
import ProfilePage from '@/pages/user/ProfilePage';
import MentorsPage from './pages/user/MentorsPage';
import MentorProfilePage from './pages/user/MentorProfilePage';
import MentorRequestsPage from './pages/user/MentorRequestsPage';
import MySubscriptions from './pages/user/MySubscriptions';

// Mentor pages
import MentorDashboard from '@/pages/mentor/MentorDashboard';
import MentorRequestsManagement from '@/pages/mentor/MentorRequestsManagement';
import ClientManagement from '@/pages/mentor/ClientManagement';
import ClientProgress from '@/pages/mentor/ClientProgress';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import MentorManagement from '@/pages/admin/MentorManagement';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000';
const API = `${BACKEND_URL}/api`;

// ensure axios uses stored token on initial load (prevents 401 for refresh)
const _storedToken = localStorage.getItem('token');
if (_storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${_storedToken}`;
}

// optional: set axios base URL so components can use relative paths if desired
axios.defaults.baseURL = API;

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={!user ? <AuthPage onLogin={handleLogin} /> : <Navigate to={`/${user?.role || 'user'}/dashboard`} />} />
        <Route path="/onboarding" element={user ? <OnboardingPage user={user} /> : <Navigate to="/auth" />} />

        {/* User Routes */}
        <Route path="/user/dashboard" element={user && user.role === 'user' ? <UserDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/user/habits" element={user && user.role === 'user' ? <HabitManagement user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/user/habits/:habitId" element={user && user.role === 'user' ? <HabitDetail user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/user/community" element={user && user.role === 'user' ? <CommunityPage user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/user/leaderboard" element={user && user.role === 'user' ? <LeaderboardPage user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/user/badges" element={user && user.role === 'user' ? <BadgesPage user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/user/ai-chat" element={user && user.role === 'user' ? <AIChatbot user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/user/profile" element={user && user.role === 'user' ? <ProfilePage user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/user/mentors" element={user && user.role === 'user' ? <MentorsPage user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/user/mentors/requests" element={user && user.role === 'user' ? <MentorRequestsPage user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/user/mentors/:mentorId" element={user && user.role === 'user' ? <MentorProfilePage user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/user/subscriptions" element={user && user.role === 'user' ? <MySubscriptions user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />

        {/* Mentor Routes */}
        <Route path="/mentor/dashboard" element={user && user.role === 'mentor' ? <MentorDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/mentor/requests" element={user && user.role === 'mentor' ? <MentorRequestsManagement user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/mentor/clients" element={user && user.role === 'mentor' ? <ClientManagement user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/mentor/client/:clientId" element={user && user.role === 'mentor' ? <ClientProgress user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/mentor/profile" element={user && user.role === 'mentor' ? <ProfilePage user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={user && user.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/admin/users" element={user && user.role === 'admin' ? <UserManagement user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        <Route path="/admin/mentors" element={user && user.role === 'admin' ? <MentorManagement user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />

        <Route path="/" element={<Navigate to={user ? `/${user?.role || 'user'}/dashboard` : '/auth'} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;