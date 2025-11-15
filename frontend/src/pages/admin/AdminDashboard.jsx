import '@/index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Trophy, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/lib/config';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ user, onLogout }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/admin/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout} role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout} role="admin">
      <div className="space-y-6" data-testid="admin-dashboard">
        <div>
          <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Platform overview and analytics</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="stat-total-users">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
              <Users className="w-5 h-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{analytics?.total_users || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-habits">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Habits</CardTitle>
              <Target className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{analytics?.total_habits || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Created by users</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-communities">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Communities</CardTitle>
              <Trophy className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{analytics?.total_communities || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Groups & challenges</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-completions">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Completions</CardTitle>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{analytics?.total_completions || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Habit completions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Activity</CardTitle>
              <CardDescription>Recent platform metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Avg habits per user</span>
                  <span className="font-bold text-slate-800">
                    {analytics?.total_users > 0 ? (analytics.total_habits / analytics.total_users).toFixed(1) : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Avg completions per habit</span>
                  <span className="font-bold text-slate-800">
                    {analytics?.total_habits > 0 ? (analytics.total_completions / analytics.total_habits).toFixed(1) : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Platform engagement</span>
                  <span className="font-bold text-emerald-600">High</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <button 
                onClick={() => navigate('/admin/users')}
                className="w-full text-left p-3 border rounded-lg hover:bg-slate-50 transition-colors" 
                data-testid="view-users-btn"
              >
                <p className="font-semibold text-slate-800">Manage Users</p>
                <p className="text-sm text-slate-500">View and moderate user accounts</p>
              </button>
              <button 
                onClick={() => navigate('/admin/mentors')}
                className="w-full text-left p-3 border rounded-lg hover:bg-slate-50 transition-colors" 
                data-testid="view-mentors-btn"
              >
                <p className="font-semibold text-slate-800">Manage Mentors</p>
                <p className="text-sm text-slate-500">Oversee mentor assignments</p>
              </button>
              <button 
                onClick={() => navigate('/admin/reports')}
                className="w-full text-left p-3 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <p className="font-semibold text-slate-800">View Reports</p>
                <p className="text-sm text-slate-500">Handle user reports and issues</p>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;