'use client';

import { useState, useEffect } from 'react';
import { Feedback } from '@/services/llmFeedbackService';

interface FeedbackDisplayProps {
  sectionId: string;
  content: string;
  sectionType: string;
  onFeedbackGenerated?: (feedback: Feedback) => void;
}

export default function FeedbackDisplay({ 
  sectionId, 
  content, 
  sectionType, 
  onFeedbackGenerated 
}: FeedbackDisplayProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (content.trim().length > 20) {
      generateFeedback();
    }
  }, [content, sectionId]);

  const generateFeedback = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const { llmFeedbackService } = await import('@/services/llmFeedbackService');
      const newFeedback = await llmFeedbackService.generateFeedback({
        sectionId,
        sectionType,
        content,
        language: 'en', // Could be user preference
      });

      setFeedback(newFeedback);
      setShowFeedback(true);
      
      if (onFeedbackGenerated) {
        onFeedbackGenerated(newFeedback);
      }
    } catch (err) {
      setError('Failed to generate feedback. Please try again.');
      console.error('Feedback generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFeedbackIcon = (type: Feedback['type']) => {
    switch (type) {
      case 'encouragement':
        return '💪';
      case 'suggestion':
        return '💡';
      case 'improvement':
        return '🔧';
      case 'celebration':
        return '🎉';
      default:
        return '💬';
    }
  };

  const getFeedbackColor = (type: Feedback['type']) => {
    switch (type) {
      case 'encouragement':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'suggestion':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'improvement':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'celebration':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (!showFeedback && !isLoading) {
    return null;
  }

  return (
    <div className="mt-4">
      {isLoading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Generating feedback...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {feedback && (
        <div className={`border rounded-lg p-4 ${getFeedbackColor(feedback.type)}`}>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">{getFeedbackIcon(feedback.type)}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold capitalize">
                  {feedback.type} Feedback
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {Math.round(feedback.confidence * 100)}% confidence
                  </span>
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <p className="text-sm mb-3">{feedback.content}</p>
              
              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-xs font-semibold mb-2">Suggestions:</h5>
                  <ul className="text-xs space-y-1">
                    {feedback.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-gray-400">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {feedback.timestamp.toLocaleTimeString()}
                </span>
                <button
                  onClick={generateFeedback}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Get new feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
