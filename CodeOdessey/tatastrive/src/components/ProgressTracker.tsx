'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProgressData, Achievement, Milestone } from '@/types/gamification';
import { StoryboardData } from '@/types/storyboard';
import { gamificationService } from '@/services/gamificationService';
import AchievementDisplay from './AchievementDisplay';

interface ProgressTrackerProps {
  storyboardData: StoryboardData;
  qualityScore?: any;
  onProgressUpdate?: (progress: ProgressData) => void;
}

export default function ProgressTracker({ storyboardData, qualityScore, onProgressUpdate }: ProgressTrackerProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);

  const stableOnProgressUpdate = useCallback(onProgressUpdate || (() => {}), [onProgressUpdate]);

  useEffect(() => {
    // Load saved progress
    gamificationService.loadProgress();
    
    // Calculate current progress
    const currentProgress = gamificationService.calculateProgress(storyboardData, qualityScore);
    setProgress(currentProgress);
    
    // Check for new achievements
    const newAchievements = gamificationService.checkAchievements(storyboardData);
    if (newAchievements.length > 0) {
      setNewAchievements(newAchievements);
      setShowAchievement(newAchievements[0]);
    }
    
    // Check milestones
    const newMilestones = gamificationService.checkMilestones(storyboardData);
    setMilestones(newMilestones);
    
    // Get all achievements
    setAchievements(gamificationService.getAllAchievements());
    
    // Save progress
    gamificationService.saveProgress();
    
    stableOnProgressUpdate(currentProgress);
  }, [storyboardData, qualityScore, stableOnProgressUpdate]);

  const handleAchievementClose = () => {
    setShowAchievement(null);
    if (newAchievements.length > 1) {
      setNewAchievements(prev => prev.slice(1));
      setShowAchievement(newAchievements[1]);
    } else {
      setNewAchievements([]);
    }
  };

  if (!progress) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Progress
        </h3>
        
        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {qualityScore?.sharkTankScore ? '🦈 Investment Readiness' : 'Overall Completion'}
            </span>
            <span className="text-sm font-bold text-blue-600">
              {(() => {
                // Calculate display percentage based on quality score if available
                if (qualityScore?.sharkTankScore?.overall) {
                  return qualityScore.sharkTankScore.overall;
                } else if (qualityScore?.overall) {
                  return qualityScore.overall;
                }
                return progress.completionPercentage;
              })()}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                qualityScore?.sharkTankScore ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-blue-600'
              }`}
              style={{ 
                width: `${(() => {
                  // Calculate display percentage based on quality score if available
                  if (qualityScore?.sharkTankScore?.overall) {
                    return qualityScore.sharkTankScore.overall;
                  } else if (qualityScore?.overall) {
                    return qualityScore.overall;
                  }
                  return progress.completionPercentage;
                })()}%` 
              }}
            />
          </div>
          {qualityScore?.sharkTankScore && (
            <p className="text-xs text-gray-500 mt-1">
              Based on Shark Tank evaluation criteria
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {progress.completedSections}
            </div>
            <div className="text-sm text-gray-600">Sections Done</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {progress.wordsWritten}
            </div>
            <div className="text-sm text-gray-600">Words Written</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {progress.achievementsUnlocked}
            </div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {progress.totalPoints}
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            Recent Achievements
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {achievements
              .filter(a => a.isUnlocked)
              .slice(-3)
              .map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{achievement.title}</div>
                    <div className="text-xs text-gray-600">{achievement.description}</div>
                  </div>
                  <div className="text-xs text-yellow-600 font-semibold">
                    +{achievement.points}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Milestones */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            Milestones
          </h4>
          <div className="space-y-2">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {milestone.title}
                  </span>
                  <span className="text-sm text-gray-600">
                    {milestone.currentValue}/{milestone.threshold}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      milestone.isReached ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min((milestone.currentValue / milestone.threshold) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievement Popup */}
      {showAchievement && (
        <AchievementDisplay
          achievement={showAchievement}
          onClose={handleAchievementClose}
        />
      )}
    </>
  );
}
