'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import StoryboardSections from './StoryboardSections';
import ProgressTracker from './ProgressTracker';
import QualityScoring from './QualityScoring';
import StoryboardTitleEditor from './StoryboardTitleEditor';
import AddCustomSection from './AddCustomSection';
import { StoryboardData, StoryboardSection as SectionType, STORYBOARD_SECTIONS } from '@/types/storyboard';
import { offlineStorage } from '@/services/offlineStorage';
import { storyboardService } from '@/services/storyboardService';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressData } from '@/types/gamification';
import { QualityScore } from '@/types/validation';
import { ExportDialog } from './ExportDialog';
import { BusinessPlan } from '@/types/mentor';

interface StoryboardBuilderProps {
  data?: StoryboardData;
  onSave?: (data: StoryboardData) => void;
}

export default function StoryboardBuilder({ data, onSave }: StoryboardBuilderProps) {
  const { user } = useAuth();
  const [storyboardData, setStoryboardData] = useState<StoryboardData>(() => {
    if (data) return data;
    
    // Create default storyboard with all sections
    const sections: SectionType[] = Object.entries(STORYBOARD_SECTIONS).map(([type, config], index) => ({
      id: `${type}-${Date.now()}-${index}`,
      type: type as SectionType['type'],
      title: config.title,
      content: '',
      isCompleted: false,
      order: index,
    }));

    return {
      id: `storyboard-${Date.now()}`,
      title: 'My Business Plan',
      sections,
      createdAt: new Date(),
      updatedAt: new Date(),
      completionPercentage: 0,
    };
  });

  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Memoize the progress update callback to prevent infinite re-renders
  const handleProgressUpdate = useCallback((progress: ProgressData) => {
    setProgressData(progress);
  }, []);

  // Update storyboard data when prop changes
  useEffect(() => {
    if (data) {
      setStoryboardData(data);
    }
  }, [data]);

  // Calculate completion percentage based on content quality
  useEffect(() => {
    const completedSections = storyboardData.sections.filter(section => section.isCompleted).length;
    const totalSections = storyboardData.sections.length;
    const basicPercentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
    
    setStoryboardData(prev => ({
      ...prev,
      completionPercentage: basicPercentage,
      updatedAt: new Date(),
    }));
  }, [storyboardData.sections]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setStoryboardData(prev => {
        const oldIndex = prev.sections.findIndex(section => section.id === active.id);
        const newIndex = prev.sections.findIndex(section => section.id === over?.id);

        const newSections = arrayMove(prev.sections, oldIndex, newIndex).map((section, index) => ({
          ...section,
          order: index,
        }));

        return {
          ...prev,
          sections: newSections,
          updatedAt: new Date(),
        };
      });
    }
  };

  const handleSectionUpdate = (updatedSection: SectionType) => {
    setStoryboardData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === updatedSection.id ? updatedSection : section
      ),
      updatedAt: new Date(),
    }));
  };

  const handleSectionDelete = (sectionId: string) => {
    setStoryboardData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId),
      updatedAt: new Date(),
    }));
  };

  const handleTitleChange = (newTitle: string) => {
    setStoryboardData(prev => ({
      ...prev,
      title: newTitle,
      updatedAt: new Date(),
    }));
  };

  const handleAddCustomSection = (newSection: SectionType) => {
    setStoryboardData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
      updatedAt: new Date(),
    }));
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save your storyboard');
      return;
    }

    setSaveStatus('saving');
    try {
      // Save to Firestore
      await storyboardService.saveStoryboard(user.id, storyboardData);
      
      // Also save to offline storage as backup
      await offlineStorage.saveStoryboard(storyboardData);
      
      // Call external save handler if provided
      if (onSave) {
        onSave(storyboardData);
      }
      
      setSaveStatus('saved');
      console.log('Storyboard saved to Firestore and offline storage');
      
      // Reset save status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save storyboard:', error);
      setSaveStatus('error');
      alert('Failed to save storyboard. Please try again.');
      
      // Reset error status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const convertToBusinessPlan = (): BusinessPlan => {
    const sections = storyboardData.sections.reduce((acc, section) => {
      acc[section.type] = section.content;
      return acc;
    }, {} as any);

    return {
      id: storyboardData.id,
      title: storyboardData.title,
      entrepreneur: 'Current User', // TODO: Get from auth context
      region: 'Rural India', // TODO: Get from user profile
      sector: 'General', // TODO: Get from user input
      status: 'draft',
      qualityScore: qualityScore?.sharkTankScore?.overall || qualityScore?.overall || 0,
      completionPercentage: storyboardData.completionPercentage,
      submissionDate: storyboardData.createdAt,
      priority: 'medium',
      summary: sections.problem || 'Business plan in development',
      strengths: qualityScore?.sharkTankScore?.detailedFeedback?.strengths || qualityScore?.breakdown?.filter(b => b.score >= 70).map(b => b.section) || [],
      areasForImprovement: qualityScore?.sharkTankScore?.detailedFeedback?.weaknesses || qualityScore?.breakdown?.filter(b => b.score < 70).map(b => b.section) || [],
      sections: {
        problem: sections.problem || '',
        solution: sections.solution || '',
        customer: sections.customer || '',
        revenue: sections.revenue || '',
        risks: sections.risks || ''
      },
      feedback: {
        ai: [], // TODO: Get from AI feedback service
        mentor: []
      },
      metrics: {
        timeSpent: Math.floor((Date.now() - storyboardData.createdAt.getTime()) / 60000), // minutes
        revisions: 0, // TODO: Track revisions
        lastUpdated: storyboardData.updatedAt
      }
    };
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (!user) return; // Don't auto-save if user is not authenticated
      
      try {
        // Save to Firestore
        await storyboardService.saveStoryboard(user.id, storyboardData);
        
        // Also save to offline storage as backup
        await offlineStorage.saveStoryboard(storyboardData);
        
        console.log('Storyboard auto-saved to Firestore');
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Try to save to offline storage as fallback
        try {
          await offlineStorage.saveStoryboard(storyboardData);
          console.log('Storyboard auto-saved to offline storage (fallback)');
        } catch (offlineError) {
          console.error('Offline auto-save also failed:', offlineError);
        }
      }
    };

    // Auto-save after 3 seconds of inactivity
    const timeoutId = setTimeout(autoSave, 3000);
    return () => clearTimeout(timeoutId);
  }, [storyboardData, user]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <StoryboardTitleEditor
                title={storyboardData.title}
                onTitleChange={handleTitleChange}
                isEditing={isEditingTitle}
                onEditToggle={() => setIsEditingTitle(!isEditingTitle)}
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowExportDialog(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Export Plan
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving' || !user}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    saveStatus === 'saving' 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : saveStatus === 'saved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : saveStatus === 'error'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {saveStatus === 'saving' 
                    ? 'Saving...' 
                    : saveStatus === 'saved'
                    ? 'Saved!'
                    : saveStatus === 'error'
                    ? 'Save Failed'
                    : 'Save Plan'
                  }
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${storyboardData.completionPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {qualityScore?.sharkTankScore ? (
                <>
                  🦈 {qualityScore.sharkTankScore.overall}% Investment Ready
                  <span className="text-xs text-gray-500 ml-2">
                    ({storyboardData.sections.filter(s => s.isCompleted).length} of {storyboardData.sections.length} sections completed)
                  </span>
                </>
              ) : qualityScore?.overall ? (
                <>
                  {qualityScore.overall}% Complete ({storyboardData.sections.filter(s => s.isCompleted).length} of {storyboardData.sections.length} sections)
                </>
              ) : (
                <>
                  {storyboardData.completionPercentage}% Complete ({storyboardData.sections.filter(s => s.isCompleted).length} of {storyboardData.sections.length} sections)
                </>
              )}
            </p>
          </div>

          {/* Storyboard Sections */}
          <StoryboardSections
            storyboardData={storyboardData}
            onSectionUpdate={handleSectionUpdate}
            onSectionDelete={handleSectionDelete}
            onDragEnd={handleDragEnd}
          />

          {/* Add Custom Section */}
          <div className="mt-8">
            <AddCustomSection
              onAddSection={handleAddCustomSection}
              currentOrder={storyboardData.sections.length}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <ProgressTracker
            storyboardData={storyboardData}
            qualityScore={qualityScore}
            onProgressUpdate={handleProgressUpdate}
          />
          <QualityScoring
            storyboardData={storyboardData}
            onScoreUpdate={setQualityScore}
          />
        </div>
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <ExportDialog
          plan={convertToBusinessPlan()}
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
}
