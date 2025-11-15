import React from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const StreakCounter = ({ streak, longestStreak, habitTitle, isActive = true }) => {
  const getStreakColor = () => {
    // Light pastel gradients replacing darker originals
    if (streak >= 30) return 'from-fuchsia-200 via-pink-100 to-pink-200';
    if (streak >= 14) return 'from-orange-200 via-amber-100 to-red-200';
    if (streak >= 7) return 'from-yellow-100 via-yellow-50 to-amber-100';
    return 'from-sky-100 via-blue-50 to-cyan-100';
  };

  const getStreakEmoji = () => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '🚀';
    if (streak >= 7) return '⚡';
    return '✨';
  };

  return (
    <Card className="overflow-hidden border border-slate-200 shadow-md bg-white/60 backdrop-blur-sm">
      <CardContent className={`p-6 bg-gradient-to-br ${getStreakColor()} rounded-xl relative`}> 
        {/* subtle overlay for extra softness */}
        <div className="absolute inset-0 bg-white/40 pointer-events-none rounded-xl mix-blend-soft-light" />
        <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="text-3xl"
              >
                {getStreakEmoji()}
              </motion.div>
              <h3 className="text-slate-800 font-bold text-xl">
                {streak} Day Streak
              </h3>
            </div>
            <p className="text-slate-600 text-sm mb-3">{habitTitle}</p>
            
            <div className="flex items-center gap-4">
              {isActive && streak > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1"
                >
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700 text-xs font-semibold">
                    Keep it going!
                  </span>
                </motion.div>
              )}
              
              {longestStreak > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500 text-xs">
                    Best: {longestStreak}
                  </span>
                </div>
              )}
            </div>
          </div>

          <motion.div
            className="text-6xl font-bold text-slate-400/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {streak}
          </motion.div>
        </div>
        {/* First separator line */}
        <div className="mt-4 mb-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Streak milestones */}
        {/* Second separator line above milestones */}
        <div className="mt-6 mb-3 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="flex gap-2">
          {[7, 14, 30, 60, 100].map((milestone) => (
            <Badge
              key={milestone}
              variant={streak >= milestone ? 'default' : 'outline'}
              className={`text-xs ${
                streak >= milestone 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'bg-white/50 text-slate-500 border-slate-200'
              }`}
            >
              {milestone}
            </Badge>
          ))}
        </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCounter;
