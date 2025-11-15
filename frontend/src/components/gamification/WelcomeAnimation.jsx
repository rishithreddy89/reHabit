import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Star, Zap, Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const WelcomeAnimation = ({ onClose }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Auto-advance steps
    const timer1 = setTimeout(() => setStep(1), 1000);
    const timer2 = setTimeout(() => setStep(2), 2500);
    const timer3 = setTimeout(() => setStep(3), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const features = [
    {
      icon: Trophy,
      title: 'Level Up System',
      description: '50 levels to conquer with XP rewards',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Star,
      title: '12 Unique Badges',
      description: 'Unlock achievements like Ace, Conqueror, Legend',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Streak System',
      description: 'Build daily habits with fire streaks',
      color: 'from-red-400 to-orange-500'
    },
    {
      icon: Crown,
      title: 'Shop & Rewards',
      description: 'Spend coins on themes, skins, and effects',
      color: 'from-blue-400 to-cyan-500'
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${(i * 7) % 100}%`,
                top: `${(i * 11) % 100}%`,
              }}
              animate={{
                y: [-30, 30, -30],
                x: [-20, 20, -20],
                rotate: [0, 360],
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5 + (i % 3),
                repeat: Infinity,
                delay: i * 0.1,
              }}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
            </motion.div>
          ))}
        </div>

        <Card className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600 border-4 border-white shadow-2xl overflow-hidden">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="p-8 md:p-12">
            {/* Title Animation */}
            <motion.div
              className="text-center mb-8"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              <motion.div
                className="inline-block mb-4"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="w-20 h-20 text-yellow-300" />
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Welcome to Gamification!
              </h1>
              <p className="text-purple-100 text-lg">
                Your journey to habit mastery starts here
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <AnimatePresence key={index}>
                  {step >= index && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color}`}>
                            <feature.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white mb-1">
                              {feature.title}
                            </h3>
                            <p className="text-sm text-purple-100">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </div>

            {/* Sample Data Notice */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6 border-2 border-white/30"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                    <h3 className="font-bold text-white text-lg">
                      Sample Data Loaded!
                    </h3>
                  </div>
                  <ul className="space-y-2 text-purple-100">
                    <li>✨ You're at <strong>Level 13</strong> with 1,250 XP</li>
                    <li>🏆 <strong>4 badges unlocked</strong> (including 1 NEW!)</li>
                    <li>🪙 <strong>250 coins</strong> to spend in the shop</li>
                    <li>🔥 <strong>3 active streaks</strong> displayed</li>
                    <li>📊 <strong>Leaderboard</strong> with 10 players</li>
                    <li>🛒 <strong>23 shop items</strong> available</li>
                  </ul>
                  <p className="text-sm text-yellow-200 mt-3 font-semibold">
                    💡 Complete real habits to earn your own rewards!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA Button */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="text-center"
                >
                  <Button
                    onClick={onClose}
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-purple-50 font-bold text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all"
                  >
                    🚀 Let's Go!
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Skip button */}
            {step < 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-4"
              >
                <button
                  onClick={() => setStep(3)}
                  className="text-white/70 hover:text-white text-sm underline"
                >
                  Skip animation
                </button>
              </motion.div>
            )}
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300"></div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeAnimation;
