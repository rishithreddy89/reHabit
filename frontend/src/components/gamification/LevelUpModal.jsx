import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X, Star, TrendingUp, Gift, Zap } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const LevelUpModal = ({ isOpen, onClose, newLevel, oldLevel, rewards = {} }) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }));
        confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 border-0 p-0 overflow-hidden">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative p-12 text-center"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Animated stars background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-300"
                initial={{ 
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  scale: 0,
                  opacity: 0
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3
                }}
              >
                <Star className="w-4 h-4" fill="currentColor" />
              </motion.div>
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="inline-block mb-6"
            >
              <div className="text-8xl">🎉</div>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold text-white mb-4"
            >
              LEVEL UP!
            </motion.h2>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-full px-8 py-4 mb-6"
            >
              <div className="text-white/80 text-2xl font-semibold">
                Level {oldLevel}
              </div>
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <TrendingUp className="w-8 h-8 text-white" />
              </motion.div>
              <div className="text-white text-4xl font-bold">
                Level {newLevel}
              </div>
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white text-xl mb-8"
            >
              You're getting stronger! Keep up the amazing work! 💪
            </motion.p>

            {/* Rewards */}
            {(rewards.coins > 0 || rewards.xp > 0) && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center gap-6 mb-8"
              >
                {rewards.coins > 0 && (
                  <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-6 py-3">
                    <Gift className="w-6 h-6 text-yellow-300" />
                    <span className="text-white text-lg font-bold">
                      +{rewards.coins} Coins
                    </span>
                  </div>
                )}
                {rewards.xp > 0 && (
                  <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-6 py-3">
                    <Zap className="w-6 h-6 text-yellow-300" />
                    <span className="text-white text-lg font-bold">
                      +{rewards.xp} Bonus XP
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button
                onClick={onClose}
                size="lg"
                className="bg-white text-purple-600 hover:bg-white/90 font-bold text-lg px-12 py-6 rounded-full shadow-2xl"
              >
                Awesome! Continue
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpModal;
