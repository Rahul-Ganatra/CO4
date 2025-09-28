'use client';

import { useState, useEffect } from 'react';
import { QualityScore, BusinessPlanMetrics } from '@/types/validation';
import { StoryboardData } from '@/types/storyboard';
import { validationService } from '@/services/validationService';

interface QualityScoringProps {
  storyboardData: StoryboardData;
  onScoreUpdate?: (score: QualityScore) => void;
}

export default function QualityScoring({ storyboardData, onScoreUpdate }: QualityScoringProps) {
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
  const [metrics, setMetrics] = useState<BusinessPlanMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    calculateScores();
  }, [storyboardData]);

  const calculateScores = async () => {
    setIsLoading(true);
    try {
      const score = await validationService.validateBusinessPlan(storyboardData);
      const planMetrics = validationService.calculateMetrics(storyboardData);
      
      setQualityScore(score);
      setMetrics(planMetrics);
      
      if (onScoreUpdate) {
        onScoreUpdate(score);
      }
    } catch (error) {
      console.error('Failed to calculate quality scores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReadinessColor = (level: QualityScore['readinessLevel']) => {
    switch (level) {
      case 'draft': return 'text-red-600 bg-red-50 border-red-200';
      case 'developing': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'good': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'excellent': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ready': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getReadinessIcon = (level: QualityScore['readinessLevel']) => {
    switch (level) {
      case 'draft': return '📝';
      case 'developing': return '🚧';
      case 'good': return '👍';
      case 'excellent': return '⭐';
      case 'ready': return '🎉';
      default: return '📊';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!qualityScore || !metrics) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quality Assessment
      </h3>

      {/* Overall Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Score</span>
          <span className="text-2xl font-bold text-blue-600">
            {qualityScore.overall}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${qualityScore.overall}%` }}
          />
        </div>
      </div>

      {/* Readiness Level */}
      <div className={`border rounded-lg p-4 mb-6 ${getReadinessColor(qualityScore.readinessLevel)}`}>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getReadinessIcon(qualityScore.readinessLevel)}</span>
          <div>
            <div className="font-semibold capitalize">
              {qualityScore.readinessLevel} Level
            </div>
            <div className="text-sm opacity-75">
              {qualityScore.readinessLevel === 'draft' && 'Just getting started - keep building!'}
              {qualityScore.readinessLevel === 'developing' && 'Making good progress - keep going!'}
              {qualityScore.readinessLevel === 'good' && 'Looking solid - some refinements needed!'}
              {qualityScore.readinessLevel === 'excellent' && 'Almost there - just a few tweaks!'}
              {qualityScore.readinessLevel === 'ready' && 'Ready for mentor review!'}
            </div>
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {qualityScore.completeness}%
          </div>
          <div className="text-sm text-gray-600">Completeness</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {qualityScore.quality}%
          </div>
          <div className="text-sm text-gray-600">Quality</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">
            {qualityScore.structure}%
          </div>
          <div className="text-sm text-gray-600">Structure</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">
            {qualityScore.content}%
          </div>
          <div className="text-sm text-gray-600">Content</div>
        </div>
      </div>

      {/* Shark Tank Evaluation */}
      {qualityScore.sharkTankScore && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🦈</span>
            <h3 className="text-lg font-semibold text-gray-900">Shark Tank Evaluation</h3>
          </div>
          
          {/* Overall Shark Tank Score */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-blue-600">
              {qualityScore.sharkTankScore.overall}%
            </div>
            <div className="text-sm text-gray-600">Investment Readiness Score</div>
          </div>

          {/* Shark Tank Category Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-sm font-bold text-green-600">
                {qualityScore.sharkTankScore.uniqueness}%
              </div>
              <div className="text-xs text-gray-600">Uniqueness</div>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-sm font-bold text-blue-600">
                {qualityScore.sharkTankScore.feasibility}%
              </div>
              <div className="text-xs text-gray-600">Feasibility</div>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-sm font-bold text-purple-600">
                {qualityScore.sharkTankScore.marketPotential}%
              </div>
              <div className="text-xs text-gray-600">Market Potential</div>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-sm font-bold text-orange-600">
                {qualityScore.sharkTankScore.scalability}%
              </div>
              <div className="text-xs text-gray-600">Scalability</div>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-sm font-bold text-red-600">
                {qualityScore.sharkTankScore.financialViability}%
              </div>
              <div className="text-xs text-gray-600">Financial Viability</div>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-sm font-bold text-indigo-600">
                {qualityScore.sharkTankScore.innovation}%
              </div>
              <div className="text-xs text-gray-600">Innovation</div>
            </div>
          </div>

          {/* Investment Readiness */}
          <div className="bg-white p-3 rounded border mb-3">
            <div className="text-sm font-semibold text-gray-800 mb-1">Investment Readiness:</div>
            <div className="text-sm text-gray-700">{qualityScore.sharkTankScore.detailedFeedback.investmentReadiness}</div>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {qualityScore.sharkTankScore.detailedFeedback.strengths.length > 0 && (
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <div className="text-sm font-semibold text-green-800 mb-2">💪 Strengths</div>
                <ul className="text-sm text-green-700 space-y-1">
                  {qualityScore.sharkTankScore.detailedFeedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {qualityScore.sharkTankScore.detailedFeedback.weaknesses.length > 0 && (
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <div className="text-sm font-semibold text-red-800 mb-2">⚠️ Areas to Improve</div>
                <ul className="text-sm text-red-700 space-y-1">
                  {qualityScore.sharkTankScore.detailedFeedback.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Breakdown */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">
          Section Analysis
        </h4>
        <div className="space-y-2">
          {qualityScore.breakdown.map((section, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <div className="font-medium text-sm">{section.section}</div>
                {section.issues.length > 0 && (
                  <div className="text-xs text-red-600">
                    {section.issues.join(', ')}
                  </div>
                )}
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {section.score}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {qualityScore.recommendations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            Recommendations
          </h4>
          <ul className="space-y-1">
            {qualityScore.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metrics */}
      <div className="border-t pt-4">
        <h4 className="text-md font-semibold text-gray-900 mb-3">
          Plan Metrics
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Total Words</div>
            <div className="font-semibold">{metrics.totalWords.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-600">Avg per Section</div>
            <div className="font-semibold">{metrics.averageWordsPerSection}</div>
          </div>
          <div>
            <div className="text-gray-600">Completion</div>
            <div className="font-semibold">{metrics.completionRate}%</div>
          </div>
          <div>
            <div className="text-gray-600">Last Updated</div>
            <div className="font-semibold">
              {metrics.lastUpdated.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
