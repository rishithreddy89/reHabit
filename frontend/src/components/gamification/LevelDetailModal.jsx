import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Trophy, Coins, Zap, Target, Play, RotateCcw, Lock } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/lib/config';

const LevelDetailModal = ({ level, isOpen, onClose, worldTheme = 'forest' }) => {
  const [loading, setLoading] = useState(false);

  const themeData = {
    forest: {
      bg: 'from-green-500 to-emerald-600',
      monster: '🐉',
      title: 'Forest Guardian'
    },
    ocean: {
      bg: 'from-blue-500 to-cyan-600',
      monster: '🦈',
      title: 'Ocean Beast'
    },
    mountain: {
      bg: 'from-purple-500 to-indigo-600',
      monster: '🦅',
      title: 'Sky Titan'
    },
    gym: {
      bg: 'from-orange-500 to-yellow-600',
      monster: '💪',
      title: 'Fitness Boss'
    },
    garden: {
      bg: 'from-pink-500 to-rose-600',
      monster: '🦋',
      title: 'Garden Spirit'
    }
  };

  const theme = themeData[worldTheme] || themeData.forest;

  const handleStartLevel = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/levels/${level.levelNumber}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('🎯 Level started! Complete your habits to progress.');
      onClose();
      // Optionally navigate or refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start level');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLevel = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/levels/${level.levelNumber}/retry`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('🔄 Level reset! Try to get 3 stars this time!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to retry level');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white/90 rounded-full p-2 hover:bg-white transition-colors"
            >
              <X className="w-6 h-6 text-slate-700" />
            </button>

            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${theme.bg} text-white p-8 rounded-t-3xl`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-4xl font-bold mb-2">Level {level.levelNumber}</h2>
                  <p className="text-white/90 text-lg">{theme.title}</p>
                </div>
                <motion.div
                  className="text-8xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {theme.monster}
                </motion.div>
              </div>

              {/* Stars */}
              {level.stars !== undefined && (
                <div className="flex gap-2 mt-4">
                  {[1, 2, 3].map((star) => (
                    <motion.div
                      key={star}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: star * 0.1 }}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= level.stars
                            ? 'fill-yellow-300 text-yellow-300'
                            : 'fill-white/30 text-white/30'
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Status badge */}
              <div className="flex items-center justify-center">
                <div className={`
                  px-6 py-2 rounded-full font-semibold text-sm
                  ${level.status === 'locked' ? 'bg-slate-200 text-slate-700' : ''}
                  ${level.status === 'unlocked' ? 'bg-blue-100 text-blue-700' : ''}
                  ${level.status === 'current' ? 'bg-purple-100 text-purple-700' : ''}
                  ${level.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                `}>
                  {level.status === 'locked' && '🔒 Locked'}
                  {level.status === 'unlocked' && '🎯 Ready to Start'}
                  {level.status === 'current' && '⚡ In Progress'}
                  {level.status === 'completed' && '✅ Completed'}
                </div>
              </div>

              {/* Quest info */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Quest Objectives
                </h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Complete all assigned habits for the day
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Maintain your streak across all habits
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Earn bonus points for early completion
                  </li>
                </ul>
              </div>

              {/* Rewards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 text-center">
                  <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="font-bold text-slate-800">50 Coins</div>
                  <div className="text-xs text-slate-600">Base Reward</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                  <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="font-bold text-slate-800">100 XP</div>
                  <div className="text-xs text-slate-600">Experience</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center">
                  <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="font-bold text-slate-800">Bonus</div>
                  <div className="text-xs text-slate-600">For 3 Stars</div>
                </div>
              </div>

              {/* Story/Description */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">📖 Quest Story</h3>
                <p className="text-slate-600 leading-relaxed">
                  The path ahead requires dedication and consistency. Complete your habits to prove 
                  your commitment and unlock the next stage of your journey. Every small action 
                  brings you closer to mastery!
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 pt-4">
                {level.status === 'locked' ? (
                  <button
                    disabled
                    className="flex-1 bg-slate-300 text-slate-600 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Lock className="w-5 h-5" />
                    Complete Previous Level
                  </button>
                ) : level.status === 'completed' ? (
                  <button
                    onClick={handleRetryLevel}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50"
                  >
                    <RotateCcw className="w-5 h-5" />
                    {loading ? 'Loading...' : 'Retry for 3 Stars'}
                  </button>
                ) : (
                  <button
                    onClick={handleStartLevel}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
                  >
                    <Play className="w-5 h-5" />
                    {loading ? 'Starting...' : level.status === 'current' ? 'Continue Level' : 'Start Level'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LevelDetailModal;
