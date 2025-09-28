'use client';

import { useState } from 'react';

interface BatchOperationsProps {
  selectedCount: number;
  onBatchAction: (action: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function BatchOperations({ 
  selectedCount, 
  onBatchAction, 
  onSelectAll, 
  onDeselectAll 
}: BatchOperationsProps) {
  const [showActions, setShowActions] = useState(false);

  const batchActions = [
    { id: 'approve', label: 'Approve', color: 'bg-green-600 hover:bg-green-700' },
    { id: 'reject', label: 'Reject', color: 'bg-red-600 hover:bg-red-700' },
    { id: 'request_revision', label: 'Request Revision', color: 'bg-yellow-600 hover:bg-yellow-700' },
    { id: 'assign_high_priority', label: 'Mark High Priority', color: 'bg-purple-600 hover:bg-purple-700' },
    { id: 'assign_medium_priority', label: 'Mark Medium Priority', color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'assign_low_priority', label: 'Mark Low Priority', color: 'bg-gray-600 hover:bg-gray-700' }
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-900">
              {selectedCount} plan{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Select All
            </button>
            <span className="text-blue-300">•</span>
            <button
              onClick={onDeselectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowActions(!showActions)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Batch Actions
            <svg 
              className={`ml-2 h-4 w-4 inline transition-transform ${showActions ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {showActions && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {batchActions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  onBatchAction(action.id);
                  setShowActions(false);
                }}
                className={`px-3 py-2 text-white text-sm font-medium rounded-md transition-colors ${action.color}`}
              >
                {action.label}
              </button>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-blue-700">
            <p>⚠️ Batch actions will be applied to all selected business plans. This action cannot be undone.</p>
          </div>
        </div>
      )}
    </div>
  );
}
