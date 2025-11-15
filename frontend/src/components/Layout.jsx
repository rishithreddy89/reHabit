import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RiRobot3Fill } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Home, Target, Users, Trophy, Award, MessageCircle, User, LogOut, Zap, Settings, UserPlus, Inbox, CreditCard, Gamepad2 } from 'lucide-react';
import TopNavbar from '@/components/TopNavbar';

const Layout = ({ children, user, onLogout, role = 'user' }) => {
  const location = useLocation();

  const userNavItems = [
    { path: '/user/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/user/habits', icon: Target, label: 'Habits' },
    { path: '/user/gamification', icon: Gamepad2, label: 'Gamification' },
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

      {/* Floating AI Chat button (mobile only) */}
      <button
        onClick={() => navigate('/user/ai-chat')}
        aria-label="Open AI Chat"
        className="md:hidden fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center active:scale-95 hover:scale-110 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/50 animate-float"
        style={{
          animation: 'float 3s ease-in-out infinite'
        }}
      >
        <RiRobot3Fill className="h-8 w-8" />
      </button>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;