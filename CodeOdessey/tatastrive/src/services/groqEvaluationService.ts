import Groq from 'groq-sdk';
import { StoryboardData } from '@/types/storyboard';

// Initialize Groq client with proper error handling
const getGroqClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Environment check:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyStart: apiKey?.substring(0, 10) || 'none'
    });
  }
  
  if (!apiKey || apiKey === 'your-api-key-here' || apiKey === 'your-groq-api-key-here') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('NEXT_PUBLIC_GROQ_API_KEY not found or invalid - using fallback evaluation');
    }
    return null;
  }
  
  try {
    return new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Only for development
    });
  } catch (error) {
    console.error('Failed to initialize Groq client:', error);
    return null;
  }
};

export interface SharkTankScore {
  overall: number; // 0-100
  uniqueness: number; // 0-100
  feasibility: number; // 0-100
  marketPotential: number; // 0-100
  scalability: number; // 0-100
  teamExecution: number; // 0-100
  financialViability: number; // 0-100
  innovation: number; // 0-100
  competitiveAdvantage: number; // 0-100
  riskAssessment: number; // 0-100
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
}

export interface EvaluationRequest {
  storyboard: StoryboardData;
  language?: string;
}

class GroqEvaluationService {
  private evaluationCache = new Map<string, SharkTankScore>();

