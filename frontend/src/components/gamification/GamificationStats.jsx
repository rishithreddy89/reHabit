import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Award, Zap, Target, Crown } from 'lucide-react';

const GamificationStats = ({ stats, badges }) => {
  // Use ?? 0 (nullish coalescing) so real 0 values are preserved — not overridden by hardcoded fallbacks
  const statsData = [
    {
      icon: Target,
      label: 'Habits Completed',
      value: stats?.totalHabitsCompleted ?? 0,
      max: 200,
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      unit: '',
    },
    {
      icon: Calendar,
      label: 'Days Active',
      value: stats?.totalDaysActive ?? 0,
      max: 365,
      gradient: 'from-blue-500 to-cyan-400',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      unit: '',
    },
    {
      icon: Zap,
      label: 'Early Bird',
      value: stats?.earlyBirdCount ?? 0,
      max: 100,
      gradient: 'from-orange-400 to-yellow-400',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      unit: '',
    },
    {
      icon: Award,
      label: 'Perfect Weeks',
      value: stats?.perfectWeeks ?? 0,
      max: 52,
      gradient: 'from-emerald-500 to-teal-400',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      unit: '',
    },
    {
      icon: TrendingUp,
      label: 'Longest Streak',
      value: stats?.longestOverallStreak ?? 0,
      max: 100,
      gradient: 'from-red-500 to-rose-400',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      unit: 'd',
    },
    {
      icon: Crown,
      label: 'Badges Earned',
      value: badges?.length ?? 0,
      max: 12,
      gradient: 'from-yellow-400 to-amber-400',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      unit: '',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {statsData.map((stat, index) => {
        const pct = stat.max > 0 ? Math.min((stat.value / stat.max) * 100, 100) : 0;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            <div className="p-4 flex flex-col items-center text-center gap-2">
              {/* Icon */}
              <motion.div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.iconBg}`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </motion.div>

              {/* Value */}
              <motion.div
                className="text-3xl font-extrabold text-slate-800 leading-none"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.07 + 0.15, type: 'spring' }}
              >
                {stat.value}{stat.unit}
              </motion.div>

              {/* Label */}
              <p className="text-xs font-medium text-slate-500 leading-tight">{stat.label}</p>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100">
              <motion.div
                className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: index * 0.07 + 0.3, duration: 0.9, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default GamificationStats;

