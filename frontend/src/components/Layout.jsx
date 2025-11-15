import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Target, Users, Trophy, Award, MessageCircle, User, LogOut, Zap, Settings, UserPlus, Inbox, CreditCard } from 'lucide-react';
import TopNavbar from '@/components/TopNavbar';

const Layout = ({ children, user, onLogout, role = 'user' }) => {
  const location = useLocation();

  const userNavItems = [
    { path: '/user/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/user/habits', icon: Target, label: 'Habits' },
    { path: '/user/community', icon: Users, label: 'Community' },
    { path: '/user/mentors', icon: UserPlus, label: 'Mentors' },
    { path: '/user/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { path: '/user/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/user/badges', icon: Award, label: 'Badges' },
    { path: '/user/ai-chat', icon: MessageCircle, label: 'AI Chat' },
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar (pill, floating) */}
      <TopNavbar
        items={navItems}
        brandHref={`/${role}/dashboard`}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-3 sm:px-4 pb-10 pt-4 sm:pt-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;