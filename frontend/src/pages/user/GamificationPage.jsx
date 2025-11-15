import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trophy, Star, Coins, Target, Map, ShoppingBag } from 'lucide-react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { API } from '@/lib/config';
import { 
  initializeSampleGamificationData, 
  SAMPLE_LEADERBOARD, 
  SAMPLE_HABITS,
  ENHANCED_SHOP_ITEMS 
} from '@/data/sampleGamificationData';

// Gamification components
import XPProgressBar from '@/components/gamification/XPProgressBar';
import LevelMap from '@/components/gamification/LevelMapEnhanced';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import AvatarDisplay from '@/components/gamification/AvatarDisplay';
import StreakCounter from '@/components/gamification/StreakCounter';
import ShopUI from '@/components/gamification/ShopUI';
import ChallengeCard from '@/components/gamification/ChallengeCard';
import LevelUpModal from '@/components/gamification/LevelUpModal';
import LeaderboardUI from '@/components/gamification/LeaderboardUI';
import GamificationStats from '@/components/gamification/GamificationStats';

// Badge definitions (same as backend)
const ALL_BADGES = [
  { badgeId: 'week_warrior', name: 'Week Warrior', description: 'Complete 7-day streak', icon: '🔥', rarity: 'common' },
  { badgeId: 'month_master', name: 'Month Master', description: 'Complete 30-day streak', icon: '👑', rarity: 'rare' },
  { badgeId: 'early_bird', name: 'Early Bird', description: 'Complete 50 habits before 8 AM', icon: '🌅', rarity: 'rare' },
  { badgeId: 'centurion', name: 'Centurion', description: 'Complete 100 habits', icon: '💯', rarity: 'epic' },
  { badgeId: 'ace', name: 'Ace', description: 'Reach Level 10', icon: '🎯', rarity: 'epic' },
  { badgeId: 'conqueror', name: 'Conqueror', description: 'Reach Level 25', icon: '⚔️', rarity: 'legendary' },
  { badgeId: 'legend', name: 'Legend', description: 'Reach Level 50', icon: '👑', rarity: 'legendary' },
  { badgeId: 'rusher', name: 'Rusher', description: 'Complete 10 habits in one day', icon: '⚡', rarity: 'rare' },
  { badgeId: 'mr_consistent', name: 'Mr. Consistent', description: 'Maintain 3 different 7-day streaks simultaneously', icon: '🎖️', rarity: 'epic' },
  { badgeId: 'perfectionist', name: 'Perfectionist', description: 'Complete all daily habits for 7 consecutive days', icon: '✨', rarity: 'legendary' },
  { badgeId: 'dawn_champion', name: 'Dawn Champion', description: 'Complete 100 early morning habits', icon: '🌄', rarity: 'epic' },
  { badgeId: 'unstoppable', name: 'Unstoppable', description: 'Reach a 100-day streak on any habit', icon: '🚀', rarity: 'legendary' }
];

