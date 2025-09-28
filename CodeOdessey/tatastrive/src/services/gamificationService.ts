import { Achievement, ProgressData, Milestone, CelebrationAnimation } from '@/types/gamification';
import { StoryboardData } from '@/types/storyboard';

class GamificationService {
  private achievements: Achievement[] = [];
  private progressData: ProgressData | null = null;
  private milestones: Milestone[] = [];

  constructor() {
    this.initializeAchievements();
    this.initializeMilestones();
  }

  private initializeAchievements(): void {
    this.achievements = [
      {
        id: 'first_section',
        title: 'Getting Started',
        description: 'Complete your first section',
        icon: '🎯',
        category: 'completion',
        points: 10,
        isUnlocked: false,
        criteria: {
          type: 'sections_completed',
          threshold: 1,
          description: 'Complete 1 section',
        },
      },
      {
        id: 'half_complete',
        title: 'Halfway There',
        description: 'Complete half of your business plan',
        icon: '🏃‍♂️',
        category: 'completion',
        points: 25,
        isUnlocked: false,
        criteria: {
          type: 'sections_completed',
          threshold: 3,
          description: 'Complete 3 sections',
        },
      },
      {
        id: 'fully_complete',
        title: 'Business Plan Master',
        description: 'Complete your entire business plan',
        icon: '🏆',
        category: 'completion',
        points: 50,
        isUnlocked: false,
        criteria: {
          type: 'sections_completed',
          threshold: 5,
          description: 'Complete all 5 sections',
        },
      },
      {
        id: 'word_writer',
        title: 'Word Smith',
        description: 'Write 500 words across all sections',
        icon: '✍️',
        category: 'engagement',
        points: 20,
        isUnlocked: false,
        criteria: {
          type: 'words_written',
          threshold: 500,
          description: 'Write 500 words',
        },
      },
      {
        id: 'daily_user',
        title: 'Daily Dedication',
        description: 'Use the platform for 3 consecutive days',
        icon: '📅',
        category: 'engagement',
        points: 30,
        isUnlocked: false,
        criteria: {
          type: 'days_active',
          threshold: 3,
          description: 'Active for 3 days',
        },
      },
      {
        id: 'quality_focused',
        title: 'Quality Focused',
        description: 'Achieve a quality score of 80% or higher',
        icon: '⭐',
        category: 'quality',
        points: 40,
        isUnlocked: false,
        criteria: {
          type: 'quality_score',
          threshold: 80,
          description: 'Achieve 80% quality score',
        },
      },
    ];
  }

  private initializeMilestones(): void {
    this.milestones = [
      {
        id: 'sections_milestone',
        title: 'Section Completion',
        description: 'Complete sections of your business plan',
        threshold: 5,
        currentValue: 0,
        isReached: false,
        reward: { points: 50 },
      },
      {
        id: 'words_milestone',
        title: 'Word Count',
        description: 'Write words across all sections',
        threshold: 1000,
        currentValue: 0,
        isReached: false,
        reward: { points: 30 },
      },
      {
        id: 'days_milestone',
        title: 'Consistency',
        description: 'Days of active use',
        threshold: 7,
        currentValue: 0,
        isReached: false,
        reward: { points: 40 },
      },
    ];
  }

  calculateProgress(storyboardData: StoryboardData, qualityScore?: any): ProgressData {
    const completedSections = storyboardData.sections.filter(section => section.isCompleted).length;
    const totalSections = storyboardData.sections.length;
    const wordsWritten = storyboardData.sections.reduce((total, section) => {
      return total + (section.content ? section.content.split(/\s+/).length : 0);
    }, 0);

    // Use quality score if available, otherwise fall back to basic completion
    let completionPercentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
    if (qualityScore?.sharkTankScore?.overall) {
      completionPercentage = qualityScore.sharkTankScore.overall;
    } else if (qualityScore?.overall) {
      completionPercentage = qualityScore.overall;
    }

    const progressData: ProgressData = {
      totalSections,
      completedSections,
      completionPercentage,
      wordsWritten,
      daysActive: this.getDaysActive(),
      achievementsUnlocked: this.achievements.filter(a => a.isUnlocked).length,
      totalPoints: this.achievements.filter(a => a.isUnlocked).reduce((total, a) => total + a.points, 0),
      currentStreak: this.getCurrentStreak(),
      longestStreak: this.getLongestStreak(),
      lastActivity: new Date(),
    };

    this.progressData = progressData;
    return progressData;
  }

