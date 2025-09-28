export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'completion' | 'engagement' | 'quality' | 'milestone';
  points: number;
  unlockedAt?: Date;
  isUnlocked: boolean;
  criteria: AchievementCriteria;
}

export interface AchievementCriteria {
  type: 'sections_completed' | 'words_written' | 'days_active' | 'quality_score' | 'feedback_received';
  threshold: number;
  description: string;
}

export interface ProgressData {
  totalSections: number;
  completedSections: number;
  completionPercentage: number;
  wordsWritten: number;
  daysActive: number;
  achievementsUnlocked: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  threshold: number;
  currentValue: number;
  isReached: boolean;
  reachedAt?: Date;
  reward: {
    points: number;
    achievement?: string;
  };
}

export interface CelebrationAnimation {
  type: 'confetti' | 'fireworks' | 'sparkles' | 'badge';
  duration: number;
  intensity: 'low' | 'medium' | 'high';
}
