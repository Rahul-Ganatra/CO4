'use client';

import { useState, useEffect } from 'react';
import { BusinessPlanCard } from './BusinessPlanCard';
import { MentorFilters } from './MentorFilters';
import { MentorSearch } from './MentorSearch';
import { BatchOperations } from './BatchOperations';
import { BusinessPlanPreview } from './BusinessPlanPreview';
import { ExportDialog } from './ExportDialog';
import { BusinessPlan, MentorFilters as MentorFiltersType } from '@/types/mentor';
import { mentorService } from '@/services/mentorService';

export function MentorDashboard() {
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<BusinessPlan[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<MentorFiltersType>({
    status: 'all',
    qualityScore: 'all',
    sector: 'all',
    region: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPlan, setPreviewPlan] = useState<BusinessPlan | null>(null);
  const [exportPlan, setExportPlan] = useState<BusinessPlan | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'quality' | 'priority'>('priority');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load business plans from Firestore
  useEffect(() => {
    const loadBusinessPlans = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        console.log('Starting to load business plans from Firestore...');
        
        // Test connection first
        const connectionTest = await mentorService.testConnection();
        console.log('Firestore connection test result:', connectionTest);
        
        const plans = await mentorService.getAllStoryboards();
        console.log('Successfully loaded business plans:', plans);
        
        setBusinessPlans(plans);
        setFilteredPlans(plans);
        console.log('Loaded business plans from Firestore:', plans.length);
      } catch (error) {
        console.error('Failed to load business plans:', error);
        setLoadError(`Failed to load business plans: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setBusinessPlans([]);
        setFilteredPlans([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessPlans();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = businessPlans;

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(plan => plan.status === filters.status);
    }
    if (filters.qualityScore !== 'all') {
      const scoreRanges = {
        'high': [80, 100],
        'medium': [60, 79],
        'low': [0, 59]
      };
      const [min, max] = scoreRanges[filters.qualityScore as keyof typeof scoreRanges];
      filtered = filtered.filter(plan => plan.qualityScore >= min && plan.qualityScore <= max);
    }
    if (filters.sector !== 'all') {
      filtered = filtered.filter(plan => plan.sector === filters.sector);
    }
    if (filters.region !== 'all') {
      filtered = filtered.filter(plan => plan.region === filters.region);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(plan => 
        plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.entrepreneur.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.submissionDate.getTime() - a.submissionDate.getTime();
        case 'quality':
          return b.qualityScore - a.qualityScore;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    setFilteredPlans(filtered);
  }, [businessPlans, filters, searchQuery, sortBy]);

  const handlePlanSelect = (planId: string, selected: boolean) => {
    const newSelected = new Set(selectedPlans);
    if (selected) {
      newSelected.add(planId);
    } else {
      newSelected.delete(planId);
    }
    setSelectedPlans(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedPlans(new Set(filteredPlans.map(plan => plan.id)));
    } else {
      setSelectedPlans(new Set());
    }
  };

  const handleBatchAction = (action: string) => {
    // TODO: Implement batch actions
    console.log(`Batch action: ${action} on plans:`, Array.from(selectedPlans));
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const plans = await mentorService.getAllStoryboards();
      setBusinessPlans(plans);
      setFilteredPlans(plans);
      console.log('Refreshed business plans from Firestore:', plans.length);
    } catch (error) {
      console.error('Failed to refresh business plans:', error);
      setLoadError('Failed to refresh business plans. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business plans...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Business Plans</h3>
        <p className="text-gray-600 mb-6">{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Business Plans ({filteredPlans.length})
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'quality' | 'priority')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="priority">Priority</option>
              <option value="quality">Quality Score</option>
              <option value="date">Submission Date</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <MentorSearch 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            title="Refresh business plans"
          >
            <span>🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <MentorFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Batch Operations */}
      {selectedPlans.size > 0 && (
        <BatchOperations
          selectedCount={selectedPlans.size}
          onBatchAction={handleBatchAction}
          onSelectAll={() => handleSelectAll(true)}
          onDeselectAll={() => handleSelectAll(false)}
        />
      )}

      {/* Business Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <BusinessPlanCard
            key={plan.id}
            plan={plan}
            selected={selectedPlans.has(plan.id)}
            onSelect={(selected) => handlePlanSelect(plan.id, selected)}
            onPreview={() => setPreviewPlan(plan)}
            onExport={() => setExportPlan(plan)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No business plans found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || Object.values(filters).some(f => f !== 'all')
              ? 'Try adjusting your filters or search terms'
              : 'No storyboards have been created by entrepreneurs yet'
            }
          </p>
          {!searchQuery && !Object.values(filters).some(f => f !== 'all') && (
            <div className="text-sm text-gray-500">
              <p>Storyboards will appear here once entrepreneurs start creating business plans.</p>
              <p>Make sure entrepreneurs are signed in and creating storyboards in the storyboard section.</p>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewPlan && (
        <BusinessPlanPreview
          plan={previewPlan}
          onClose={() => setPreviewPlan(null)}
        />
      )}

      {/* Export Modal */}
      {exportPlan && (
        <ExportDialog
          plan={exportPlan}
          isOpen={!!exportPlan}
          onClose={() => setExportPlan(null)}
        />
      )}
    </div>
  );
}
