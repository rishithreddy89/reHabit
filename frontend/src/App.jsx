import React, { useState, useEffect, useMemo } from 'react';
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
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  // Only update localStorage when user actually changes, avoid loops
  useEffect(() => {
    if (user) {
      const currentStored = localStorage.getItem('user');
      const newUserString = JSON.stringify(user);
      if (currentStored !== newUserString) {
        localStorage.setItem('user', newUserString);
      }
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

  // Determine if user is authenticated and their role
  const isAuthenticated = !!user;
  const userRole = user?.role || 'user';

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Auth route - redirect to dashboard if authenticated */}
        <Route 
          path="/auth" 
          element={
            isAuthenticated ? (
              <Navigate to={`/${userRole}/dashboard`} replace />
            ) : (
              <AuthPage onLogin={handleLogin} />
            )
          } 
        />

        {/* Onboarding - requires authentication */}
        <Route 
          path="/onboarding" 
          element={
            isAuthenticated ? (
              <OnboardingPage user={user} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />

        {/* User Routes */}
        <Route 
          path="/user/dashboard" 
          element={
            isAuthenticated && userRole === 'user' ? (
              <UserDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/user/habits" 
          element={
            isAuthenticated && userRole === 'user' ? (
              <HabitManagement user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/user/habits/:habitId" 
          element={
            isAuthenticated && userRole === 'user' ? (
              <HabitDetail user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/user/community" 
          element={
            isAuthenticated && userRole === 'user' ? (
              <CommunityPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/user/leaderboard" 
          element={
            isAuthenticated && userRole === 'user' ? (
              <LeaderboardPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/user/badges" 
          element={
            isAuthenticated && userRole === 'user' ? (
              <BadgesPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/user/ai-chat" 
          element={
            isAuthenticated && userRole === 'user' ? (
              <AIChatbot user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/user/profile" 
          element={
            isAuthenticated && userRole === 'user' ? (
              <ProfilePage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/user/mentors" 
          element={
            isAuthenticated && userRole === 'user' ? (
              <MentorsPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/user/mentors/requests" 
          element={
            isAuthenticated && userRole === 'user' ? (
              <MentorRequestsPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/user/mentors/:mentorId" 
          element={
            isAuthenticated && userRole === 'user' ? (
              <MentorProfilePage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />

        {/* Mentor Routes */}
        <Route 
          path="/mentor/dashboard" 
          element={
            isAuthenticated && userRole === 'mentor' ? (
              <MentorDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/mentor/requests" 
          element={
            isAuthenticated && userRole === 'mentor' ? (
              <MentorRequestsManagement user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/mentor/clients" 
          element={
            isAuthenticated && userRole === 'mentor' ? (
              <ClientManagement user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/mentor/client/:clientId" 
          element={
            isAuthenticated && userRole === 'mentor' ? (
              <ClientProgress user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/mentor/profile" 
          element={
            isAuthenticated && userRole === 'mentor' ? (
              <ProfilePage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            isAuthenticated && userRole === 'admin' ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            isAuthenticated && userRole === 'admin' ? (
              <UserManagement user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/admin/mentors" 
          element={
            isAuthenticated && userRole === 'admin' ? (
              <MentorManagement user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />

        {/* Default route */}
        <Route 
          path="/" 
          element={
            <Navigate 
              to={isAuthenticated ? `/${userRole}/dashboard` : '/auth'} 
              replace 
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;