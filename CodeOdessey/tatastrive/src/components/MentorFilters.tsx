'use client';

import { MentorFilters as MentorFiltersType } from '@/types/mentor';

interface MentorFiltersProps {
  filters: MentorFiltersType;
  onFiltersChange: (filters: MentorFiltersType) => void;
}

export function MentorFilters({ filters, onFiltersChange }: MentorFiltersProps) {
  const handleFilterChange = (key: keyof MentorFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      qualityScore: 'all',
      sector: 'all',
      region: 'all'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Quality Score Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Quality Score
          </label>
          <select
            value={filters.qualityScore}
            onChange={(e) => handleFilterChange('qualityScore', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Scores</option>
            <option value="high">High (80-100)</option>
            <option value="medium">Medium (60-79)</option>
            <option value="low">Low (0-59)</option>
          </select>
        </div>

        {/* Sector Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Sector
          </label>
          <select
            value={filters.sector}
            onChange={(e) => handleFilterChange('sector', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Sectors</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Healthcare">Healthcare</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Education">Education</option>
            <option value="Technology">Technology</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Services">Services</option>
          </select>
        </div>

        {/* Region Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Regions</option>
            <option value="Rural Maharashtra">Rural Maharashtra</option>
            <option value="Rural Karnataka">Rural Karnataka</option>
            <option value="Rural Gujarat">Rural Gujarat</option>
            <option value="Rural Tamil Nadu">Rural Tamil Nadu</option>
            <option value="Rural Rajasthan">Rural Rajasthan</option>
            <option value="Rural Uttar Pradesh">Rural Uttar Pradesh</option>
            <option value="Rural West Bengal">Rural West Bengal</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.status !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Status: {filters.status.replace('_', ' ')}
                <button
                  onClick={() => handleFilterChange('status', 'all')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.qualityScore !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Quality: {filters.qualityScore}
                <button
                  onClick={() => handleFilterChange('qualityScore', 'all')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.sector !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Sector: {filters.sector}
                <button
                  onClick={() => handleFilterChange('sector', 'all')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.region !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Region: {filters.region}
                <button
                  onClick={() => handleFilterChange('region', 'all')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