  async evaluateBusinessPlan(request: EvaluationRequest): Promise<SharkTankScore> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request.storyboard);
      const cachedResult = this.evaluationCache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Generate evaluation using Groq
      const evaluation = await this.callGroqAPI(request);
      
      // Cache the result
      this.evaluationCache.set(cacheKey, evaluation);
      
      return evaluation;
    } catch (error) {
      console.error('Groq evaluation failed:', error);
      return this.getFallbackEvaluation(request.storyboard);
    }
  }

  private async callGroqAPI(request: EvaluationRequest): Promise<SharkTankScore> {
    const groq = getGroqClient();
    
    if (!groq) {
      console.log('Groq client not available, using fallback evaluation');
      return this.getFallbackEvaluation(request.storyboard);
    }
    
    const prompt = this.buildEvaluationPrompt(request);
    
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a Shark Tank judge evaluating a business plan. You must provide scores (0-100) for each category and detailed feedback. Be critical but constructive. Focus on real-world business viability, market potential, and execution feasibility.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '';
    return this.parseGroqResponse(content);
  }

  private buildEvaluationPrompt(request: EvaluationRequest): string {
    const { storyboard, language = 'en' } = request;
    
    // Extract content from sections
    const sections = storyboard.sections.reduce((acc, section) => {
      acc[section.type] = section.content || '';
      return acc;
    }, {} as Record<string, string>);

    return `Evaluate this business plan as a Shark Tank judge. Provide scores (0-100) and detailed feedback for each category.

BUSINESS PLAN DETAILS:
Title: ${storyboard.title}
Problem: ${sections.problem || 'Not provided'}
Solution: ${sections.solution || 'Not provided'}
Target Customer: ${sections.customer || 'Not provided'}
Revenue Model: ${sections.revenue || 'Not provided'}
Risks: ${sections.risks || 'Not provided'}

EVALUATION CRITERIA:
1. UNIQUENESS (0-100): How unique and innovative is this idea? Is it solving a real problem in a new way?
2. FEASIBILITY (0-100): How realistic is it to execute this business? Consider resources, skills, and market conditions.
3. MARKET POTENTIAL (0-100): How large is the addressable market? Is there real demand for this solution?
4. SCALABILITY (0-100): Can this business grow significantly? What are the growth limitations?
5. TEAM EXECUTION (0-100): Based on the plan quality, how well can the team execute? (Assess based on plan detail and thoughtfulness)
6. FINANCIAL VIABILITY (0-100): Is the revenue model realistic? Are the financial projections sound?
7. INNOVATION (0-100): How innovative is the approach? Does it bring something new to the market?
8. COMPETITIVE ADVANTAGE (0-100): What makes this better than existing solutions? What's the moat?
9. RISK ASSESSMENT (0-100): How well have risks been identified and addressed?

RESPONSE FORMAT (JSON):
{
  "overall": 75,
  "uniqueness": 80,
  "feasibility": 70,
  "marketPotential": 85,
  "scalability": 60,
  "teamExecution": 75,
  "financialViability": 70,
  "innovation": 80,
  "competitiveAdvantage": 65,
  "riskAssessment": 70,
  "readinessLevel": "good",
  "detailedFeedback": {
    "strengths": ["Clear problem identification", "Innovative solution approach"],
    "weaknesses": ["Limited market research", "Unclear revenue projections"],
    "recommendations": ["Conduct market validation", "Develop detailed financial model"],
    "investmentReadiness": "Needs more work on financial projections and market validation before seeking investment"
  },
  "categoryBreakdown": [
    {
      "category": "Uniqueness",
      "score": 80,
      "feedback": "The solution addresses a real problem in a novel way, but needs more differentiation from competitors"
    }
  ]
}

Be critical but fair. Consider this is for rural entrepreneurs, so adjust expectations accordingly but maintain business standards.`;
  }

  private parseGroqResponse(content: string): SharkTankScore {
    try {
      const parsed = JSON.parse(content);
      
      // Validate and ensure all required fields exist
      const evaluation: SharkTankScore = {
        overall: Math.max(0, Math.min(100, parsed.overall || 0)),
        uniqueness: Math.max(0, Math.min(100, parsed.uniqueness || 0)),
        feasibility: Math.max(0, Math.min(100, parsed.feasibility || 0)),
        marketPotential: Math.max(0, Math.min(100, parsed.marketPotential || 0)),
        scalability: Math.max(0, Math.min(100, parsed.scalability || 0)),
        teamExecution: Math.max(0, Math.min(100, parsed.teamExecution || 0)),
        financialViability: Math.max(0, Math.min(100, parsed.financialViability || 0)),
        innovation: Math.max(0, Math.min(100, parsed.innovation || 0)),
        competitiveAdvantage: Math.max(0, Math.min(100, parsed.competitiveAdvantage || 0)),
        riskAssessment: Math.max(0, Math.min(100, parsed.riskAssessment || 0)),
        readinessLevel: this.determineReadinessLevel(parsed.overall || 0),
        detailedFeedback: {
          strengths: Array.isArray(parsed.detailedFeedback?.strengths) ? parsed.detailedFeedback.strengths : [],
          weaknesses: Array.isArray(parsed.detailedFeedback?.weaknesses) ? parsed.detailedFeedback.weaknesses : [],
          recommendations: Array.isArray(parsed.detailedFeedback?.recommendations) ? parsed.detailedFeedback.recommendations : [],
          investmentReadiness: parsed.detailedFeedback?.investmentReadiness || 'Needs evaluation'
        },
        categoryBreakdown: Array.isArray(parsed.categoryBreakdown) ? parsed.categoryBreakdown : []
      };

      return evaluation;
    } catch (error) {
      console.error('Failed to parse Groq response:', error);
      throw new Error('Invalid response format from Groq API');
    }
  }

  private determineReadinessLevel(overallScore: number): SharkTankScore['readinessLevel'] {
    if (overallScore >= 90) return 'ready';
    if (overallScore >= 80) return 'excellent';
    if (overallScore >= 60) return 'good';
    if (overallScore >= 40) return 'developing';
    return 'draft';
  }

  private getFallbackEvaluation(storyboard: StoryboardData): SharkTankScore {
    // Simple fallback evaluation based on content completeness
    const sections = storyboard.sections;
    const completedSections = sections.filter(s => s.content && s.content.trim().length > 50).length;
    const totalSections = sections.length;
    const completionRate = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;
    
    const baseScore = Math.min(completionRate * 0.8, 70); // Cap at 70 for fallback
    
    return {
      overall: Math.round(baseScore),
      uniqueness: Math.round(baseScore * 0.9),
      feasibility: Math.round(baseScore * 0.8),
      marketPotential: Math.round(baseScore * 0.7),
      scalability: Math.round(baseScore * 0.6),
      teamExecution: Math.round(baseScore * 0.8),
      financialViability: Math.round(baseScore * 0.7),
      innovation: Math.round(baseScore * 0.9),
      competitiveAdvantage: Math.round(baseScore * 0.6),
      riskAssessment: Math.round(baseScore * 0.7),
      readinessLevel: this.determineReadinessLevel(baseScore),
      detailedFeedback: {
        strengths: ['Good progress on business plan development'],
        weaknesses: ['Needs more detailed analysis'],
        recommendations: ['Complete all sections with detailed content', 'Conduct market research'],
        investmentReadiness: 'Plan needs more development before investment consideration'
      },
      categoryBreakdown: [
        {
          category: 'Overall Assessment',
          score: Math.round(baseScore),
          feedback: 'Basic business plan structure in place, needs more detailed content and analysis'
        }
      ]
    };
  }

  private generateCacheKey(storyboard: StoryboardData): string {
    const content = storyboard.sections.map(s => s.content).join('|');
    return `${storyboard.id}-${this.hashContent(content)}`;
  }

  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  clearCache(): void {
    this.evaluationCache.clear();
  }
}

export const groqEvaluationService = new GroqEvaluationService();
