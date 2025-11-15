import '@/index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { Target, Flame, Star, TrendingUp, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import PlantGrowthCard from '@/components/PlantGrowthCard';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';
const API = `${BACKEND_URL}/api`;

const UserDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const [statsRes, habitsRes, leaderboardRes, insightsRes] = await Promise.all([
        axios.get(`${API}/users/stats`, config).catch(() => ({ data: { total_habits: 0, streak: 0, xp: 0, level: 1, total_completions: 0 } })),
        axios.get(`${API}/habits`, config).catch(() => ({ data: [] })),
        axios.get(`${API}/leaderboard`, config).catch(() => ({ data: [] })),
        axios.get(`${API}/ai/insights`, config).catch(() => ({ data: { insights: '' } }))
      ]);
      
      setStats(statsRes.data);
      setHabits(habitsRes.data.slice(0, 5));
      setLeaderboard(leaderboardRes.data.slice(0, 5));
      setInsights(insightsRes.data.insights);
    } catch (error) {
      console.error('Dashboard load error:', error);
      // Silently handle errors - dashboard will show with default/empty data
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout} role="user">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout} role="user">
      <div className="space-y-6" data-testid="user-dashboard">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>Welcome back, {user.name}!</h1>
            <p className="text-slate-600 mt-1">Let's keep building those habits</p>
          </div>
          <Link to="/user/habits">
            <Button className="gap-2" data-testid="add-habit-btn">
              <Plus className="w-4 h-4" />
              Add Habit
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover" data-testid="stat-total-habits">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Habits</CardTitle>
              <Target className="w-5 h-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{stats?.total_habits || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Active tracking</p>
            </CardContent>
          </Card>

          <Card className="card-hover" data-testid="stat-current-streak">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Current Streak</CardTitle>
              <Flame className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold streak-fire">{stats?.streak || 0} days</div>
              <p className="text-xs text-slate-500 mt-1">Keep it going!</p>
            </CardContent>
          </Card>

          <Card className="card-hover" data-testid="stat-total-xp">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total XP</CardTitle>
              <Star className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800 xp-glow">{stats?.xp || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Level {stats?.level || 1}</p>
            </CardContent>
          </Card>

          <Card className="card-hover" data-testid="stat-completions">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Completions</CardTitle>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{stats?.total_completions || 0}</div>
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Plant Growth Visualization */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Plant Growth Card */}
          <div className="lg:col-span-1">
            <PlantGrowthCard userStreak={stats?.streak || 0} />
          </div>

          {/* Today's Habits */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Today's Habits</CardTitle>
                <CardDescription>Keep your momentum going</CardDescription>
              </CardHeader>
              <CardContent>
                {habits.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No habits yet. Start building!</p>
                    <Link to="/user/habits">
                      <Button className="mt-4" data-testid="create-first-habit">Create Your First Habit</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {habits.map((habit, index) => {
                      const habitKey = habit._id || habit.id || `${habit.title}-${index}`;
                      return (
                      <Link key={habitKey} to={`/user/habits/${habit._id || habit.id || ''}`} data-testid={`habit-card-${habitKey}`}>
                        <div className="p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-slate-800">{habit.title}</h3>
                            <span className="text-sm text-slate-500">{habit.category}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Flame className="w-4 h-4 text-orange-500" />
                              <span>{habit.streak} day streak</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4 text-emerald-600" />
                              <span>{habit.total_completions} completions</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                      );})}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Leaderboard Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Leaderboard</span>
                <Link to="/user/leaderboard" className="text-sm text-emerald-600 hover:underline" data-testid="view-full-leaderboard">View All</Link>
              </CardTitle>
              <CardDescription>Top performers this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((leader, index) => {
                  const leaderKey = leader._id || leader.id || `${leader.name}-${index}`;
                  return (
                  <div key={leaderKey} className="flex items-center gap-3" data-testid={`leaderboard-entry-${index}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-slate-100 text-slate-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-800">{leader.name}</p>
                      <p className="text-xs text-slate-500">{leader.xp} XP</p>
                    </div>
                  </div>
                  );})}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        {insights && (
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200" data-testid="ai-insights-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-wrap">{insights}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default UserDashboard;