const GamificationPage = ({ user, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [gamificationData, setGamificationData] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);

  useEffect(() => {
    fetchGamificationData();
    fetchChallenges();
  }, []);

  const fetchGamificationData = async () => {
    try {
      // Initialize with sample data for demonstration
      const sampleData = await initializeSampleGamificationData(user?._id);
      
      // Try to fetch real data
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${API}/gamification/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Merge real data with sample data (prioritize real data)
        setGamificationData({
          ...sampleData,
          ...response.data,
          habits: response.data.habits?.length > 0 ? response.data.habits : SAMPLE_HABITS,
        });
      } catch (apiError) {
        // If API fails, use sample data
        console.log('Using sample gamification data');
        setGamificationData({
          ...sampleData,
          habits: SAMPLE_HABITS,
        });
      }
    } catch (error) {
      console.error('Failed to fetch gamification data:', error);
      toast.error('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/gamification/challenges`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChallenges(response.data);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/gamification/challenges/${challengeId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('🎯 Challenge joined successfully!');
      fetchChallenges();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join challenge');
    }
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout} role="user">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500" />
        </div>
      </Layout>
    );
  }

  const topStreakHabits = gamificationData?.habits?.slice(0, 3) || [];
  const avgStreak = topStreakHabits.length > 0
    ? Math.round(topStreakHabits.reduce((sum, h) => sum + h.streak, 0) / topStreakHabits.length)
    : 0;

  return (
    <Layout user={user} onLogout={onLogout} role="user">
      <div className="space-y-6 pb-12">
        {/* Welcome Banner with Sample Data Notice */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">🎉 Welcome to Your Gamification Hub!</h2>
              <p className="text-purple-100">
                You're viewing sample data to showcase all features. Complete habits to earn real rewards!
              </p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              🏆
            </motion.div>
          </div>
        </motion.div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2" style={{fontFamily: 'Space Grotesk'}}>
              🎮 Gamification Hub
            </h1>
            <p className="text-slate-600">Level up your habit game!</p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4">
            <Card className="bg-gradient-to-br from-purple-500 to-pink-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-white">
                  <Star className="w-6 h-6" />
                  <div>
                    <div className="text-2xl font-bold">{gamificationData?.level || 1}</div>
                    <div className="text-xs">Level</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-400 to-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-white">
                  <Coins className="w-6 h-6" />
                  <div>
                    <div className="text-2xl font-bold">{gamificationData?.coins || 0}</div>
                    <div className="text-xs">Coins</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main content tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">
              <Trophy className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="levelmap">
              <Map className="w-4 h-4 mr-2" />
              Level Map
            </TabsTrigger>
            <TabsTrigger value="challenges">
              <Target className="w-4 h-4 mr-2" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="shop">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shop
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Star className="w-4 h-4 mr-2" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* XP Progress */}
              <XPProgressBar
                currentXP={gamificationData?.totalXP || 0}
                level={gamificationData?.level || 1}
              />

              {/* Avatar */}
              <AvatarDisplay
                avatar={gamificationData?.avatar}
                streak={avgStreak}
                level={gamificationData?.level || 1}
              />
            </div>

            {/* Top Streaks */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">🔥 Top Streaks</h2>
              {topStreakHabits.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {topStreakHabits.map((habit) => (
                    <StreakCounter
                      key={habit._id}
                      streak={habit.streak}
                      longestStreak={habit.longestStreak}
                      habitTitle={habit.title}
                      isActive={true}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-slate-500">
                      Start completing habits to build streaks!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Stats Overview */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">📊 Your Stats</h2>
              <GamificationStats
                stats={gamificationData?.stats}
                level={gamificationData?.level}
                totalXP={gamificationData?.totalXP}
                badges={gamificationData?.badges}
              />
            </div>
          </TabsContent>

          {/* Level Map Tab */}
          <TabsContent value="levelmap" className="mt-6">
            <LevelMap currentLevel={gamificationData?.level || 1} maxLevel={50} />
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">🎯 Active Challenges</h2>
                <div className="text-sm text-slate-600">
                  {challenges.filter(c => c.joined).length} / {challenges.length} Joined
                </div>
              </div>

              {challenges.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {challenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge._id}
                      challenge={challenge}
                      onJoin={handleJoinChallenge}
                      userProgress={challenge.userProgress}
                      userCompleted={challenge.userCompleted}
                      joined={challenge.joined}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Target className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      No challenges available
                    </h3>
                    <p className="text-slate-500">
                      Check back later for new challenges!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Shop Tab */}
          <TabsContent value="shop" className="mt-6">
            <ShopUI user={user} />
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="mt-6">
            <BadgeDisplay
              badges={gamificationData?.badges || []}
              allBadges={ALL_BADGES}
            />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-6">
            <LeaderboardUI currentUserId={user?._id} />
          </TabsContent>
        </Tabs>

        {/* Level Up Modal */}
        {showLevelUpModal && levelUpData && (
          <LevelUpModal
            isOpen={showLevelUpModal}
            onClose={() => setShowLevelUpModal(false)}
            newLevel={levelUpData.newLevel}
            oldLevel={levelUpData.oldLevel}
            rewards={levelUpData.rewards}
          />
        )}
      </div>
    </Layout>
  );
};

export default GamificationPage;
