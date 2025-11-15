import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Star } from 'lucide-react';

const WorldSelector = ({ worlds, selectedWorld, onSelectWorld }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {worlds.map((world, index) => {
        const isLocked = world.status === 'locked';
        const isCompleted = world.status === 'completed';
        const isActive = world.id === selectedWorld;

        return (
          <motion.button
            key={world.id}
            onClick={() => !isLocked && onSelectWorld(world.id)}
            disabled={isLocked}
            className={`
              relative overflow-hidden rounded-2xl p-6 text-left transition-all
              ${isActive ? 'ring-4 ring-purple-500 ring-offset-2' : ''}
              ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
            `}
            style={{
              background: world.gradient
            }}
            whileHover={!isLocked ? { scale: 1.05 } : {}}
            whileTap={!isLocked ? { scale: 0.98 } : {}}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-20">
              <div className="text-9xl absolute -bottom-8 -right-8">
                {world.icon}
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl mb-2">{world.icon}</div>
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-white rounded-full p-1"
                  >
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </motion.div>
                )}
                {isLocked && (
                  <div className="bg-white/90 rounded-full p-2">
                    <Lock className="w-5 h-5 text-slate-700" />
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{world.name}</h3>
              <p className="text-white/90 text-sm mb-4">{world.description}</p>

              {/* Progress bar */}
              <div className="bg-white/30 rounded-full h-2 mb-2 overflow-hidden">
                <motion.div
                  className="bg-white h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${world.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-white text-sm">
                <span>{world.completedLevels}/{world.totalLevels} Levels</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  <span>{world.stars}/{world.totalLevels * 3}</span>
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default WorldSelector;
