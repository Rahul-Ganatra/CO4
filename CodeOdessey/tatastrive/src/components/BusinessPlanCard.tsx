'use client';

import { BusinessPlan } from '@/types/mentor';

interface BusinessPlanCardProps {
  plan: BusinessPlan;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onPreview: () => void;
  onExport?: () => void;
}

export function BusinessPlanCard({ plan, selected, onSelect, onPreview, onExport }: BusinessPlanCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
      selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <h3 className="font-semibold text-gray-900 line-clamp-2">{plan.title}</h3>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
            {plan.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="font-medium">{plan.entrepreneur}</span>
          <span>•</span>
          <span>{plan.region}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Summary */}
        <p className="text-sm text-gray-700 line-clamp-3">{plan.summary}</p>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Quality Score</div>
            <div className={`font-semibold ${getQualityScoreColor(plan.qualityScore)}`}>
              {plan.qualityScore}/100
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Completion</div>
            <div className="font-semibold text-gray-900">{plan.completionPercentage}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${plan.completionPercentage}%` }}
          />
        </div>

        {/* Priority and Sector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Priority:</span>
            <span className={`text-sm font-medium ${getPriorityColor(plan.priority)}`}>
              {plan.priority.toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-gray-500">{plan.sector}</span>
        </div>

        {/* Strengths Preview */}
        {plan.strengths.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Key Strengths</div>
            <div className="flex flex-wrap gap-1">
              {plan.strengths.slice(0, 2).map((strength, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  {strength}
                </span>
              ))}
              {plan.strengths.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{plan.strengths.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Submitted {plan.submissionDate.toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
          >
            Preview
          </button>
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
            >
              Export
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
