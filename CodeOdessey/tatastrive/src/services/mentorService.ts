import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StoryboardData } from '@/types/storyboard';
import { BusinessPlan } from '@/types/mentor';

export const mentorService = {
  // Get all storyboards from all users (for mentor dashboard)
  async getAllStoryboards(): Promise<BusinessPlan[]> {
    try {
      const storyboardsRef = collection(db, 'storyboards');
      // Remove orderBy to avoid index requirement - we'll sort in JavaScript
      const q = query(storyboardsRef);
      
      const querySnapshot = await getDocs(q);
      const businessPlans: BusinessPlan[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Processing storyboard document:', doc.id, data);
        
        try {
          const storyboard: StoryboardData = {
            id: data.id || doc.id,
            title: data.title || 'Untitled Business Plan',
            sections: (data.sections || []).map((section: any) => ({
              ...section,
              // Convert Firestore Timestamps back to Date objects
              createdAt: section.createdAt?.toDate() || new Date(),
              updatedAt: section.updatedAt?.toDate() || new Date(),
            })),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            completionPercentage: data.completionPercentage || 0,
          };

          // Convert storyboard to business plan format
          const businessPlan = this.convertStoryboardToBusinessPlan(storyboard, data.userId || 'unknown-user');
          businessPlans.push(businessPlan);
        } catch (sectionError) {
          console.error('Error processing storyboard section:', sectionError, data);
        }
      });
      
      // Sort by updatedAt in JavaScript instead of Firestore
      businessPlans.sort((a, b) => b.submissionDate.getTime() - a.submissionDate.getTime());
      
      console.log('All storyboards retrieved for mentor dashboard:', businessPlans.length);
      
      // If no storyboards found, return empty array (don't create mock data)
      if (businessPlans.length === 0) {
        console.log('No storyboards found in database');
      }
      
      return businessPlans;
    } catch (error) {
      console.error('Error getting all storyboards:', error);
      throw new Error('Failed to get storyboards for mentor dashboard');
    }
  },

  // Convert storyboard data to business plan format
  convertStoryboardToBusinessPlan(storyboard: StoryboardData, userId: string): BusinessPlan {
    // Extract content from sections
    const sections = storyboard.sections.reduce((acc, section) => {
      acc[section.type] = section.content;
      return acc;
    }, {} as any);

    // Calculate quality score based on completion and content quality
    const qualityScore = this.calculateQualityScore(storyboard);
    
    // Determine status based on completion
    const status = this.determineStatus(storyboard);
    
    // Determine priority based on quality and completion
    const priority = this.determinePriority(storyboard, qualityScore);
    
    // Extract strengths and areas for improvement
    const { strengths, areasForImprovement } = this.analyzeContent(storyboard);

    return {
      id: storyboard.id,
      title: storyboard.title,
      entrepreneur: userId, // We'll need to get user name from user collection
      region: 'Rural India', // Default region, could be enhanced
      sector: 'General', // Default sector, could be enhanced
      status,
      qualityScore,
      completionPercentage: storyboard.completionPercentage,
      submissionDate: storyboard.updatedAt,
      priority,
      summary: sections.problem || sections.solution || 'Business plan in development',
      strengths,
      areasForImprovement,
      sections: {
        problem: sections.problem || '',
        solution: sections.solution || '',
        customer: sections.customer || '',
        revenue: sections.revenue || '',
        risks: sections.risks || ''
      },
      feedback: {
        ai: [], // TODO: Get from AI feedback service
        mentor: []
      },
      metrics: {
        timeSpent: Math.floor((Date.now() - storyboard.createdAt.getTime()) / 60000), // minutes
        revisions: 0, // TODO: Track revisions
        lastUpdated: storyboard.updatedAt
      }
    };
  },

  // Calculate quality score based on content
  calculateQualityScore(storyboard: StoryboardData): number {
    const sections = storyboard.sections;
    let totalScore = 0;
    let sectionCount = 0;

    sections.forEach(section => {
      if (section.content.trim().length > 0) {
        sectionCount++;
        // Basic scoring based on content length and quality indicators
        let sectionScore = 0;
        
        // Length-based scoring (0-40 points)
        const contentLength = section.content.trim().length;
        if (contentLength > 500) sectionScore += 40;
        else if (contentLength > 200) sectionScore += 30;
        else if (contentLength > 100) sectionScore += 20;
        else if (contentLength > 50) sectionScore += 10;
        
        // Quality indicators (0-60 points)
        const qualityWords = ['market', 'customer', 'revenue', 'profit', 'strategy', 'analysis', 'research', 'competition', 'advantage', 'value'];
        const qualityWordCount = qualityWords.filter(word => 
          section.content.toLowerCase().includes(word)
        ).length;
        sectionScore += Math.min(qualityWordCount * 10, 60);
        
        totalScore += sectionScore;
      }
    });

    return sectionCount > 0 ? Math.min(Math.round(totalScore / sectionCount), 100) : 0;
  },

  // Determine status based on completion
  determineStatus(storyboard: StoryboardData): 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' {
    const completionPercentage = storyboard.completionPercentage;
    
    if (completionPercentage < 50) return 'draft';
    if (completionPercentage < 80) return 'submitted';
    if (completionPercentage >= 80) return 'in_review';
    
    return 'draft';
  },

  // Determine priority based on quality and completion
  determinePriority(storyboard: StoryboardData, qualityScore: number): 'high' | 'medium' | 'low' {
    const completionPercentage = storyboard.completionPercentage;
    
    if (qualityScore >= 80 && completionPercentage >= 80) return 'high';
    if (qualityScore >= 60 || completionPercentage >= 60) return 'medium';
    return 'low';
  },

  // Analyze content for strengths and areas for improvement
  analyzeContent(storyboard: StoryboardData): { strengths: string[]; areasForImprovement: string[] } {
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];
    
    const sections = storyboard.sections;
    const completedSections = sections.filter(s => s.content.trim().length > 0);
    
    // Strengths
    if (completedSections.length >= 4) {
      strengths.push('Comprehensive business plan');
    }
    if (sections.find(s => s.type === 'problem' && s.content.trim().length > 100)) {
      strengths.push('Clear problem identification');
    }
    if (sections.find(s => s.type === 'solution' && s.content.trim().length > 100)) {
      strengths.push('Well-defined solution');
    }
    if (sections.find(s => s.type === 'customer' && s.content.trim().length > 100)) {
      strengths.push('Target customer analysis');
    }
    if (sections.find(s => s.type === 'revenue' && s.content.trim().length > 100)) {
      strengths.push('Revenue model defined');
    }
    
    // Areas for improvement
    if (completedSections.length < 3) {
      areasForImprovement.push('Incomplete sections');
    }
    if (!sections.find(s => s.type === 'problem' && s.content.trim().length > 50)) {
      areasForImprovement.push('Problem statement needs detail');
    }
    if (!sections.find(s => s.type === 'solution' && s.content.trim().length > 50)) {
      areasForImprovement.push('Solution description needs detail');
    }
    if (!sections.find(s => s.type === 'customer' && s.content.trim().length > 50)) {
      areasForImprovement.push('Target customer analysis needed');
    }
    if (!sections.find(s => s.type === 'revenue' && s.content.trim().length > 50)) {
      areasForImprovement.push('Revenue model needs detail');
    }
    if (!sections.find(s => s.type === 'risks' && s.content.trim().length > 50)) {
      areasForImprovement.push('Risk assessment needed');
    }
    
    return { strengths, areasForImprovement };
  },

  // Get user information for a storyboard
  async getUserInfo(userId: string): Promise<{ name: string; email: string } | null> {
    try {
      // This would typically fetch from a users collection
      // For now, return default values
      return {
        name: `User ${userId.slice(0, 8)}`,
        email: `user${userId.slice(0, 8)}@example.com`
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  },

  // Test Firestore connection
  async testConnection(): Promise<boolean> {
    try {
      const storyboardsRef = collection(db, 'storyboards');
      const q = query(storyboardsRef);
      const querySnapshot = await getDocs(q);
      console.log('Firestore connection test successful. Document count:', querySnapshot.size);
      return true;
    } catch (error) {
      console.error('Firestore connection test failed:', error);
      return false;
    }
  }
};
