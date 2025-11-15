import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Calendar, Gift, Star, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const difficultyColors = {
  easy: 'from-green-400 to-green-600',
  medium: 'from-yellow-400 to-orange-500',
  hard: 'from-red-400 to-red-600',
  legendary: 'from-purple-400 to-pink-600'
};

const ChallengeCard = ({ 
  challenge, 
  onJoin, 
  onViewDetails,
  userProgress = 0,
  userCompleted = false,
  joined = false
}) => {
  const progressPercent = (userProgress / challenge.requirement.target) * 100;
  const daysLeft = Math.ceil(
    (new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="overflow-hidden border-2 border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
        <CardHeader className={`bg-gradient-to-br ${difficultyColors[challenge.difficulty]} p-6 relative overflow-hidden`}>
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <Badge className="bg-white/30 text-white border-0 font-bold">
                {challenge.type}
              </Badge>
              <Badge className={`${
                userCompleted
                  ? 'bg-green-500'
                  : joined
                  ? 'bg-blue-500'
                  : 'bg-white/30'
              } text-white border-0`}>
                {userCompleted ? 'Completed ✓' : joined ? 'Joined' : 'Available'}
              </Badge>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">
                {challenge.title}
              </CardTitle>
            </div>

            <p className="text-white/90 text-sm">
              {challenge.description}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Challenge details */}
          <div className="space-y-4 mb-6">
            {/* Target */}
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-sm text-slate-600">Target</div>
                <div className="font-bold text-slate-800">
                  {challenge.requirement.target} {challenge.requirement.type.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Time left */}
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm text-slate-600">Time Remaining</div>
                <div className="font-bold text-slate-800">
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-sm text-slate-600">Difficulty</div>
                <div className="font-bold text-slate-800 capitalize">
                  {challenge.difficulty}
                </div>
              </div>
            </div>
          </div>

          {/* Progress (if joined) */}
          {joined && !userCompleted && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  Your Progress
                </span>
                <span className="text-sm font-bold text-purple-600">
                  {userProgress} / {challenge.requirement.target}
                </span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <div className="text-xs text-slate-500 mt-1">
                {Math.round(progressPercent)}% Complete
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-yellow-600" />
              <h4 className="font-bold text-slate-800">Rewards</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {challenge.rewards.xp > 0 && (
                <Badge variant="outline" className="bg-white">
                  ⚡ {challenge.rewards.xp} XP
                </Badge>
              )}
              {challenge.rewards.coins > 0 && (
                <Badge variant="outline" className="bg-white">
                  🪙 {challenge.rewards.coins} Coins
                </Badge>
              )}
              {challenge.rewards.badge && (
                <Badge variant="outline" className="bg-white">
                  {challenge.rewards.badge.icon} {challenge.rewards.badge.name}
                </Badge>
              )}
            </div>
          </div>

          {/* Action button */}
          <Button
            onClick={() => joined ? onViewDetails?.(challenge) : onJoin(challenge._id)}
            disabled={userCompleted || daysLeft <= 0}
            className={`w-full ${
              userCompleted
                ? 'bg-green-500'
                : joined
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
            }`}
            size="lg"
          >
            {userCompleted ? (
              <span className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Completed!
              </span>
            ) : joined ? (
              <span className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                View Progress
              </span>
            ) : daysLeft <= 0 ? (
              <span className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Expired
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Join Challenge
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChallengeCard;
