import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Lock, CheckCircle, Trophy, Sparkles, Play, RotateCcw, Crown, Zap } from 'lucide-react';
import LevelDetailModal from './LevelDetailModal';

const LevelMap = ({ 
  currentLevel = 1, 
  maxLevel = 50, 
  levels = [],
  onLevelClick,
  worldTheme = 'forest'
}) => {
  const mapRef = useRef(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showLevelModal, setShowLevelModal] = useState(false);

  // Theme configurations matching the beautiful game UI
  const themes = {
    forest: {
      background: 'linear-gradient(180deg, #87CEEB 0%, #98D8C8 20%, #6BCB77 50%, #4D9F62 80%, #2D6A4F 100%)',
      pathColor: '#FFE5B4',
      decorations: ['🌲', '🌳', '🌴', '🍃', '🌿', '🦋', '🌺'],
      waterColor: '#4A90E2'
    },
    ocean: {
      background: 'linear-gradient(180deg, #E0F7FA 0%, #80DEEA 30%, #26C6DA 60%, #0097A7 100%)',
      pathColor: '#FFE082',
      decorations: ['🌊', '🐚', '🐠', '🐟', '🦀', '⛵', '🏝️'],
      waterColor: '#00BCD4'
    },
    // ...existing theme code...
  };

  const currentTheme = themes[worldTheme] || themes.forest;

  useEffect(() => {
    if (mapRef.current && currentLevel) {
      setTimeout(() => {
        const element = mapRef.current.querySelector(`[data-level="${currentLevel}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [currentLevel]);

  // Generate path coordinates (winding river-like path)
  const getPosition = (level) => {
    const row = Math.floor((level - 1) / 3);
    const col = (level - 1) % 3;
    
    // Create winding path
    const xOffset = col === 1 ? 50 : (col === 0 ? 20 : 80);
    const yPos = row * 180 + 100;
    
    // Add wave effect
    const wave = Math.sin(row * 0.5) * 15;
    
    return { x: xOffset + wave, y: yPos };
  };

  const getLevelData = (levelNum) => {
    const found = levels.find(l => l.levelNumber === levelNum);
    if (found) return found;
    
    return {
      levelNumber: levelNum,
      status: levelNum === 1 ? 'unlocked' : levelNum <= currentLevel ? 'completed' : 'locked',
      stars: levelNum < currentLevel ? Math.floor(Math.random() * 3) + 1 : 0,
      questId: null
    };
  };

  const handleLevelClick = (levelData) => {
    if (levelData.status !== 'locked') {
      setSelectedLevel(levelData);
      setShowLevelModal(true);
      if (onLevelClick) onLevelClick(levelData);
    }
  };

  const getLevelColor = (level, status) => {
    if (status === 'locked') return 'from-gray-400 to-gray-500';
    if (level === currentLevel) return 'from-purple-500 via-pink-500 to-orange-500';
    if (status === 'completed') {
      if (level % 10 === 0) return 'from-yellow-400 via-amber-400 to-orange-500';
      return 'from-emerald-400 via-teal-400 to-cyan-500';
    }
    return 'from-blue-400 via-indigo-400 to-purple-500';
  };

  const getMilestoneIcon = (level) => {
    if (level % 10 === 0) return <Crown className="w-8 h-8" />;
    if (level % 5 === 0) return <Zap className="w-6 h-6" />;
    return <Trophy className="w-5 h-5" />;
  };

  return (
    <>
      <div 
        className="relative w-full h-[900px] overflow-auto rounded-3xl shadow-2xl" 
        ref={mapRef}
        style={{ background: currentTheme.background }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Trees and bushes */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`tree-${i}`}
              className="absolute text-6xl opacity-40"
              style={{
                left: `${i % 2 === 0 ? 5 : 85}%`,
                top: `${(i * 80) % 95}%`,
              }}
              animate={{
                rotate: [-2, 2, -2],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {currentTheme.decorations[i % currentTheme.decorations.length]}
            </motion.div>
          ))}

          {/* Floating sparkles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                left: `${(i * 7 + 10) % 90}%`,
                top: `${(i * 11) % 100}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.7, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </motion.div>
          ))}
        </div>

        {/* Winding path/river */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: currentTheme.pathColor, stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: currentTheme.pathColor, stopOpacity: 0.4 }} />
            </linearGradient>
          </defs>
          {Array.from({ length: maxLevel - 1 }, (_, i) => i + 1).map((level) => {
            const from = getPosition(level);
            const to = getPosition(level + 1);
            const levelData = getLevelData(level);
            const isCompleted = levelData.status === 'completed' || level < currentLevel;
            
            return (
              <motion.path
                key={`path-${level}`}
                d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2 - 30} ${to.x} ${to.y}`}
                stroke={isCompleted ? 'url(#pathGradient)' : '#CBD5E1'}
                strokeWidth="40"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: level * 0.05 }}
              />
            );
          })}
        </svg>

        {/* Level nodes */}
        <div className="relative" style={{ height: `${Math.ceil(maxLevel / 3) * 180 + 200}px`, zIndex: 10 }}>
          {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => {
            const pos = getPosition(level);
            const levelData = getLevelData(level);
            const isCurrent = level === currentLevel;
            const isSpecial = level % 5 === 0;

            return (
              <motion.div
                key={`level-${level}`}
                data-level={level}
                className="absolute cursor-pointer"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: level * 0.03, 
                  type: 'spring', 
                  stiffness: 200,
                  damping: 10 
                }}
                onClick={() => handleLevelClick(levelData)}
              >
                {/* Level container */}
                <motion.div
                  className="relative"
                  whileHover={levelData.status !== 'locked' ? { 
                    scale: 1.15,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.3 }
                  } : {}}
                  animate={isCurrent ? {
                    scale: [1, 1.1, 1],
                    transition: { duration: 1.5, repeat: Infinity }
                  } : {}}
                >
                  {/* Glow effect for current level */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full blur-xl"
                      style={{
                        background: 'radial-gradient(circle, rgba(168,85,247,0.6) 0%, rgba(236,72,153,0.3) 50%, transparent 70%)',
                        width: '140px',
                        height: '140px',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Level node circle */}
                  <div
                    className={`
                      relative w-24 h-24 rounded-full flex items-center justify-center
                      bg-gradient-to-br ${getLevelColor(level, levelData.status)}
                      ${levelData.status === 'locked' ? 'opacity-50' : 'opacity-100'}
                      shadow-2xl border-4 border-white
                      ${isCurrent ? 'ring-4 ring-purple-400 ring-offset-2' : ''}
                    `}
                    style={{
                      boxShadow: levelData.status !== 'locked' 
                        ? '0 10px 30px rgba(0,0,0,0.3), inset 0 -5px 15px rgba(0,0,0,0.2)'
                        : '0 5px 15px rgba(0,0,0,0.2)',
                    }}
                  >
                    {/* Inner content */}
                    <div className="text-white text-3xl font-bold z-10">
                      {levelData.status === 'locked' ? (
                        <Lock className="w-8 h-8" />
                      ) : isSpecial ? (
                        getMilestoneIcon(level)
                      ) : (
                        level
                      )}
                    </div>

                    {/* Completed checkmark badge */}
                    {levelData.status === 'completed' && (
                      <motion.div
                        className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg border-2 border-white"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                      >
                        <CheckCircle className="w-5 h-5 text-white" />
                      </motion.div>
                    )}

                    {/* Play button for unlocked/current */}
                    {(levelData.status === 'unlocked' || levelData.status === 'current') && (
                      <motion.div
                        className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg border-2 border-white"
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Play className="w-5 h-5 text-white fill-white" />
                      </motion.div>
                    )}

                    {/* Retry button for completed */}
                    {levelData.status === 'completed' && levelData.stars < 3 && (
                      <motion.div
                        className="absolute -bottom-2 -left-2 bg-orange-500 rounded-full p-2 shadow-lg border-2 border-white"
                        whileHover={{ scale: 1.2, rotate: -360 }}
                      >
                        <RotateCcw className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Stars below level */}
                  {levelData.status !== 'locked' && levelData.stars > 0 && (
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {[1, 2, 3].map((starNum) => (
                        <motion.div
                          key={`star-${level}-${starNum}`}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: starNum * 0.1 + 0.3 }}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              starNum <= levelData.stars
                                ? 'fill-yellow-400 text-yellow-500'
                                : 'fill-gray-300 text-gray-400'
                            }`}
                            style={{
                              filter: starNum <= levelData.stars ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Level number badge below stars */}
                  <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white text-slate-800 font-bold text-sm px-3 py-1 rounded-full shadow-md border-2 border-slate-200">
                      Level {level}
                    </div>
                  </div>

                  {/* Milestone label */}
                  {isSpecial && levelData.status === 'completed' && (
                    <motion.div
                      className="absolute -top-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white">
                        🏆 Milestone {level}
                      </div>
                    </motion.div>
                  )}

                  {/* Current level indicator */}
                  {isCurrent && (
                    <motion.div
                      className="absolute -top-28 left-1/2 transform -translate-x-1/2"
                      animate={{
                        y: [0, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="text-6xl filter drop-shadow-2xl">
                        🚀
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress footer */}
        <motion.div
          className="sticky bottom-6 left-1/2 transform -translate-x-1/2 w-max mx-auto z-50"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl px-8 py-4 shadow-2xl border-2 border-purple-300">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-800">{currentLevel}</div>
                  <div className="text-xs text-slate-600">Current</div>
                </div>
              </div>
              <div className="w-px h-10 bg-slate-300" />
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-800">{currentLevel - 1}</div>
                  <div className="text-xs text-slate-600">Completed</div>
                </div>
              </div>
              <div className="w-px h-10 bg-slate-300" />
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-slate-800">{Math.floor((currentLevel / maxLevel) * 100)}%</div>
                  <div className="text-xs text-slate-600">Progress</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Level Detail Modal */}
      {showLevelModal && selectedLevel && (
        <LevelDetailModal
          level={selectedLevel}
          isOpen={showLevelModal}
          onClose={() => setShowLevelModal(false)}
          worldTheme={worldTheme}
        />
      )}
    </>
  );
};

export default LevelMap;
