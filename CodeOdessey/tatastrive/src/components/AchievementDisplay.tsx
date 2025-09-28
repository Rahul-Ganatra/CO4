'use client';

import { useState, useEffect } from 'react';
import { Achievement, CelebrationAnimation } from '@/types/gamification';

interface AchievementDisplayProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementDisplay({ achievement, onClose }: AchievementDisplayProps) {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getAnimationClass = (type: CelebrationAnimation['type']) => {
    switch (type) {
      case 'confetti':
        return 'animate-bounce';
      case 'fireworks':
        return 'animate-pulse';
      case 'sparkles':
        return 'animate-spin';
      case 'badge':
        return 'animate-ping';
      default:
        return 'animate-bounce';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div className={`text-6xl mb-4 ${showAnimation ? getAnimationClass('sparkles') : ''}`}>
          {achievement.icon}
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Achievement Unlocked!
        </h3>
        
        <h4 className="text-xl font-semibold text-blue-600 mb-2">
          {achievement.title}
        </h4>
        
        <p className="text-gray-600 mb-4">
          {achievement.description}
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-yellow-600">⭐</span>
            <span className="font-semibold text-yellow-800">
              +{achievement.points} points
            </span>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
