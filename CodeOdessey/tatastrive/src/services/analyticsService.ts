import { BusinessPlan } from '@/types/mentor';
import { StoryboardData } from '@/types/storyboard';

export interface AnalyticsData {
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userRetention: number;
  };
  businessPlans: {
    totalPlans: number;
    completedPlans: number;
    averageCompletionTime: number; // in hours
    averageQualityScore: number;
    plansByStatus: Record<string, number>;
    plansBySector: Record<string, number>;
    plansByRegion: Record<string, number>;
  };
  mentorEfficiency: {
    totalMentors: number;
    activeMentors: number;
    averageReviewTime: number; // in minutes
    plansReviewed: number;
    averagePlansPerMentor: number;
    mentorSatisfaction: number; // 1-5 scale
  };
  platformMetrics: {
    totalSessions: number;
    averageSessionDuration: number; // in minutes
    pageViews: number;
    bounceRate: number;
    featureUsage: Record<string, number>;
  };
  qualityMetrics: {
    averageQualityScore: number;
    qualityDistribution: Record<string, number>;
    improvementRate: number;
    commonIssues: string[];
    strengths: string[];
  };
  exportMetrics: {
    totalExports: number;
    exportsByFormat: Record<string, number>;
    exportsByUser: Record<string, number>;
    averageExportSize: number; // in KB
  };
}

export interface ReportData {
  period: {
    start: Date;
    end: Date;
  };
  analytics: AnalyticsData;
  insights: string[];
  recommendations: string[];
  kpis: {
    userEngagement: number;
    planCompletion: number;
    mentorEfficiency: number;
    platformHealth: number;
  };
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private analyticsData: AnalyticsData | null = null;
  private eventQueue: any[] = [];

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Track user events
  trackEvent(event: string, properties: Record<string, any> = {}) {
    const eventData = {
      event,
      properties,
      timestamp: new Date(),
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    };

    this.eventQueue.push(eventData);
    this.processEventQueue();
  }

  // Track page views
  trackPageView(page: string, properties: Record<string, any> = {}) {
    this.trackEvent('page_view', {
      page,
      ...properties
    });
  }

  // Track business plan creation
  trackBusinessPlanCreated(plan: BusinessPlan) {
    this.trackEvent('business_plan_created', {
      planId: plan.id,
      sector: plan.sector,
      region: plan.region,
      qualityScore: plan.qualityScore
    });
  }

  // Track business plan completion
  trackBusinessPlanCompleted(plan: BusinessPlan, completionTime: number) {
    this.trackEvent('business_plan_completed', {
      planId: plan.id,
      completionTime,
      qualityScore: plan.qualityScore,
      sectionsCompleted: plan.completionPercentage
    });
  }

  // Track mentor actions
  trackMentorAction(action: string, planId: string, mentorId: string, properties: Record<string, any> = {}) {
    this.trackEvent('mentor_action', {
      action,
      planId,
      mentorId,
      ...properties
    });
  }

  // Track export events
  trackExport(format: string, planId: string, fileSize: number) {
    this.trackEvent('export', {
      format,
      planId,
      fileSize
    });
  }

  // Track feature usage
  trackFeatureUsage(feature: string, properties: Record<string, any> = {}) {
    this.trackEvent('feature_usage', {
      feature,
      ...properties
    });
  }

  // Generate analytics report
  async generateReport(period: { start: Date; end: Date }): Promise<ReportData> {
    try {
      // Collect data from various sources
      const analytics = await this.collectAnalyticsData(period);
      
      // Generate insights
      const insights = this.generateInsights(analytics);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(analytics);
      
      // Calculate KPIs
      const kpis = this.calculateKPIs(analytics);

      return {
        period,
        analytics,
        insights,
        recommendations,
        kpis
      };
    } catch (error) {
      console.error('Failed to generate analytics report:', error);
      throw error;
    }
  }

  private async collectAnalyticsData(period: { start: Date; end: Date }): Promise<AnalyticsData> {
    // In a real implementation, this would query your database
    // For now, we'll return mock data
    return {
      userEngagement: {
        totalUsers: 150,
        activeUsers: 45,
        newUsers: 12,
        userRetention: 0.75
      },
      businessPlans: {
        totalPlans: 89,
        completedPlans: 34,
        averageCompletionTime: 8.5,
        averageQualityScore: 72,
        plansByStatus: {
          draft: 25,
          submitted: 18,
          in_review: 12,
          approved: 28,
          rejected: 6
        },
        plansBySector: {
          Agriculture: 32,
          Healthcare: 18,
          'E-commerce': 15,
          Education: 12,
          Technology: 8,
          Manufacturing: 4
        },
        plansByRegion: {
          'Rural Maharashtra': 28,
          'Rural Karnataka': 22,
          'Rural Gujarat': 18,
          'Rural Tamil Nadu': 12,
          'Rural Rajasthan': 9
        }
      },
      mentorEfficiency: {
        totalMentors: 8,
        activeMentors: 6,
        averageReviewTime: 15,
        plansReviewed: 67,
        averagePlansPerMentor: 11.2,
        mentorSatisfaction: 4.2
      },
      platformMetrics: {
        totalSessions: 234,
        averageSessionDuration: 25,
        pageViews: 1247,
        bounceRate: 0.23,
        featureUsage: {
          storyboard: 89,
          export: 34,
          feedback: 67,
          mentor_dashboard: 45
        }
      },
      qualityMetrics: {
        averageQualityScore: 72,
        qualityDistribution: {
          '0-20': 2,
          '21-40': 8,
          '41-60': 15,
          '61-80': 35,
          '81-100': 29
        },
        improvementRate: 0.68,
        commonIssues: [
          'Incomplete financial projections',
          'Unclear target market',
          'Missing risk assessment',
          'Weak competitive analysis'
        ],
        strengths: [
          'Clear problem identification',
          'Strong community focus',
          'Realistic revenue models',
          'Good market understanding'
        ]
      },
      exportMetrics: {
        totalExports: 45,
        exportsByFormat: {
          pdf: 28,
          docx: 12,
          txt: 5
        },
        exportsByUser: {},
        averageExportSize: 245
      }
    };
  }

