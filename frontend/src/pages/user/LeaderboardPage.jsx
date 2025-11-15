import '@/index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/lib/config';

const LeaderboardPage = ({ user, onLogout }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const response = await axios.get(`${API}/leaderboard`, config);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Leaderboard load error:', error);
      // Silently handle error - leaderboard will show empty
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-slate-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-orange-500" />;
    return null;
  };

  const getRankClass = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
    if (index === 1) return 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200';
    if (index === 2) return 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200';
    return 'bg-white border-slate-200';
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

  const userRank = leaderboard.findIndex(u => u.id === user.id) + 1;

  return (
    <Layout user={user} onLogout={onLogout} role="user">
      <div className="space-y-6" data-testid="leaderboard-page">
        <div>
          <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>Leaderboard</h1>
          <p className="text-slate-600 mt-1">See how you rank among the community</p>
        </div>

        {/* User's Rank Card */}
        {userRank > 0 && (
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200" data-testid="user-rank-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    #{userRank}
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Your Rank</p>
                    <p className="text-2xl font-bold text-slate-800">{user.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Total XP</p>
                  <p className="text-3xl font-bold text-emerald-700">{user.xp || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* 2nd Place */}
            <div className="order-1" data-testid="rank-2">
              <Card className="card-hover bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-300">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Medal className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{leaderboard[1]?.name}</h3>
                  <p className="text-2xl font-bold text-slate-600 mt-2">{leaderboard[1]?.xp} XP</p>
                  <div className="mt-2 text-3xl font-bold text-slate-500">#2</div>
                </CardContent>
              </Card>
            </div>

            {/* 1st Place */}
            <div className="order-2" data-testid="rank-1">
              <Card className="card-hover bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-400 transform scale-105">
                <CardContent className="pt-6 text-center">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-10 h-10 text-yellow-700" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-800">{leaderboard[0]?.name}</h3>
                  <p className="text-3xl font-bold text-yellow-700 mt-2">{leaderboard[0]?.xp} XP</p>
                  <div className="mt-2 text-4xl font-bold text-yellow-600">#1</div>
                </CardContent>
              </Card>
            </div>

            {/* 3rd Place */}
            <div className="order-3" data-testid="rank-3">
              <Card className="card-hover bg-gradient-to-br from-orange-50 to-red-100 border-2 border-orange-300">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-orange-700" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{leaderboard[2]?.name}</h3>
                  <p className="text-2xl font-bold text-orange-600 mt-2">{leaderboard[2]?.xp} XP</p>
                  <div className="mt-2 text-3xl font-bold text-orange-500">#3</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>All Rankings</CardTitle>
            <CardDescription>Complete leaderboard standings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((leader, index) => (
                <div
                  key={leader.id}
                  className={`p-4 border-2 rounded-lg transition-all ${getRankClass(index)} ${
                    leader.id === user.id ? 'ring-2 ring-emerald-500' : ''
                  }`}
                  data-testid={`leaderboard-entry-${index + 1}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-slate-300 text-slate-700' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {getRankIcon(index) || `#${index + 1}`}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 flex items-center gap-2">
                          {leader.name}
                          {leader.id === user.id && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">You</span>
                          )}
                        </p>
                        <p className="text-sm text-slate-500">Level {leader.level} • {leader.streak} day streak</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-800">{leader.xp}</p>
                      <p className="text-xs text-slate-500">XP</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default LeaderboardPage;