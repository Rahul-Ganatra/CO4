export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'completeness' | 'quality' | 'structure' | 'content';
  weight: number; // 0-1, how important this rule is
  validator: (section: any) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  message: string;
  suggestions: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface QualityScore {
  overall: number; // 0-100
  completeness: number; // 0-100
  quality: number; // 0-100
  structure: number; // 0-100
  content: number; // 0-100
  breakdown: {
    section: string;
    score: number;
    issues: string[];
    suggestions: string[];
  }[];
  recommendations: string[];
  readinessLevel: 'draft' | 'developing' | 'good' | 'excellent' | 'ready';
  // Shark Tank evaluation scores
  sharkTankScore?: {
    overall: number;
    uniqueness: number;
    feasibility: number;
    marketPotential: number;
    scalability: number;
    teamExecution: number;
    financialViability: number;
    innovation: number;
    competitiveAdvantage: number;
    riskAssessment: number;
    readinessLevel: 'draft' | 'developing' | 'good' | 'excellent' | 'ready';
    detailedFeedback: {
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
      investmentReadiness: string;
    };
    categoryBreakdown: {
      category: string;
      score: number;
      feedback: string;
    }[];
  };
}

export interface BusinessPlanMetrics {
  totalWords: number;
  averageWordsPerSection: number;
  completionRate: number;
  qualityScore: number;
  lastUpdated: Date;
  timeSpent: number; // in minutes
  feedbackReceived: number;
  revisions: number;
}

export interface ValidationCriteria {
  minWordsPerSection: number;
  maxWordsPerSection: number;
  requiredSections: string[];
  qualityThresholds: {
    draft: number;
    developing: number;
    good: number;
    excellent: number;
    ready: number;
  };
}
