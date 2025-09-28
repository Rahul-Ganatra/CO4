import { ValidationRule, ValidationResult, QualityScore, BusinessPlanMetrics, ValidationCriteria } from '@/types/validation';
import { StoryboardData, StoryboardSection } from '@/types/storyboard';
import { groqEvaluationService, SharkTankScore } from './groqEvaluationService';

class ValidationService {
  private criteria: ValidationCriteria = {
    minWordsPerSection: 50,
    maxWordsPerSection: 2000,
    requiredSections: ['problem', 'solution', 'customer', 'revenue', 'risks'],
    qualityThresholds: {
      draft: 20,
      developing: 40,
      good: 60,
      excellent: 80,
      ready: 90,
    },
  };

  private validationRules: ValidationRule[] = [
    {
      id: 'section_completeness',
      name: 'Section Completeness',
      description: 'All required sections are present and have content',
      category: 'completeness',
      weight: 0.3,
      validator: (storyboard: StoryboardData) => {
        const completedSections = storyboard.sections.filter(s => s.isCompleted).length;
        const totalSections = storyboard.sections.length;
        const score = (completedSections / totalSections) * 100;
        
        return {
          isValid: score >= 80,
          score,
          message: `${completedSections}/${totalSections} sections completed`,
          suggestions: score < 80 ? ['Complete all required sections'] : [],
          severity: score < 50 ? 'high' : score < 80 ? 'medium' : 'low',
        };
      },
    },
    {
      id: 'word_count',
      name: 'Adequate Content',
      description: 'Each section has sufficient content',
      category: 'content',
      weight: 0.2,
      validator: (storyboard: StoryboardData) => {
        const sectionsWithContent = storyboard.sections.filter(s => {
          const wordCount = s.content ? s.content.split(/\s+/).length : 0;
          return wordCount >= this.criteria.minWordsPerSection;
        }).length;
        
        const score = (sectionsWithContent / storyboard.sections.length) * 100;
        
        return {
          isValid: score >= 70,
          score,
          message: `${sectionsWithContent}/${storyboard.sections.length} sections have adequate content`,
          suggestions: score < 70 ? ['Add more detail to each section'] : [],
          severity: score < 50 ? 'high' : score < 70 ? 'medium' : 'low',
        };
      },
    },
    {
      id: 'problem_solution_fit',
      name: 'Problem-Solution Fit',
      description: 'Solution directly addresses the identified problem',
      category: 'quality',
      weight: 0.25,
      validator: (storyboard: StoryboardData) => {
        const problemSection = storyboard.sections.find(s => s.type === 'problem');
        const solutionSection = storyboard.sections.find(s => s.type === 'solution');
        
        if (!problemSection?.content || !solutionSection?.content) {
          return {
            isValid: false,
            score: 0,
            message: 'Problem and solution sections are required',
            suggestions: ['Complete both problem and solution sections'],
            severity: 'high',
          };
        }
        
        // Simple keyword matching - in a real app, you'd use NLP
        const problemWords = problemSection.content.toLowerCase().split(/\s+/);
        const solutionWords = solutionSection.content.toLowerCase().split(/\s+/);
        const commonWords = problemWords.filter(word => solutionWords.includes(word));
        const score = Math.min((commonWords.length / Math.max(problemWords.length, solutionWords.length)) * 100, 100);
        
        return {
          isValid: score >= 30,
          score,
          message: `Problem-solution alignment: ${Math.round(score)}%`,
          suggestions: score < 30 ? ['Ensure your solution directly addresses the problem'] : [],
          severity: score < 20 ? 'high' : score < 30 ? 'medium' : 'low',
        };
      },
    },
    {
      id: 'customer_focus',
      name: 'Customer Focus',
      description: 'Clear identification of target customers',
      category: 'quality',
      weight: 0.15,
      validator: (storyboard: StoryboardData) => {
        const customerSection = storyboard.sections.find(s => s.type === 'customer');
        
        if (!customerSection?.content) {
          return {
            isValid: false,
            score: 0,
            message: 'Customer section is required',
            suggestions: ['Complete the customer section'],
            severity: 'high',
          };
        }
        
        const content = customerSection.content.toLowerCase();
        const hasDemographics = /\b(age|gender|income|location|education)\b/.test(content);
        const hasNeeds = /\b(need|want|problem|pain|desire)\b/.test(content);
        const hasSize = /\b(market|size|population|customers|users)\b/.test(content);
        
        const score = [hasDemographics, hasNeeds, hasSize].filter(Boolean).length * 33.33;
        
        return {
          isValid: score >= 60,
          score,
          message: `Customer section completeness: ${Math.round(score)}%`,
          suggestions: score < 60 ? ['Add customer demographics, needs, and market size'] : [],
          severity: score < 40 ? 'high' : score < 60 ? 'medium' : 'low',
        };
      },
    },
    {
      id: 'revenue_clarity',
      name: 'Revenue Clarity',
      description: 'Clear and realistic revenue model',
      category: 'quality',
      weight: 0.1,
      validator: (storyboard: StoryboardData) => {
        const revenueSection = storyboard.sections.find(s => s.type === 'revenue');
        
        if (!revenueSection?.content) {
          return {
            isValid: false,
            score: 0,
            message: 'Revenue section is required',
            suggestions: ['Complete the revenue section'],
            severity: 'high',
          };
        }
        
        const content = revenueSection.content.toLowerCase();
        const hasModel = /\b(subscription|one-time|commission|advertising|freemium)\b/.test(content);
        const hasPricing = /\b(price|cost|fee|charge|rate)\b/.test(content);
        const hasProjections = /\b(revenue|income|profit|earnings|forecast)\b/.test(content);
        
        const score = [hasModel, hasPricing, hasProjections].filter(Boolean).length * 33.33;
        
        return {
          isValid: score >= 60,
          score,
          message: `Revenue model clarity: ${Math.round(score)}%`,
          suggestions: score < 60 ? ['Specify revenue model, pricing, and projections'] : [],
          severity: score < 40 ? 'high' : score < 60 ? 'medium' : 'low',
        };
      },
    },
  ];

