import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Award, Zap, Target, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const GamificationStats = ({ stats, level, totalXP, badges }) => {
  const statsData = [
    {
      icon: Target,
      label: 'Habits Completed',
      value: stats?.totalHabitsCompleted || 145,
      color: 'from-purple-500 to-pink-500',
      iconColor: 'text-purple-600'
    },
    {
      icon: Calendar,
      label: 'Days Active',
      value: stats?.totalDaysActive || 28,
      color: 'from-blue-500 to-cyan-500',
      iconColor: 'text-blue-600'
    },
    {
      icon: Zap,
      label: 'Early Bird',
      value: stats?.earlyBirdCount || 52,
      color: 'from-orange-500 to-yellow-500',
      iconColor: 'text-orange-600'
    },
    {
      icon: Award,
      label: 'Perfect Weeks',
      value: stats?.perfectWeeks || 3,
      color: 'from-green-500 to-emerald-500',
      iconColor: 'text-green-600'
    },
    {
      icon: TrendingUp,
      label: 'Longest Streak',
      value: stats?.longestOverallStreak || 14,
      color: 'from-red-500 to-pink-500',
      iconColor: 'text-red-600'
    },
    {
      icon: Crown,
      label: 'Badges Earned',
      value: badges?.length || 4,
      color: 'from-yellow-500 to-orange-500',
      iconColor: 'text-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <motion.div
                  className={`p-3 rounded-full bg-gradient-to-br ${stat.color}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </motion.div>
                
                <motion.div
                  className="text-3xl font-bold text-slate-800"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                >
                  {stat.value}
                </motion.div>
                
                <div className="text-xs text-slate-600 font-medium">
                  {stat.label}
                </div>
              </div>
              
              {/* Animated progress bar */}
              <motion.div
                className="mt-3 h-1 bg-slate-200 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <motion.div
                  className={`h-full bg-gradient-to-r ${stat.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((stat.value / 200) * 100, 100)}%` }}
                  transition={{ delay: index * 0.1 + 0.4, duration: 0.8 }}
                />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default GamificationStats;
