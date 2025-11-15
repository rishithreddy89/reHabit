import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Lock, CheckCircle, Crown, Zap, Sparkles } from 'lucide-react';

const LevelMap = ({ currentLevel = 13, maxLevel = 50 }) => {
  const mapRef = useRef(null);
  const [characterPosition, setCharacterPosition] = useState(currentLevel);
  const [showLevelUpEffect, setShowLevelUpEffect] = useState(false);

  // Auto-scroll to current level
  useEffect(() => {
    if (mapRef.current) {
      const currentLevelElement = mapRef.current.querySelector(`[data-level="${currentLevel}"]`);
      if (currentLevelElement) {
        currentLevelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLevel]);

  // Animate character movement when level changes
  useEffect(() => {
    if (characterPosition < currentLevel) {
      const interval = setInterval(() => {
        setCharacterPosition(prev => {
          if (prev >= currentLevel) {
            clearInterval(interval);
            setShowLevelUpEffect(true);
            setTimeout(() => setShowLevelUpEffect(false), 2000);
            return prev;
          }
          return prev + 1;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [currentLevel]);

  // Generate path points for curved line (like Candy Crush)
  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);
  
  // Create a zigzag pattern
  const getPosition = (level) => {
    const row = Math.floor((level - 1) / 5);
    const col = (level - 1) % 5;
    const isEvenRow = row % 2 === 0;
    
    const x = isEvenRow ? col * 20 : (4 - col) * 20;
    const y = row * 25;
    
    return { x: x + 10, y: y + 10 };
  };

  const getLevelIcon = (level) => {
    if (level % 25 === 0) return '👑';
    if (level % 10 === 0) return '⚡';
    if (level % 5 === 0) return '⭐';
    return '🎯';
  };

  const getLevelColor = (level) => {
    if (level > currentLevel) return 'from-slate-300 to-slate-400';
    if (level === currentLevel) return 'from-purple-500 via-pink-500 to-purple-600';
    if (level % 10 === 0) return 'from-yellow-400 via-orange-400 to-yellow-500';
    return 'from-blue-400 via-cyan-400 to-blue-500';
  };

  const getMilestoneLabel = (level) => {
    if (level === 5) return 'Newbie';
    if (level === 10) return 'Beginner';
    if (level === 25) return 'Intermediate';
    if (level === 50) return 'Expert';
    return null;
  };

  // Generate SVG path for curved connections
  const generateCurvePath = (fromLevel, toLevel) => {
    const from = getPosition(fromLevel);
    const to = getPosition(toLevel);
    
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const controlX = midX + (to.x - from.x) * 0.2;
    const controlY = midY - 5;
    
    return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
  };

  return (
    <div 
      className="relative w-full h-[900px] overflow-auto rounded-xl p-8" 
      ref={mapRef}
      style={{
        background: 'linear-gradient(180deg, #dbeafe 0%, #e0e7ff 25%, #f3e8ff 50%, #fce7f3 75%, #ffe4e6 100%)',
      }}
    >
      {/* Animated background clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${(i * 15) % 100}%`,
              top: `${(i * 100) % 80}%`,
            }}
            animate={{
              x: [0, 30, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="text-6xl opacity-20">☁️</div>
          </motion.div>
        ))}
      </div>

      {/* Floating stars decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${(i * 13) % 100}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400 opacity-40" />
          </motion.div>
        ))}
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {/* Draw curved paths between levels */}
        {levels.slice(0, -1).map((level) => {
          const isCompleted = level < currentLevel;
          return (
            <motion.path
              key={level}
              d={generateCurvePath(level, level + 1)}
              stroke={isCompleted ? '#3b82f6' : '#cbd5e1'}
              strokeWidth="4"
              fill="none"
              strokeDasharray={isCompleted ? '0' : '10,5'}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: level * 0.05 }}
            />
          );
        })}
      </svg>

      {/* Level nodes */}
      <div className="relative" style={{ height: `${Math.ceil(maxLevel / 5) * 25 + 10}%` }}>
        {levels.map((level) => {
          const pos = getPosition(level);
          const isLocked = level > currentLevel;
          const isCurrent = level === currentLevel;
          const isCompleted = level < currentLevel;
          const isMilestone = level % 5 === 0;
          const milestoneLabel = getMilestoneLabel(level);
          const hasCharacter = level === characterPosition;

          return (
            <motion.div
              key={level}
              data-level={level}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isCurrent ? 10 : 5,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: level * 0.02, type: 'spring', stiffness: 200 }}
            >
              {/* Milestone label */}
              {milestoneLabel && (
                <motion.div
                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: level * 0.02 + 0.3 }}
                >
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {milestoneLabel}
                  </div>
                </motion.div>
              )}

              {/* Level node */}
              <motion.div
                className={`
                  relative w-16 h-16 rounded-full flex items-center justify-center
                  bg-gradient-to-br ${getLevelColor(level)}
                  ${isLocked ? 'opacity-50' : ''}
                  ${isCurrent ? 'ring-4 ring-purple-400 ring-offset-4' : ''}
                  shadow-lg transition-all duration-300 hover:scale-110
                `}
                whileHover={!isLocked ? { scale: 1.15, rotate: 5 } : {}}
                animate={isCurrent ? {
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.4)',
                    '0 0 40px rgba(236, 72, 153, 0.6)',
                    '0 0 20px rgba(168, 85, 247, 0.4)',
                  ],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Sparkle effect for milestones */}
                {isMilestone && isCompleted && (
                  <div className="absolute inset-0">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                        }}
                        animate={{
                          x: [0, Math.cos(i * 60 * Math.PI / 180) * 30],
                          y: [0, Math.sin(i * 60 * Math.PI / 180) * 30],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Level icon or lock */}
                <div className="text-2xl z-10">
                  {isLocked ? <Lock className="w-6 h-6 text-white" /> : getLevelIcon(level)}
                </div>

                {/* Level number */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full shadow">
                    {level}
                  </span>
                </div>

                {/* Checkmark for completed */}
                {isCompleted && (
                  <motion.div
                    className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* Animated character (Candy Crush style) */}
              <AnimatePresence>
                {hasCharacter && (
                  <motion.div
                    className="absolute -top-20 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0, y: -50, rotate: -180 }}
                    animate={{ 
                      scale: [1, 1.2, 1], 
                      y: [0, -10, 0],
                      rotate: [0, 10, -10, 0],
                    }}
                    exit={{ scale: 0, y: 50, rotate: 180 }}
                    transition={{ 
                      scale: { duration: 0.5, repeat: Infinity, repeatDelay: 1 },
                      y: { duration: 1, repeat: Infinity },
                      rotate: { duration: 2, repeat: Infinity },
                    }}
                  >
                    <div className="relative">
                      {/* Character emoji */}
                      <div className="text-6xl filter drop-shadow-lg">
                        🚀
                      </div>
                      
                      {/* Particle trail */}
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute left-1/2 top-1/2"
                          animate={{
                            x: [-10, 10, -10][i % 3],
                            y: [20 + i * 5, 30 + i * 5],
                            opacity: [0.6, 0],
                            scale: [1, 0],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        >
                          <Sparkles className="w-3 h-3 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Level-up celebration effect */}
              <AnimatePresence>
                {isCurrent && showLevelUpEffect && (
                  <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 0 }}
                    animate={{ scale: 3, opacity: 0 }}
                    exit={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 1 }}
                  >
                    <div className="w-full h-full rounded-full bg-yellow-400 opacity-50" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Level progress summary */}
      <motion.div
        className="sticky bottom-4 left-1/2 transform -translate-x-1/2 w-max mx-auto mt-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border-2 border-purple-200">
          <div className="flex items-center gap-4 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-slate-700">Level {currentLevel}</span>
            </div>
            <div className="w-px h-6 bg-slate-300" />
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-500" />
              <span className="text-slate-700">{currentLevel}/{maxLevel}</span>
            </div>
            <div className="w-px h-6 bg-slate-300" />
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-slate-700">{((currentLevel / maxLevel) * 100).toFixed(0)}% Complete</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LevelMap;
