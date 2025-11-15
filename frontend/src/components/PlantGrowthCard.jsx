import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * PlantGrowthCard - Habit growth visualization dashboard card
 * 
 * Displays an SVG plant that grows based on user's habit streak.
 * Growth is mapped from 0-30 days.
 * 
 * @param {number} userStreak - Current habit streak in days (default: 0)
 * @param {function} onStreakUpdate - Optional callback when streak changes
 */
const PlantGrowthCard = ({ 
  userStreak = 0,
  onStreakUpdate = null 
}) => {
  const MAX_GROWTH_DAYS = 30;

  // Calculate growth stages
  const cappedStreak = Math.min(userStreak, MAX_GROWTH_DAYS);
  const growthPercentage = Math.min(100, Math.round((cappedStreak / MAX_GROWTH_DAYS) * 100));
  
  // Growth stages
  const stemHeight = Math.min(100, (cappedStreak / 10) * 100); // Grows 0-10 days
  const showLeaves = cappedStreak >= 7;
  const leafScale = Math.min(1, Math.max(0, (cappedStreak - 7) / 8)); // Grows 7-15 days
  const showFlower = cappedStreak >= 20;
  const flowerScale = Math.min(1, Math.max(0, (cappedStreak - 20) / 10)); // Grows 20-30 days

  // Determine growth stage message
  const getGrowthStage = () => {
    if (userStreak === 0) return 'Plant a seed by starting your habit!';
    if (userStreak < 7) return 'Your seedling is sprouting!';
    if (userStreak < 15) return 'Growing strong!';
    if (userStreak < 23) return 'Almost fully grown!';
    if (userStreak >= MAX_GROWTH_DAYS) return 'Fully bloomed! 🌸';
    return 'Keep nurturing your habit!';
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">
              Habit Growth
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400 mt-1">
              Your plant grows as your streak increases
            </CardDescription>
          </div>
          <Badge 
            variant="secondary" 
            className="ml-4 px-4 py-2 text-lg font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
          >
            {userStreak} {userStreak === 1 ? 'day' : 'days'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* SVG Plant Animation */}
        <div className="relative bg-gradient-to-b from-sky-100 to-green-50 dark:from-sky-950 dark:to-green-950 rounded-lg p-4 shadow-inner">
          <svg 
            className="w-full h-64"
            viewBox="0 0 300 300" 
            xmlns="http://www.w3.org/2000/svg"
            aria-label={`Plant growth showing ${userStreak} day streak`}
          >
            {/* Ground */}
            <ellipse cx="150" cy="280" rx="80" ry="15" fill="#8B4513" opacity="0.3"/>
            
            {/* Pot */}
            <path 
              d="M 100 250 L 110 280 L 190 280 L 200 250 Z" 
              fill="#D2691E" 
              stroke="#8B4513" 
              strokeWidth="2"
            />
            <rect x="95" y="245" width="110" height="8" rx="2" fill="#CD853F"/>
            
            {/* Soil */}
            <ellipse cx="150" cy="250" rx="50" ry="8" fill="#654321"/>
            
            {/* Stem - grows based on streak */}
            <g style={{ 
              transformOrigin: '150px 250px',
              transform: `scaleY(${stemHeight / 100})`,
              transition: 'transform 0.8s ease-out'
            }}>
              <rect 
                x="145" 
                y="150" 
                width="10" 
                height="100" 
                rx="5" 
                fill="url(#stemGradient)"
              />
            </g>
            
            {/* Left Leaf - appears at day 7 */}
            {showLeaves && (
              <g style={{ 
                transformOrigin: '120px 180px',
                transform: `scale(${leafScale})`,
                transition: 'transform 0.6s ease-out',
                opacity: leafScale
              }}>
                <ellipse 
                  cx="120" 
                  cy="180" 
                  rx="25" 
                  ry="15" 
                  fill="url(#leafGradient)" 
                  transform="rotate(-30 120 180)"
                />
                <path 
                  d="M 120 180 Q 130 175 140 180" 
                  stroke="#2D5016" 
                  strokeWidth="1.5" 
                  fill="none"
                />
              </g>
            )}
            
            {/* Right Leaf - appears at day 7 */}
            {showLeaves && (
              <g style={{ 
                transformOrigin: '180px 180px',
                transform: `scale(${leafScale})`,
                transition: 'transform 0.6s ease-out 0.1s',
                opacity: leafScale
              }}>
                <ellipse 
                  cx="180" 
                  cy="180" 
                  rx="25" 
                  ry="15" 
                  fill="url(#leafGradient)" 
                  transform="rotate(30 180 180)"
                />
                <path 
                  d="M 180 180 Q 170 175 160 180" 
                  stroke="#2D5016" 
                  strokeWidth="1.5" 
                  fill="none"
                />
              </g>
            )}
            
            {/* Lower Left Leaf */}
            {showLeaves && (
              <g style={{ 
                transformOrigin: '125px 210px',
                transform: `scale(${leafScale * 0.9})`,
                transition: 'transform 0.6s ease-out 0.2s',
                opacity: leafScale
              }}>
                <ellipse 
                  cx="125" 
                  cy="210" 
                  rx="20" 
                  ry="12" 
                  fill="url(#leafGradient)" 
                  transform="rotate(-40 125 210)"
                />
              </g>
            )}
            
            {/* Lower Right Leaf */}
            {showLeaves && (
              <g style={{ 
                transformOrigin: '175px 210px',
                transform: `scale(${leafScale * 0.9})`,
                transition: 'transform 0.6s ease-out 0.3s',
                opacity: leafScale
              }}>
                <ellipse 
                  cx="175" 
                  cy="210" 
                  rx="20" 
                  ry="12" 
                  fill="url(#leafGradient)" 
                  transform="rotate(40 175 210)"
                />
              </g>
            )}
            
            {/* Flower - appears at day 20 */}
            {showFlower && (
              <g style={{ 
                transformOrigin: '150px 140px',
                transform: `scale(${flowerScale})`,
                transition: 'transform 0.8s ease-out',
                opacity: flowerScale
              }}>
                {/* Flower petals */}
                <circle cx="150" cy="125" r="12" fill="#FF69B4"/>
                <circle cx="138" cy="135" r="12" fill="#FF1493"/>
                <circle cx="162" cy="135" r="12" fill="#FF1493"/>
                <circle cx="143" cy="148" r="12" fill="#FF69B4"/>
                <circle cx="157" cy="148" r="12" fill="#FF69B4"/>
                {/* Flower center */}
                <circle cx="150" cy="138" r="8" fill="#FFD700"/>
                <circle cx="148" cy="136" r="3" fill="#FFA500" opacity="0.6"/>
              </g>
            )}
            
            {/* Gradients */}
            <defs>
              <linearGradient id="stemGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2D5016"/>
                <stop offset="100%" stopColor="#4A7C2C"/>
              </linearGradient>
              <radialGradient id="leafGradient">
                <stop offset="0%" stopColor="#90EE90"/>
                <stop offset="50%" stopColor="#32CD32"/>
                <stop offset="100%" stopColor="#228B22"/>
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Growth Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              {getGrowthStage()}
            </span>
            <span className="text-green-700 dark:text-green-300 font-semibold">
              {growthPercentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${growthPercentage}%` }}
              aria-valuenow={growthPercentage}
              aria-valuemin="0"
              aria-valuemax="100"
              role="progressbar"
            />
          </div>

          {/* Milestone Indicator */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
            <span>Day 0</span>
            <span className="text-green-600 dark:text-green-400 font-medium">
              {userStreak >= MAX_GROWTH_DAYS ? '🏆 Goal Reached!' : `Goal: ${MAX_GROWTH_DAYS} days`}
            </span>
            <span>Day {MAX_GROWTH_DAYS}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlantGrowthCard;
