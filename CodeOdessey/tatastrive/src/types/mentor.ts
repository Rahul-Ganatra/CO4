export interface BusinessPlan {
  id: string;
  title: string;
  entrepreneur: string;
  region: string;
  sector: string;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
  qualityScore: number;
  completionPercentage: number;
  submissionDate: Date;
  priority: 'high' | 'medium' | 'low';
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  sections?: {
    problem: string;
    solution: string;
    customer: string;
    revenue: string;
    risks: string;
  };
  feedback?: {
    ai: string[];
    mentor: string[];
  };
  metrics?: {
    timeSpent: number; // in minutes
    revisions: number;
    lastUpdated: Date;
  };
}

export interface MentorFilters {
  status: 'all' | 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
  qualityScore: 'all' | 'high' | 'medium' | 'low';
  sector: 'all' | 'Agriculture' | 'Healthcare' | 'E-commerce' | 'Education' | 'Technology' | 'Manufacturing' | 'Services';
  region: 'all' | string;
}

export interface MentorAction {
  id: string;
  type: 'approve' | 'reject' | 'request_revision' | 'assign_priority' | 'add_feedback';
  planId: string;
  mentorId: string;
  timestamp: Date;
  notes?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface MentorMetrics {
  totalPlansReviewed: number;
  averageReviewTime: number; // in minutes
  plansApproved: number;
  plansRejected: number;
  plansRequestedRevision: number;
  averageQualityScore: number;
  topSectors: Array<{ sector: string; count: number }>;
  topRegions: Array<{ region: string; count: number }>;
}

export interface BatchOperation {
  id: string;
  type: 'approve' | 'reject' | 'assign_priority' | 'add_feedback';
  planIds: string[];
  notes?: string;
  priority?: 'high' | 'medium' | 'low';
}
