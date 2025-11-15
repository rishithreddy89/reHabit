import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Flame, Trophy, TrendingUp, Target, Users, Brain, Heart,
  Calendar, Award, Zap, ChevronRight, Plus, Bell, Settings,
  MessageCircle, Star, Gift
} from 'lucide-react';
import AIChatbot, { AIChatbotButton } from '../../components/AIChatbot';
import axios from 'axios';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);

      // Load habits
      const habitsResponse = await axios.get('http://localhost:4000/api/habits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHabits(habitsResponse.data.habits || []);

      // Load stats
      const statsResponse = await axios.get('http://localhost:4000/api/users/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsResponse.data);

      // Load AI insights
      const insightsResponse = await axios.get('http://localhost:4000/api/ai/insights', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInsights(insightsResponse.data);
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="neura-card-hover p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 bg-${color}/20 rounded-lg`}>
            <Icon className={`w-6 h-6 text-${color}`} />
          </div>
          <div>
            <p className="text-neura-gray text-sm">{label}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
          </div>
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-neura-emerald text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+{trend}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  const HabitCard = ({ habit }) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="neura-card p-4 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-white font-semibold">{habit.title}</h4>
          <p className="text-neura-gray text-sm mt-1">{habit.category}</p>
        </div>
        <div className="flex items-center space-x-1">
          <Flame className="w-5 h-5 text-neura-gold" />
          <span className="text-neura-gold font-bold">{habit.streak || 0}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-neura-gray">Progress</span>
          <span className="text-white">{habit.total_completions || 0} completions</span>
        </div>
        <div className="w-full bg-neura-blue/30 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(habit.total_completions || 0) % 100}%` }}
            className="bg-gradient-neura h-2 rounded-full"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="neura-badge text-xs">{habit.frequency || 'Daily'}</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="neura-btn-gold text-xs py-1 px-3"
        >
          Complete
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-premium p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-neura-gray">Let's make today count</p>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-neura-blue/20 rounded-lg hover:bg-neura-blue/40 transition-all relative"
          >
            <Bell className="w-6 h-6 text-neura-white" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-neura-gold rounded-full"></span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-neura-blue/20 rounded-lg hover:bg-neura-blue/40 transition-all"
          >
            <Settings className="w-6 h-6 text-neura-white" />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${user?.stats?.currentStreak || 0} days`}
          color="neura-gold"
          trend={12}
        />
        <StatCard
          icon={Trophy}
          label="HabitCoins"
          value={user?.habitCoins || 0}
          color="neura-emerald"
          trend={25}
        />
        <StatCard
          icon={Target}
          label="Completion Rate"
          value={`${stats?.completionRate || 0}%`}
          color="neura-blue-light"
        />
        <StatCard
          icon={Award}
          label="Level"
          value={user?.level || 1}
          color="neura-gold"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Habits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="neura-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-neura-emerald" />
                <span>Today's Habits</span>
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="neura-btn-primary text-sm py-2 px-4 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Habit</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.length > 0 ? (
                habits.map((habit, index) => (
                  <HabitCard key={habit._id || index} habit={habit} />
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <Target className="w-16 h-16 text-neura-gray mx-auto mb-4" />
                  <p className="text-neura-gray">No habits yet. Start your transformation journey!</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="neura-btn-gold mt-4"
                  >
                    Create Your First Habit
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="neura-card p-6 bg-gradient-to-br from-neura-blue to-neura-emerald/20"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="w-8 h-8 text-neura-gold animate-pulse" />
              <h3 className="text-xl font-bold text-white">AI Insights</h3>
            </div>
            <p className="text-neura-white mb-4">
              {insights?.latestInsight || "You're building incredible momentum! Your consistency this week is 23% higher than last week. Keep up the amazing work! 🚀"}
            </p>
            <div className="flex items-center justify-between">
              <button className="text-neura-emerald-light hover:text-neura-emerald text-sm font-semibold flex items-center space-x-1">
                <span>View Full Report</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-xs text-neura-gray">Updated 2 hours ago</span>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Emotional Check-in */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="neura-card p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-bold text-white">How are you feeling?</h3>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {['😢', '😟', '😐', '🙂', '😄'].map((emoji, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-3xl p-2 bg-neura-blue/20 rounded-lg hover:bg-neura-blue/40 transition-all"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
            <p className="text-neura-gray text-xs">Your emotions help our AI provide better support</p>
          </motion.div>

          {/* Community */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="neura-card p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-6 h-6 text-neura-emerald" />
              <h3 className="text-lg font-bold text-white">Your Communities</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Fitness Warriors', members: 1247, rank: 3 },
                { name: 'Mindful Living', members: 892, rank: 7 },
              ].map((community, index) => (
                <div key={index} className="p-3 bg-neura-blue/20 rounded-lg hover:bg-neura-blue/30 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">{community.name}</p>
                      <p className="text-neura-gray text-xs">{community.members} members</p>
                    </div>
                    <div className="text-right">
                      <span className="neura-badge-gold text-xs">#{community.rank}</span>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full neura-btn-outline text-sm py-2">
                Explore Communities
              </button>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="neura-card p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { icon: MessageCircle, label: 'Chat with Mentor', color: 'neura-emerald' },
                { icon: Star, label: 'View Leaderboard', color: 'neura-gold' },
                { icon: Gift, label: 'Redeem Rewards', color: 'neura-gold' },
                { icon: Zap, label: 'Join Challenge', color: 'neura-blue-light' },
              ].map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ x: 5 }}
                  className="w-full flex items-center space-x-3 p-3 bg-neura-blue/20 rounded-lg hover:bg-neura-blue/30 transition-all text-left"
                >
                  <action.icon className={`w-5 h-5 text-${action.color}`} />
                  <span className="text-white text-sm">{action.label}</span>
                  <ChevronRight className="w-4 h-4 text-neura-gray ml-auto" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Chatbot */}
      {!chatbotOpen && <AIChatbotButton onClick={() => setChatbotOpen(true)} />}
      <AIChatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </div>
  );
};

export default UserDashboard;
