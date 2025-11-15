import '@/index.css';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, Flame, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/lib/config';

const ClientProgress = ({ user, onLogout }) => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientProgress();
  }, [clientId]);

  const fetchClientProgress = async () => {
    if (!clientId) {
      toast.error('Invalid client ID');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API}/mentors/clients/${clientId}`);
      console.log('Client progress data:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching client progress:', error);
      toast.error('Failed to load client data');
      navigate('/mentor/clients');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <Layout user={user} onLogout={onLogout} role="mentor">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout} role="mentor">
      <div className="space-y-6" data-testid="client-progress-page">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/mentor/clients')} data-testid="back-to-clients">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>{data.client.name}'s Progress</h1>
          <p className="text-slate-600 mt-1">{data.client.email}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card data-testid="client-xp">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total XP</CardTitle>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{data.client?.xp || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Level {data.client?.level || 1}</p>
            </CardContent>
          </Card>

          <Card data-testid="client-streak">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Current Streak</CardTitle>
              <Flame className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold streak-fire">{data.client?.streak || 0}</div>
              <p className="text-xs text-slate-500 mt-1">days</p>
            </CardContent>
          </Card>

          <Card data-testid="client-habits">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Habits</CardTitle>
              <Target className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{data.total_habits || 0}</div>
              <p className="text-xs text-slate-500 mt-1">active tracking</p>
            </CardContent>
          </Card>

          <Card data-testid="client-active-streaks">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Streaks</CardTitle>
              <Flame className="w-5 h-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{data.active_streaks || 0}</div>
              <p className="text-xs text-slate-500 mt-1">ongoing</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client Habits</CardTitle>
          </CardHeader>
          <CardContent>
            {!data.habits || data.habits.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No habits yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.habits.map((habit) => (
                  <div key={habit.id || habit._id} className="p-4 border rounded-lg" data-testid={`habit-${habit.id || habit._id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-800">{habit.title}</h3>
                      <span className="text-sm text-slate-500">{habit.category}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>{habit.streak || 0} day streak</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-emerald-600" />
                        <span>{habit.total_completions || habit.completionsCount || 0} completions</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ClientProgress;