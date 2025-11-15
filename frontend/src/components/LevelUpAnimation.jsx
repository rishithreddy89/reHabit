import React, { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/**
 * LevelUpAnimation - Celebration animation when user levels up
 * 
 * Displays a star pop-up animation overlay when user advances to a new level
 * 
 * @param {boolean} show - Whether to show the animation
 * @param {number} newLevel - The new level number achieved
 * @param {function} onComplete - Callback when animation finishes
 */
const LevelUpAnimation = ({ show, newLevel, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          onComplete();
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Lottie Animation */}
        <div className="w-96 h-96">
          <DotLottieReact
            src="https://lottie.host/b2fa9d79-fa9b-40fa-9d76-6f5cfded4aff/Fs88VlS9Ee.lottie"
            loop={false}
            autoplay
          />
        </div>

        {/* Level Up Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <h2 className="text-6xl font-bold text-white mb-4 animate-in zoom-in duration-500" style={{ fontFamily: 'Space Grotesk' }}>
            Level Up!
          </h2>
          <div className="flex items-center gap-3 animate-in slide-in-from-bottom duration-700 delay-200">
            <span className="text-4xl font-bold text-yellow-400">⭐</span>
            <span className="text-5xl font-bold text-white">Level {newLevel}</span>
            <span className="text-4xl font-bold text-yellow-400">⭐</span>
          </div>
          <p className="text-xl text-white/90 mt-6 animate-in fade-in duration-700 delay-500">
            Amazing progress! Keep going! 🎉
          </p>
        </div>
      </div>
    </div>
  );
};

export default LevelUpAnimation;