  async validateBusinessPlan(storyboard: StoryboardData): Promise<QualityScore> {
    const results = this.validationRules.map(rule => ({
      rule,
      result: rule.validator(storyboard),
    }));

    // Calculate category scores
    const completeness = this.calculateCategoryScore(results, 'completeness');
    const quality = this.calculateCategoryScore(results, 'quality');
    const structure = this.calculateCategoryScore(results, 'structure');
    const content = this.calculateCategoryScore(results, 'content');

    // Calculate overall score
    const overall = (completeness + quality + structure + content) / 4;

    // Determine readiness level
    const readinessLevel = this.determineReadinessLevel(overall);

    // Generate section breakdown
    const breakdown = this.generateSectionBreakdown(storyboard);

    // Generate recommendations
    const recommendations = this.generateRecommendations(results, overall);

    // Get Shark Tank evaluation from Groq
    let sharkTankScore: SharkTankScore | undefined;
    try {
      sharkTankScore = await groqEvaluationService.evaluateBusinessPlan({
        storyboard,
        language: 'en'
      });
    } catch (error) {
      console.error('Failed to get Groq evaluation:', error);
      // Continue without Shark Tank score
    }

    return {
      overall: Math.round(overall),
      completeness: Math.round(completeness),
      quality: Math.round(quality),
      structure: Math.round(structure),
      content: Math.round(content),
      breakdown,
      recommendations,
      readinessLevel,
      sharkTankScore,
    };
  }

  private calculateCategoryScore(results: any[], category: string): number {
    const categoryResults = results.filter(r => r.rule.category === category);
    if (categoryResults.length === 0) return 0;

    const totalWeight = categoryResults.reduce((sum, r) => sum + r.rule.weight, 0);
    const weightedScore = categoryResults.reduce((sum, r) => 
      sum + (r.result.score * r.rule.weight), 0
    );

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  private determineReadinessLevel(score: number): QualityScore['readinessLevel'] {
    if (score >= this.criteria.qualityThresholds.ready) return 'ready';
    if (score >= this.criteria.qualityThresholds.excellent) return 'excellent';
    if (score >= this.criteria.qualityThresholds.good) return 'good';
    if (score >= this.criteria.qualityThresholds.developing) return 'developing';
    return 'draft';
  }

  private generateSectionBreakdown(storyboard: StoryboardData): QualityScore['breakdown'] {
    return storyboard.sections.map(section => {
      const wordCount = section.content ? section.content.split(/\s+/).length : 0;
      const isComplete = section.isCompleted;
      const hasAdequateContent = wordCount >= this.criteria.minWordsPerSection;
      
      let score = 0;
      const issues: string[] = [];
      const suggestions: string[] = [];

      if (isComplete) score += 50;
      else issues.push('Section not marked as complete');

      if (hasAdequateContent) score += 30;
      else {
        issues.push('Insufficient content');
        suggestions.push(`Add at least ${this.criteria.minWordsPerSection} words`);
      }

      if (wordCount > 0) score += 20;
      else {
        issues.push('No content');
        suggestions.push('Add content to this section');
      }

      return {
        section: section.title,
        score: Math.min(score, 100),
        issues,
        suggestions,
      };
    });
  }

  private generateRecommendations(results: any[], overallScore: number): string[] {
    const recommendations: string[] = [];
    
    // High priority issues
    const highPriorityIssues = results.filter(r => r.result.severity === 'high');
    if (highPriorityIssues.length > 0) {
      recommendations.push('Address high-priority issues first');
    }

    // Specific recommendations based on low scores
    results.forEach(({ rule, result }) => {
      if (result.score < 50) {
        recommendations.push(...result.suggestions);
      }
    });

    // General recommendations based on overall score
    if (overallScore < 50) {
      recommendations.push('Focus on completing all sections with basic content');
    } else if (overallScore < 70) {
      recommendations.push('Improve content quality and detail');
    } else if (overallScore < 90) {
      recommendations.push('Polish and refine your business plan');
    } else {
      recommendations.push('Your business plan is ready for review!');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  calculateMetrics(storyboard: StoryboardData): BusinessPlanMetrics {
    const totalWords = storyboard.sections.reduce((total, section) => {
      return total + (section.content ? section.content.split(/\s+/).length : 0);
    }, 0);

    const averageWordsPerSection = storyboard.sections.length > 0 
      ? totalWords / storyboard.sections.length 
      : 0;

    const completionRate = storyboard.completionPercentage;

    return {
      totalWords,
      averageWordsPerSection: Math.round(averageWordsPerSection),
      completionRate,
      qualityScore: 0, // Will be calculated by validation
      lastUpdated: storyboard.updatedAt,
      timeSpent: 0, // Would be tracked in a real app
      feedbackReceived: 0, // Would be tracked in a real app
      revisions: 0, // Would be tracked in a real app
    };
  }

  getValidationCriteria(): ValidationCriteria {
    return this.criteria;
  }

  updateValidationCriteria(criteria: Partial<ValidationCriteria>): void {
    this.criteria = { ...this.criteria, ...criteria };
  }
}

export const validationService = new ValidationService();