  checkAchievements(storyboardData: StoryboardData): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    const progressData = this.calculateProgress(storyboardData);

    for (const achievement of this.achievements) {
      if (achievement.isUnlocked) continue;

      let isUnlocked = false;
      switch (achievement.criteria.type) {
        case 'sections_completed':
          isUnlocked = progressData.completedSections >= achievement.criteria.threshold;
          break;
        case 'words_written':
          isUnlocked = progressData.wordsWritten >= achievement.criteria.threshold;
          break;
        case 'days_active':
          isUnlocked = progressData.daysActive >= achievement.criteria.threshold;
          break;
        case 'quality_score':
          // This would be calculated based on feedback scores
          isUnlocked = false; // Placeholder
          break;
        case 'feedback_received':
          // This would be calculated based on feedback received
          isUnlocked = false; // Placeholder
          break;
      }

      if (isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date();
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  checkMilestones(storyboardData: StoryboardData): Milestone[] {
    const newlyReached: Milestone[] = [];
    const progressData = this.calculateProgress(storyboardData);

    for (const milestone of this.milestones) {
      if (milestone.isReached) continue;

      let currentValue = 0;
      switch (milestone.id) {
        case 'sections_milestone':
          currentValue = progressData.completedSections;
          break;
        case 'words_milestone':
          currentValue = progressData.wordsWritten;
          break;
        case 'days_milestone':
          currentValue = progressData.daysActive;
          break;
      }

      milestone.currentValue = currentValue;

      if (currentValue >= milestone.threshold) {
        milestone.isReached = true;
        milestone.reachedAt = new Date();
        newlyReached.push(milestone);
      }
    }

    return newlyReached;
  }

  getCelebrationAnimation(achievement: Achievement): CelebrationAnimation {
    const celebrations: Record<string, CelebrationAnimation> = {
      'first_section': { type: 'sparkles', duration: 2000, intensity: 'medium' },
      'half_complete': { type: 'confetti', duration: 3000, intensity: 'high' },
      'fully_complete': { type: 'fireworks', duration: 5000, intensity: 'high' },
      'word_writer': { type: 'sparkles', duration: 2000, intensity: 'medium' },
      'daily_user': { type: 'badge', duration: 1500, intensity: 'low' },
      'quality_focused': { type: 'confetti', duration: 2500, intensity: 'medium' },
    };

    return celebrations[achievement.id] || { type: 'sparkles', duration: 2000, intensity: 'low' };
  }

  private getDaysActive(): number {
    // In a real app, this would be calculated from actual usage data
    if (typeof window === 'undefined') return 1;
    const lastActive = localStorage.getItem('tatastrive_last_active');
    if (!lastActive) return 1;
    
    const lastActiveDate = new Date(lastActive);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastActiveDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.min(diffDays, 30); // Cap at 30 days
  }

  private getCurrentStreak(): number {
    // In a real app, this would be calculated from actual usage data
    return 1; // Placeholder
  }

  private getLongestStreak(): number {
    // In a real app, this would be calculated from actual usage data
    return 1; // Placeholder
  }

  getAllAchievements(): Achievement[] {
    return this.achievements;
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.isUnlocked);
  }

  getProgressData(): ProgressData | null {
    return this.progressData;
  }

  getMilestones(): Milestone[] {
    return this.milestones;
  }

  saveProgress(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tatastrive_progress', JSON.stringify({
        achievements: this.achievements,
        milestones: this.milestones,
        lastActive: new Date().toISOString(),
      }));
    }
  }

  loadProgress(): void {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('tatastrive_progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.achievements = data.achievements || this.achievements;
        this.milestones = data.milestones || this.milestones;
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    }
  }
}

export const gamificationService = new GamificationService();
