import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const XPProgressBar = ({ 
  currentXP, 
  level, 
  onLevelUp 
}) => {
  const [displayXP, setDisplayXP] = useState(currentXP);
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const progressPercent = (xpInCurrentLevel / 100) * 100;

  useEffect(() => {
    // Animate XP changes
    if (displayXP !== currentXP) {
      const diff = currentXP - displayXP;
      const increment = diff > 0 ? Math.ceil(diff / 20) : Math.floor(diff / 20);
      
      const timer = setInterval(() => {
        setDisplayXP(prev => {
          const next = prev + increment;
          if ((increment > 0 && next >= currentXP) || (increment < 0 && next <= currentXP)) {
            clearInterval(timer);
            return currentXP;
          }
          return next;
        });
      }, 50);

      return () => clearInterval(timer);
    }
  }, [currentXP, displayXP]);

  return (
    <Card className="overflow-hidden border-2 border-purple-200 shadow-lg">
      <CardContent className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
            >
              <Star className="w-6 h-6 text-white fill-white" />
            </motion.div>
            
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Level {level}
              </h3>
              <p className="text-sm text-slate-600">
                {xpInCurrentLevel}/{100} XP
              </p>
            </div>
          </div>

          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-right"
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {displayXP.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Total XP
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="absolute -top-2 left-0 right-0 flex justify-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </motion.div>
          </div>
          
          <Progress 
            value={progressPercent} 
            className="h-4 bg-slate-200"
          />
          
          <motion.div
            className="absolute inset-0 h-4 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400" 
                 style={{ width: `${progressPercent}%` }} 
            />
          </motion.div>
        </div>

        {/* XP to next level */}
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Level {level}
          </span>
          <span className="text-xs font-semibold text-purple-600">
            {100 - xpInCurrentLevel} XP to Level {level + 1}
          </span>
          <span className="text-xs text-slate-500">
            Level {level + 1}
          </span>
        </div>

        {/* Level milestones */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {[5, 10, 25, 50, 100].map((milestone) => (
            <motion.div
              key={milestone}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                level >= milestone
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {level >= milestone ? '✓ ' : ''}Lvl {milestone}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default XPProgressBar;
