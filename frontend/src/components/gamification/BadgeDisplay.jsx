import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BadgeUnlockNotification from './BadgeUnlockNotification';

const rarityColors = {
  common: 'from-slate-400 to-slate-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

const rarityGlow = {
  common: 'shadow-slate-400/50',
  rare: 'shadow-blue-400/50',
  epic: 'shadow-purple-400/50',
  legendary: 'shadow-yellow-400/50'
};

const BadgeDisplay = ({ badges = [], allBadges = [] }) => {
  const earnedBadgeIds = badges.map(b => b.badgeId);
  const [selectedBadge, setSelectedBadge] = useState(null);

  return (
    <>
      <AnimatePresence>
        {selectedBadge && (
          <BadgeUnlockNotification
            badge={selectedBadge}
            onClose={() => setSelectedBadge(null)}
          />
        )}
      </AnimatePresence>
      
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Achievements & Badges
        </CardTitle>
        <p className="text-sm text-slate-600">
          {badges.length} / {allBadges.length} Unlocked
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allBadges.map((badge, index) => {
            const isEarned = earnedBadgeIds.includes(badge.badgeId);
            const earnedBadge = badges.find(b => b.badgeId === badge.badgeId);

            return (
              <motion.div
                key={badge.badgeId}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: isEarned ? 1.1 : 1 }}
                className="relative cursor-pointer"
                onClick={() => isEarned && setSelectedBadge(badge)}
              >
                <div
                  className={`relative p-4 rounded-xl border-2 ${
                    isEarned
                      ? `bg-gradient-to-br ${rarityColors[badge.rarity]} border-white shadow-lg ${rarityGlow[badge.rarity]}`
                      : 'bg-slate-100 border-slate-300'
                  } transition-all duration-300`}
                >
                  {/* Rarity badge */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={isEarned ? 'default' : 'outline'}
                      className={`text-xs ${
                        isEarned ? 'bg-white/30 text-white' : 'text-slate-500'
                      }`}
                    >
                      {badge.rarity}
                    </Badge>
                  </div>

                  {/* Badge icon */}
                  <div className="flex flex-col items-center justify-center mb-2">
                    <div className={`text-4xl mb-2 ${!isEarned && 'grayscale opacity-30'}`}>
                      {isEarned ? badge.icon : <Lock className="w-8 h-8 text-slate-400" />}
                    </div>
                    
                    <h4 className={`text-sm font-bold text-center ${
                      isEarned ? 'text-white' : 'text-slate-500'
                    }`}>
                      {badge.name}
                    </h4>
                    
                    <p className={`text-xs text-center mt-1 ${
                      isEarned ? 'text-white/80' : 'text-slate-400'
                    }`}>
                      {badge.description}
                    </p>
                  </div>

                  {/* Earned date */}
                  {isEarned && earnedBadge && (
                    <div className="text-xs text-white/70 text-center mt-2">
                      {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                    </div>
                  )}

                  {/* Sparkle animation for legendary badges */}
                  {isEarned && badge.rarity === 'legendary' && (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{
                            top: '50%',
                            left: '50%',
                          }}
                          animate={{
                            x: [0, Math.cos(i * 60 * Math.PI / 180) * 30],
                            y: [0, Math.sin(i * 60 * Math.PI / 180) * 30],
                            opacity: [1, 0],
                            scale: [0, 1],
                          }}
                          transition={{
                            duration: 1,
                            delay: i * 0.1,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                        >
                          <Sparkles className="w-3 h-3 text-yellow-300" />
                        </motion.div>
                      ))}
                    </>
                  )}

                  {/* New badge indicator */}
                  {isEarned && earnedBadge && 
                   new Date(earnedBadge.earnedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                    <motion.div
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      NEW!
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default BadgeDisplay;
