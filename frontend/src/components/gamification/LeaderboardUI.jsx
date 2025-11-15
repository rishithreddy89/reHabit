import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { API } from '@/lib/config';
import { SAMPLE_LEADERBOARD } from '@/data/sampleGamificationData';

const LeaderboardUI = ({ currentUserId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('level'); // level, xp, coins

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${API}/gamification/leaderboard?sortBy=${sortBy}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.length > 0) {
          setLeaderboard(response.data);
        } else {
          // Use sample data if no real data
          const sortedData = [...SAMPLE_LEADERBOARD].sort((a, b) => {
            if (sortBy === 'level') return b.level - a.level;
            if (sortBy === 'xp') return b.totalXP - a.totalXP;
            if (sortBy === 'coins') return b.coins - a.coins;
            return 0;
          });
          setLeaderboard(sortedData.map((entry, idx) => ({
            ...entry,
            userId: entry.userId === 'current' ? currentUserId : entry.userId
          })));
        }
      } catch (apiError) {
        // Use sample data on API error
        console.log('Using sample leaderboard data');
        const sortedData = [...SAMPLE_LEADERBOARD].sort((a, b) => {
          if (sortBy === 'level') return b.level - a.level;
          if (sortBy === 'xp') return b.totalXP - a.totalXP;
          if (sortBy === 'coins') return b.coins - a.coins;
          return 0;
        });
        setLeaderboard(sortedData.map((entry) => ({
          ...entry,
          userId: entry.userId === 'current' ? currentUserId : entry.userId
        })));
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />;
      default:
        return <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">{rank}</div>;
    }
  };

  const getRankGradient = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 via-yellow-500 to-orange-500';
      case 2:
        return 'from-slate-300 via-slate-400 to-slate-500';
      case 3:
        return 'from-orange-300 via-orange-400 to-orange-500';
      default:
        return 'from-slate-100 to-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2" style={{fontFamily: 'Space Grotesk'}}>
          🏆 Global Leaderboard
        </h2>
        <p className="text-slate-600">Compete with users worldwide</p>
      </div>

      {/* Sort Tabs */}
      <Tabs value={sortBy} onValueChange={setSortBy} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="level">
            <Star className="w-4 h-4 mr-2" />
            Level
          </TabsTrigger>
          <TabsTrigger value="xp">
            <TrendingUp className="w-4 h-4 mr-2" />
            XP
          </TabsTrigger>
          <TabsTrigger value="coins">
            <Trophy className="w-4 h-4 mr-2" />
            Coins
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.length > 0 ? (
          leaderboard.map((entry, index) => {
            const isCurrentUser = entry.userId === currentUserId;
            const rank = index + 1;

            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`
                    relative overflow-hidden transition-all duration-300 hover:shadow-lg
                    ${rank <= 3 ? 'border-2' : ''}
                    ${rank === 1 ? 'border-yellow-400' : ''}
                    ${rank === 2 ? 'border-slate-400' : ''}
                    ${rank === 3 ? 'border-orange-400' : ''}
                    ${isCurrentUser ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
                  `}
                >
                  {/* Background gradient for top 3 */}
                  {rank <= 3 && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${getRankGradient(rank)} opacity-10`} />
                  )}

                  <CardContent className="p-4 relative">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex-shrink-0">
                        {getRankIcon(rank)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-12 h-12 ring-2 ring-white">
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold">
                          {entry.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 truncate">
                            {entry.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-500">
                          {entry.badgeCount} badges earned
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-col items-end gap-1">
                        {sortBy === 'level' && (
                          <>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-purple-500" />
                              <span className="font-bold text-lg text-slate-800">
                                Level {entry.level}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">{entry.totalXP} XP</span>
                          </>
                        )}

                        {sortBy === 'xp' && (
                          <>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-blue-500" />
                              <span className="font-bold text-lg text-slate-800">
                                {entry.totalXP.toLocaleString()} XP
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">Level {entry.level}</span>
                          </>
                        )}

                        {sortBy === 'coins' && (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="text-xl">🪙</span>
                              <span className="font-bold text-lg text-slate-800">
                                {entry.coins.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">Level {entry.level}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Particles for top 3 */}
                    {rank <= 3 && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                            style={{
                              left: `${10 + i * 15}%`,
                              top: `${20 + (i % 2) * 40}%`,
                            }}
                            animate={{
                              y: [-5, 5, -5],
                              opacity: [0.3, 0.7, 0.3],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                No data available
              </h3>
              <p className="text-slate-500">
                Be the first to appear on the leaderboard!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeaderboardUI;
