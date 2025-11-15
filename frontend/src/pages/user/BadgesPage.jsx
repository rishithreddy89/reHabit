import '@/index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/lib/config';

const BadgesPage = ({ user, onLogout }) => {
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState(user.badges || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await axios.get(`${API}/badges`);
      setBadges(response.data);
    } catch (error) {
      toast.error('Failed to load badges');
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
      <div className="space-y-6" data-testid="badges-page">
        <div>
          <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>Badges & Rewards</h1>
          <p className="text-slate-600 mt-1">Unlock achievements as you build habits</p>
        </div>

        {/* Stats Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Badges Earned</p>
                <p className="text-4xl font-bold text-slate-800">{userBadges.length} / {badges.length}</p>
              </div>
              <Award className="w-16 h-16 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* Badges Grid */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4" style={{fontFamily: 'Space Grotesk'}}>All Badges</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => {
              const isUnlocked = userBadges.includes(badge.id);
              const canUnlock = (user.xp || 0) >= badge.xp_required;
              
              return (
                <Card
                  key={badge.id}
                  className={`card-hover ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300'
                      : canUnlock
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                  data-testid={`badge-${badge.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                        isUnlocked ? 'bg-emerald-200' : 'bg-slate-200'
                      }`}>
                        {isUnlocked ? badge.icon : <Lock className="w-8 h-8 text-slate-400" />}
                      </div>
                      {isUnlocked && (
                        <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">Unlocked</span>
                      )}
                      {!isUnlocked && canUnlock && (
                        <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">Ready!</span>
                      )}
                    </div>
                    <CardTitle className={isUnlocked ? 'text-slate-800' : 'text-slate-400'}>
                      {badge.name}
                    </CardTitle>
                    <CardDescription className={isUnlocked ? 'text-slate-600' : 'text-slate-400'}>
                      {badge.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Required XP</span>
                      <span className={`font-bold ${
                        isUnlocked ? 'text-emerald-600' :
                        canUnlock ? 'text-yellow-600' :
                        'text-slate-400'
                      }`}>
                        {badge.xp_required}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BadgesPage;