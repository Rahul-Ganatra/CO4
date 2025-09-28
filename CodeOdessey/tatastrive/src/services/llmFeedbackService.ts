import OpenAI from 'openai';

// Initialize OpenAI client only if API key is available
const hasValidApiKey = process.env.OPENAI_API_KEY && 
                      process.env.OPENAI_API_KEY !== 'your-api-key-here' && 
                      process.env.OPENAI_API_KEY !== 'your-openai-api-key-here' &&
                      process.env.OPENAI_API_KEY.length > 10;

const openai = hasValidApiKey ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for development
}) : null;

// Log API key status only in development
if (process.env.NODE_ENV === 'development' && !hasValidApiKey) {
  console.warn('OpenAI API key not available, using fallback feedback');
}

export interface Feedback {
  id: string;
  sectionId: string;
  content: string;
  type: 'encouragement' | 'suggestion' | 'improvement' | 'celebration';
  confidence: number;
  timestamp: Date;
  isPositive: boolean;
  suggestions?: string[];
}

export interface FeedbackRequest {
  sectionId: string;
  sectionType: string;
  content: string;
  previousFeedback?: Feedback[];
  language?: string;
}

class LLMFeedbackService {
  private feedbackCache = new Map<string, Feedback[]>();
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : true;

  constructor() {
    // Listen for online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  async generateFeedback(request: FeedbackRequest): Promise<Feedback> {
    try {
      // Check if we have cached feedback for this content
      const cacheKey = `${request.sectionId}-${this.hashContent(request.content)}`;
      const cachedFeedback = this.feedbackCache.get(cacheKey);
      
      if (cachedFeedback && cachedFeedback.length > 0) {
        return cachedFeedback[0];
      }

      // Generate new feedback
      const feedback = await this.callLLM(request);
      
      // Cache the feedback
      if (!this.feedbackCache.has(cacheKey)) {
        this.feedbackCache.set(cacheKey, []);
      }
      this.feedbackCache.get(cacheKey)!.push(feedback);

      return feedback;
    } catch (error) {
      console.error('LLM feedback generation failed:', error);
      return this.getFallbackFeedback(request);
    }
  }

  private async callLLM(request: FeedbackRequest): Promise<Feedback> {
    if (!this.isOnline) {
      return this.getOfflineFeedback(request);
    }

    // If no valid API key, use fallback feedback
    if (!openai || !hasValidApiKey) {
      console.log('OpenAI API key not available, using fallback feedback');
      return this.getFallbackFeedback(request);
    }

    const prompt = this.buildPrompt(request);
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an encouraging business mentor helping rural entrepreneurs develop their business plans. 
            Always start with positive reinforcement, then provide constructive suggestions. 
            Use simple, encouraging language that builds confidence. 
            Focus on strengths first, then gently suggest improvements.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || '';
      return this.parseLLMResponse(content, request);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getFallbackFeedback(request);
    }
  }

  private buildPrompt(request: FeedbackRequest): string {
    const { sectionType, content, previousFeedback, language = 'en' } = request;
    
    let prompt = `Please provide encouraging feedback for a business plan section about "${sectionType}".\n\n`;
    prompt += `Content: "${content}"\n\n`;
    
    if (previousFeedback && previousFeedback.length > 0) {
      prompt += `Previous feedback given: ${previousFeedback.map(f => f.content).join(', ')}\n\n`;
    }
    
    prompt += `Please provide:\n`;
    prompt += `1. Start with something positive about their work\n`;
    prompt += `2. Give 1-2 specific suggestions for improvement\n`;
    prompt += `3. End with encouragement\n`;
    prompt += `Keep it brief (under 100 words) and encouraging. Use simple language.`;
    
    if (language !== 'en') {
      prompt += `\n\nRespond in ${language} language.`;
    }
    
    return prompt;
  }

  private parseLLMResponse(content: string, request: FeedbackRequest): Feedback {
    // Simple parsing - in a real app, you'd want more sophisticated parsing
    const isPositive = content.toLowerCase().includes('great') || 
                      content.toLowerCase().includes('excellent') || 
                      content.toLowerCase().includes('good') ||
                      content.toLowerCase().includes('well done');
    
    const type = isPositive ? 'encouragement' : 'suggestion';
    
    return {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sectionId: request.sectionId,
      content: content.trim(),
      type,
      confidence: 0.8,
      timestamp: new Date(),
      isPositive,
      suggestions: this.extractSuggestions(content),
    };
  }

  private extractSuggestions(content: string): string[] {
    // Simple suggestion extraction - look for bullet points or numbered lists
    const suggestions: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.match(/^\d+\.|^[-*•]/)) {
        suggestions.push(line.replace(/^\d+\.|^[-*•]\s*/, '').trim());
      }
    }
    
    return suggestions;
  }

  private getFallbackFeedback(request: FeedbackRequest): Feedback {
    const fallbackMessages = {
      problem: "Great start on identifying the problem! Consider adding more specific details about who experiences this problem and how often.",
      solution: "Nice work on your solution! Try to explain how your solution is different from existing alternatives.",
      customer: "Good thinking about your customers! Consider adding more details about their demographics and needs.",
      revenue: "Good start on your revenue model! Think about different ways you could make money from your business.",
      risks: "Smart to think about risks! Consider adding specific strategies for how you'll address each risk.",
    };

    const message = fallbackMessages[request.sectionType as keyof typeof fallbackMessages] || 
                   "Keep up the great work! Your business plan is taking shape nicely.";

    return {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sectionId: request.sectionId,
      content: message,
      type: 'encouragement',
      confidence: 0.6,
      timestamp: new Date(),
      isPositive: true,
    };
  }

  private getOfflineFeedback(request: FeedbackRequest): Feedback {
    const offlineMessages = [
      "Great progress! Keep working on this section.",
      "You're doing well! Consider adding more details.",
      "Nice work! Think about how this connects to other parts of your plan.",
      "Good start! Try to be more specific about your ideas.",
      "Excellent thinking! Consider the practical aspects of your idea.",
    ];

    const randomMessage = offlineMessages[Math.floor(Math.random() * offlineMessages.length)];

    return {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sectionId: request.sectionId,
      content: randomMessage,
      type: 'encouragement',
      confidence: 0.5,
      timestamp: new Date(),
      isPositive: true,
    };
  }

  private hashContent(content: string): string {
    // Simple hash function for caching
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  async getFeedbackHistory(sectionId: string): Promise<Feedback[]> {
    const allFeedback: Feedback[] = [];
    for (const feedbacks of this.feedbackCache.values()) {
      allFeedback.push(...feedbacks.filter(f => f.sectionId === sectionId));
    }
    return allFeedback.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  clearCache(): void {
    this.feedbackCache.clear();
  }
}

export const llmFeedbackService = new LLMFeedbackService();
