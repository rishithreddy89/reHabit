import React from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const StreakCounter = ({ streak, longestStreak, habitTitle, isActive = true }) => {
  const getStreakColor = () => {
    if (streak >= 30) return 'from-purple-500 to-pink-500';
    if (streak >= 14) return 'from-orange-500 to-red-500';
    if (streak >= 7) return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-cyan-500';
  };

  const getStreakEmoji = () => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '🚀';
    if (streak >= 7) return '⚡';
    return '✨';
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className={`p-6 bg-gradient-to-br ${getStreakColor()}`}>
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
              <h3 className="text-white font-bold text-xl">
                {streak} Day Streak
              </h3>
            </div>
            <p className="text-white/90 text-sm mb-3">{habitTitle}</p>
            
            <div className="flex items-center gap-4">
              {isActive && streak > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1"
                >
                  <Flame className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-semibold">
                    Keep it going!
                  </span>
                </motion.div>
              )}
              
              {longestStreak > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-white/80" />
                  <span className="text-white/80 text-xs">
                    Best: {longestStreak}
                  </span>
                </div>
              )}
            </div>
          </div>

          <motion.div
            className="text-6xl font-bold text-white/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {streak}
          </motion.div>
        </div>

        {/* Streak milestones */}
        <div className="mt-4 flex gap-2">
          {[7, 14, 30, 60, 100].map((milestone) => (
            <Badge
              key={milestone}
              variant={streak >= milestone ? 'default' : 'outline'}
              className={`text-xs ${
                streak >= milestone 
                  ? 'bg-white text-slate-900' 
                  : 'bg-white/20 text-white border-white/40'
              }`}
            >
              {milestone}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCounter;