  private generateInsights(analytics: AnalyticsData): string[] {
    const insights: string[] = [];

    // User engagement insights
    if (analytics.userEngagement.userRetention > 0.7) {
      insights.push('High user retention rate indicates strong platform value');
    }

    // Business plan insights
    if (analytics.businessPlans.averageQualityScore > 70) {
      insights.push('Business plans show good quality with room for improvement');
    }

    if (analytics.businessPlans.completedPlans / analytics.businessPlans.totalPlans > 0.4) {
      insights.push('Strong completion rate suggests effective user guidance');
    }

    // Mentor efficiency insights
    if (analytics.mentorEfficiency.averageReviewTime < 20) {
      insights.push('Mentors are efficiently reviewing plans');
    }

    // Quality insights
    if (analytics.qualityMetrics.improvementRate > 0.6) {
      insights.push('Users are successfully improving their business plans');
    }

    return insights;
  }

  private generateRecommendations(analytics: AnalyticsData): string[] {
    const recommendations: string[] = [];

    // User engagement recommendations
    if (analytics.userEngagement.userRetention < 0.7) {
      recommendations.push('Implement user onboarding improvements to increase retention');
    }

    // Business plan recommendations
    if (analytics.businessPlans.averageQualityScore < 70) {
      recommendations.push('Enhance AI feedback quality to improve business plan scores');
    }

    if (analytics.businessPlans.completedPlans / analytics.businessPlans.totalPlans < 0.4) {
      recommendations.push('Add progress tracking features to encourage completion');
    }

    // Mentor efficiency recommendations
    if (analytics.mentorEfficiency.averageReviewTime > 20) {
      recommendations.push('Provide mentor training on efficient review techniques');
    }

    // Platform recommendations
    if (analytics.platformMetrics.bounceRate > 0.3) {
      recommendations.push('Improve landing page experience to reduce bounce rate');
    }

    return recommendations;
  }

  private calculateKPIs(analytics: AnalyticsData): ReportData['kpis'] {
    return {
      userEngagement: Math.round(analytics.userEngagement.userRetention * 100),
      planCompletion: Math.round((analytics.businessPlans.completedPlans / analytics.businessPlans.totalPlans) * 100),
      mentorEfficiency: Math.round((analytics.mentorEfficiency.averagePlansPerMentor / 15) * 100), // Assuming 15 is target
      platformHealth: Math.round((100 - analytics.platformMetrics.bounceRate * 100) * (analytics.qualityMetrics.averageQualityScore / 100))
    };
  }

  private async processEventQueue() {
    // In a real implementation, this would send events to your analytics service
    // For now, we'll just log them
    if (this.eventQueue.length > 0) {
      console.log('Processing analytics events:', this.eventQueue);
      this.eventQueue = [];
    }
  }

  private getCurrentUserId(): string {
    // Get user ID from auth context or localStorage
    if (typeof window === 'undefined') return 'anonymous';
    return localStorage.getItem('userId') || 'anonymous';
  }

  private getSessionId(): string {
    // Get or create session ID
    if (typeof window === 'undefined') return 'server-session';
    
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Export analytics data
  async exportAnalyticsData(format: 'json' | 'csv' = 'json'): Promise<string> {
    const report = await this.generateReport({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    });

    if (format === 'csv') {
      return this.convertToCSV(report);
    }

    return JSON.stringify(report, null, 2);
  }

  private convertToCSV(report: ReportData): string {
    // Simple CSV conversion for key metrics
    const rows = [
      ['Metric', 'Value'],
      ['Total Users', report.analytics.userEngagement.totalUsers.toString()],
      ['Active Users', report.analytics.userEngagement.activeUsers.toString()],
      ['Total Business Plans', report.analytics.businessPlans.totalPlans.toString()],
      ['Completed Plans', report.analytics.businessPlans.completedPlans.toString()],
      ['Average Quality Score', report.analytics.businessPlans.averageQualityScore.toString()],
      ['Total Exports', report.analytics.exportMetrics.totalExports.toString()],
      ['Mentor Satisfaction', report.analytics.mentorEfficiency.mentorSatisfaction.toString()]
    ];

    return rows.map(row => row.join(',')).join('\n');
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();