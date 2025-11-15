import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Lock, CheckCircle, Crown, Zap } from 'lucide-react';

const LevelMap = ({ currentLevel, maxLevel = 50 }) => {
  const mapRef = useRef(null);

  // Auto-scroll to current level
  useEffect(() => {
    if (mapRef.current) {
      const currentLevelElement = mapRef.current.querySelector(`[data-level="${currentLevel}"]`);
      if (currentLevelElement) {
        currentLevelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
    if (level === currentLevel) return 'from-purple-500 to-pink-500';
    if (level % 10 === 0) return 'from-yellow-400 to-orange-500';
    return 'from-blue-400 to-cyan-500';
  };

  return (
    <div className="relative w-full h-[800px] overflow-auto bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 rounded-xl p-8" ref={mapRef}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
          </motion.div>
        ))}
      </div>

      {/* SVG Path connecting levels */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '2000px' }}>
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        {levels.slice(0, -1).map((level, index) => {
          const start = getPosition(level);
          const end = getPosition(level + 1);
          
          // Create curved path
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          const controlX = start.x + (end.x - start.x) / 2;
          const controlY = midY - 5;

          return (
            <motion.path
              key={level}
              d={`M ${start.x}% ${start.y}% Q ${controlX}% ${controlY}% ${end.x}% ${end.y}%`}
              fill="none"
              stroke={level < currentLevel ? 'url(#pathGradient)' : '#cbd5e1'}
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            />
          );
        })}
      </svg>

      {/* Level nodes */}
      <div className="relative" style={{ minHeight: '2000px' }}>
        {levels.map((level) => {
          const pos = getPosition(level);
          const isCompleted = level < currentLevel;
          const isCurrent = level === currentLevel;
          const isLocked = level > currentLevel;
          const isMilestone = level % 5 === 0;

          return (
            <motion.div
              key={level}
              data-level={level}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                delay: level * 0.02,
              }}
            >
              <motion.div
                whileHover={!isLocked ? { scale: 1.1 } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
                animate={
                  isCurrent
                    ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0],
                      }
                    : {}
                }
                transition={
                  isCurrent
                    ? {
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }
                    : {}
                }
                className="relative"
              >
                {/* Glow effect for current level */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-xl"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                )}

                {/* Level circle */}
                <div
                  className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${getLevelColor(
                    level
                  )} flex flex-col items-center justify-center shadow-xl border-4 border-white ${
                    isLocked ? 'opacity-50' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className="text-3xl mb-1">
                    {isLocked ? (
                      <Lock className="w-6 h-6 text-white" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      getLevelIcon(level)
                    )}
                  </div>

                  {/* Level number */}
                  <div className="text-white font-bold text-sm">{level}</div>

                  {/* Milestone crown */}
                  {isMilestone && !isLocked && (
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  )}

                  {/* Current level indicator */}
                  {isCurrent && (
                    <motion.div
                      className="absolute -bottom-2 text-xs bg-white text-purple-600 px-2 py-1 rounded-full font-bold shadow-lg"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      YOU
                    </motion.div>
                  )}

                  {/* Sparkles for completed milestones */}
                  {isCompleted && isMilestone && (
                    <>
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-yellow-400"
                          style={{
                            top: '50%',
                            left: '50%',
                          }}
                          animate={{
                            x: [0, (i % 2 ? 20 : -20)],
                            y: [0, (i < 2 ? -20 : 20)],
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
                          <Zap className="w-4 h-4" fill="currentColor" />
                        </motion.div>
                      ))}
                    </>
                  )}
                </div>

                {/* Level label for milestones */}
                {isMilestone && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-full shadow">
                      {level === 10 && 'Beginner'}
                      {level === 25 && 'Intermediate'}
                      {level === 50 && 'Expert'}
                      {level === 5 && 'Newbie'}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelMap;
