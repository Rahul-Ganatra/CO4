'use client';

import { BusinessPlan } from '@/types/mentor';

interface BusinessPlanPreviewProps {
  plan: BusinessPlan;
  onClose: () => void;
}

export function BusinessPlanPreview({ plan, onClose }: BusinessPlanPreviewProps) {
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
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{plan.title}</h2>
            <p className="text-sm text-gray-600">by {plan.entrepreneur} • {plan.region}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Status and Priority */}
          <div className="flex items-center gap-4 mb-6">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(plan.status)}`}>
              {plan.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(plan.priority)}`}>
              {plan.priority.toUpperCase()} PRIORITY
            </span>
            <span className="text-sm text-gray-600">
              Quality Score: <span className="font-semibold">{plan.qualityScore}/100</span>
            </span>
            <span className="text-sm text-gray-600">
              Completion: <span className="font-semibold">{plan.completionPercentage}%</span>
            </span>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
            <p className="text-gray-700 leading-relaxed">{plan.summary}</p>
          </div>

          {/* Business Plan Sections */}
          {plan.sections && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Plan Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Problem Statement</h4>
                  <p className="text-gray-700 text-sm">{plan.sections.problem || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Solution</h4>
                  <p className="text-gray-700 text-sm">{plan.sections.solution || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Target Customer</h4>
                  <p className="text-gray-700 text-sm">{plan.sections.customer || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Revenue Model</h4>
                  <p className="text-gray-700 text-sm">{plan.sections.revenue || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Risk Assessment</h4>
                  <p className="text-gray-700 text-sm">{plan.sections.risks || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Strengths */}
          {plan.strengths.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Key Strengths</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {plan.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{strength}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Areas for Improvement */}
          {plan.areasForImprovement.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Areas for Improvement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {plan.areasForImprovement.map((area, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Feedback */}
          {plan.feedback?.ai && plan.feedback.ai.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">AI Feedback</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                {plan.feedback.ai.map((feedback, index) => (
                  <p key={index} className="text-sm text-blue-800 mb-2 last:mb-0">
                    {feedback}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Mentor Feedback */}
          {plan.feedback?.mentor && plan.feedback.mentor.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Mentor Feedback</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                {plan.feedback.mentor.map((feedback, index) => (
                  <p key={index} className="text-sm text-green-800 mb-2 last:mb-0">
                    {feedback}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          {plan.metrics && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Time Spent</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.floor(plan.metrics.timeSpent / 60)}h {plan.metrics.timeSpent % 60}m
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Revisions</div>
                  <div className="text-lg font-semibold text-gray-900">{plan.metrics.revisions}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Last Updated</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {plan.metrics.lastUpdated.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Submitted on {plan.submissionDate.toLocaleDateString()}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Take Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
