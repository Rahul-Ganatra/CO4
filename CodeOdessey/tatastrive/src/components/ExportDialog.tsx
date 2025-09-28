'use client';

import { useState } from 'react';
import { BusinessPlan } from '@/types/mentor';
import { ExportService, ExportOptions } from '@/services/exportService';

interface ExportDialogProps {
  plan: BusinessPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ plan, isOpen, onClose }: ExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeFeedback: true,
    includeMetrics: true,
    includeSections: true
  });
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !plan) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await ExportService.exportBusinessPlan(plan, options);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Export Business Plan</h2>
          <p className="text-sm text-gray-600 mt-1">{plan.title}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="space-y-2">
              {[
                { value: 'pdf', label: 'PDF Document', description: 'Professional PDF format' },
                { value: 'docx', label: 'Word Document', description: 'Microsoft Word format' },
                { value: 'txt', label: 'Text File', description: 'Plain text format' }
              ].map((format) => (
                <label key={format.value} className="flex items-start">
                  <input
                    type="radio"
                    value={format.value}
                    checked={options.format === format.value}
                    onChange={(e) => handleOptionChange('format', e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{format.label}</div>
                    <div className="text-xs text-gray-500">{format.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Content Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Include in Export
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeSections}
                  onChange={(e) => handleOptionChange('includeSections', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-900">Business Plan Sections</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeFeedback}
                  onChange={(e) => handleOptionChange('includeFeedback', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-900">AI & Mentor Feedback</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeMetrics}
                  onChange={(e) => handleOptionChange('includeMetrics', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-900">Metrics & Analytics</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Export Preview</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• {plan.title}</div>
              <div>• Basic information & summary</div>
              {options.includeSections && <div>• Business plan sections</div>}
              {options.includeFeedback && <div>• AI & mentor feedback</div>}
              {options.includeMetrics && <div>• Metrics & analytics</div>}
              <div>• Generated by TataStrive Platform</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              'Export'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
