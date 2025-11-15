import React from 'react';
import { motion } from 'framer-motion';
import { Smile, Frown, Meh, Heart, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const moodConfig = {
  happy: { emoji: '😊', color: 'from-yellow-400 to-orange-400', icon: Smile },
  excited: { emoji: '🤩', color: 'from-pink-400 to-purple-400', icon: Heart },
  motivated: { emoji: '💪', color: 'from-blue-400 to-cyan-400', icon: Zap },
  tired: { emoji: '😴', color: 'from-slate-400 to-slate-500', icon: Meh },
  sad: { emoji: '😢', color: 'from-blue-600 to-slate-600', icon: Frown }
};

const evolutionStages = {
  1: { size: 'w-24 h-24', name: 'Sprout', emoji: '🌱' },
  2: { size: 'w-32 h-32', name: 'Seedling', emoji: '🌿' },
  3: { size: 'w-40 h-40', name: 'Plant', emoji: '🪴' },
  4: { size: 'w-48 h-48', name: 'Tree', emoji: '🌳' },
  5: { size: 'w-56 h-56', name: 'Ancient Tree', emoji: '🌲' }
};

const AvatarDisplay = ({ 
  avatar = { mood: 'happy', evolution: 1 },
  streak = 0,
  level = 1,
  animated = true
}) => {
  const mood = moodConfig[avatar.mood] || moodConfig.happy;
  const evolution = evolutionStages[avatar.evolution] || evolutionStages[1];

  return (
    <Card className="overflow-hidden">
      <CardContent className={`relative px-8 pt-14 pb-8 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100`}>
        {/* Bubble background (light small blue bubbles) */}
        {animated && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(16)].map((_, i) => {
              const size = 20 + Math.random() * 30; // smaller bubbles
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-gradient-to-br from-green-200 via-emerald-200 to-lime-200 opacity-30"
                  style={{
                    width: size,
                    height: size,
                    left: `${Math.random() * 100}%`,
                    bottom: `${Math.random() * 100}%`,
                    filter: 'blur(3px)'
                  }}
                  animate={{
                    y: [0, -40 - Math.random() * 20, 0],
                    opacity: [0.25, 0.5, 0.25],
                    scale: [1, 1.07, 1]
                  }}
                  transition={{
                    duration: 5 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: 'easeInOut'
                  }}
                />
              );
            })}
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center">
          {/* Avatar container */}
          <motion.div
            animate={animated ? { 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="relative mb-4"
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 ${evolution.size} bg-white/50 rounded-full blur-xl`} />
            
            {/* Main avatar */}
            <div className={`relative ${evolution.size} flex items-center justify-center bg-white rounded-full shadow-2xl`}>
              <div className="text-6xl">{evolution.emoji}</div>
              
              {/* Mood indicator */}
              <motion.div
                className="absolute -top-2 -right-2 text-3xl"
                animate={animated ? { 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                {mood.emoji}
              </motion.div>
            </div>

            {/* Accessories (sparkles for high streaks) */}
            {streak >= 30 && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-yellow-400"
                    style={{
                      top: '50%',
                      left: '50%',
                    }}
                    animate={{
                      x: [0, Math.cos(i * 60 * Math.PI / 180) * 40],
                      y: [0, Math.sin(i * 60 * Math.PI / 180) * 40],
                      opacity: [1, 0],
                      scale: [0, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>

          {/* Evolution stage */}
          <h3 className="text-emerald-700 text-2xl font-bold mb-2 drop-shadow">
            {evolution.name}
          </h3>
          
          {/* Mood and stats */}
          <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-full px-4 py-2 mb-2 border border-emerald-200">
            <mood.icon className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 text-sm font-semibold capitalize">
              {avatar.mood}
            </span>
          </div>

          {/* Level and Evolution progress */}
          <div className="flex gap-2 mt-4">
            <div className="bg-white/40 backdrop-blur-sm rounded-full px-3 py-1 border border-emerald-200">
              <span className="text-emerald-700 text-xs font-semibold">
                Level {level}
              </span>
            </div>
            <div className="bg-white/40 backdrop-blur-sm rounded-full px-3 py-1 border border-emerald-200">
              <span className="text-emerald-700 text-xs font-semibold">
                Stage {avatar.evolution}/5
              </span>
            </div>
          </div>

          {/* Evolution milestones */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4, 5].map((stage) => (
              <div
                key={stage}
                className={`w-3 h-3 rounded-full shadow ${
                  avatar.evolution >= stage
                    ? 'bg-gradient-to-br from-sky-200 via-cyan-200 to-blue-200'
                    : 'bg-blue-100'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarDisplay;
