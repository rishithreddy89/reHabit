import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RiRobot3Fill } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Home, Target, Users, Trophy, Award, MessageCircle, User, LogOut, Zap, Settings, UserPlus, Inbox, CreditCard, Gamepad2 } from 'lucide-react';
import TopNavbar from '@/components/TopNavbar';
import AIChatbot, { AIChatbotButton } from '@/components/AIChatbot';

const Layout = ({ children, user, onLogout, role = 'user' }) => {
  const location = useLocation();
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const userNavItems = [
    { path: '/user/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/user/habits', icon: Target, label: 'Habits' },
    { path: '/user/gamification', icon: Gamepad2, label: 'Gamification' },
    { path: '/user/community', icon: Users, label: 'Community' },
    { path: '/user/mentors', icon: UserPlus, label: 'Mentors' },
    { path: '/user/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { path: '/user/leaderboard', icon: Trophy, label: 'Leaderboard' },
  ];

  const mentorNavItems = [
    { path: '/mentor/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/mentor/requests', icon: Inbox, label: 'Requests' },
    { path: '/mentor/clients', icon: Users, label: 'Clients' },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/mentors', icon: Award, label: 'Mentors' },
  ];

  const navItems = role === 'mentor' ? mentorNavItems : role === 'admin' ? adminNavItems : userNavItems;

  console.log('Layout navItems:', navItems);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar (pill, floating) */}
      <TopNavbar
        items={navItems}
        brandHref={`/${role}/dashboard`}
        onLogout={onLogout}
        user={user}
      />

      {/* Main Content - intentionally narrower than navbar pill */}
      <div className="w-full px-4 pt-4">
        <main className="mx-auto max-w-5xl pb-10 px-2 sm:px-4">
          {children}
        </main>
      </div>

      {/* Floating AI Chatbot button and chat window */}
      {!chatbotOpen && <AIChatbotButton onClick={() => setChatbotOpen(true)} />}
      <AIChatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </div>
  );
};

export default Layout;