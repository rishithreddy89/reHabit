import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Target, Users, Trophy, Award, MessageCircle, User, LogOut, Zap, Settings, UserPlus, Inbox } from 'lucide-react';

const Layout = ({ children, user, onLogout, role = 'user' }) => {
  const location = useLocation();

  const userNavItems = [
    { path: '/user/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/user/habits', icon: Target, label: 'Habits' },
    { path: '/user/community', icon: Users, label: 'Community' },
    { path: '/user/mentors', icon: UserPlus, label: 'Mentors' },
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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <Link to={`/${role}/dashboard`} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>Rehabit</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Link
            to={`/${role}/profile`}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 mb-2"
            data-testid="nav-profile"
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;