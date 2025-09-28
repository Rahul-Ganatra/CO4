'use client';

import { useState, useEffect } from 'react';
import StoryboardBuilder from '@/components/StoryboardBuilder';
import { StoryboardData } from '@/types/storyboard';
import { storyboardService } from '@/services/storyboardService';
import { useAuth } from '@/contexts/AuthContext';

export default function Storyboard() {
  const { user } = useAuth();
  const [storyboards, setStoryboards] = useState<StoryboardData[]>([]);
  const [currentStoryboard, setCurrentStoryboard] = useState<StoryboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Load user's storyboards when component mounts or user changes
  useEffect(() => {
    const loadStoryboards = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);
        const userStoryboards = await storyboardService.getUserStoryboards(user.id);
        setStoryboards(userStoryboards);
        
        // If user has storyboards, load the most recent one
        if (userStoryboards.length > 0) {
          setCurrentStoryboard(userStoryboards[0]);
        }
      } catch (error) {
        console.error('Failed to load storyboards:', error);
        setLoadError('Failed to load your storyboards. Please try again.');
        // Set empty array on error to prevent infinite loading
        setStoryboards([]);
        setCurrentStoryboard(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoryboards();
  }, [user]);

  const handleSave = (data: StoryboardData) => {
    console.log('Storyboard saved successfully:', data);
    // Update the current storyboard in state
    setCurrentStoryboard(data);
    
    // Update the storyboards list
    setStoryboards(prev => {
      const existingIndex = prev.findIndex(sb => sb.id === data.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = data;
        return updated;
      } else {
        return [data, ...prev];
      }
    });
  };

  const handleLoadStoryboard = (storyboard: StoryboardData) => {
    setCurrentStoryboard(storyboard);
  };

  const handleNewStoryboard = () => {
    setCurrentStoryboard(null);
  };

  const handleCreateNewStoryboard = () => {
    const newStoryboard: StoryboardData = {
      id: `storyboard-${Date.now()}`,
      title: 'My Business Plan',
      sections: [
        {
          id: `problem-${Date.now()}-0`,
          type: 'problem',
          title: 'Problem Statement',
          content: '',
          isCompleted: false,
          order: 0,
        },
        {
          id: `solution-${Date.now()}-1`,
          type: 'solution',
          title: 'Solution',
          content: '',
          isCompleted: false,
          order: 1,
        },
        {
          id: `customer-${Date.now()}-2`,
          type: 'customer',
          title: 'Target Customer',
          content: '',
          isCompleted: false,
          order: 2,
        },
        {
          id: `revenue-${Date.now()}-3`,
          type: 'revenue',
          title: 'Revenue Model',
          content: '',
          isCompleted: false,
          order: 3,
        },
        {
          id: `risks-${Date.now()}-4`,
          type: 'risks',
          title: 'Risks & Mitigation',
          content: '',
          isCompleted: false,
          order: 4,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      completionPercentage: 0,
    };
    
    // Set as current storyboard
    setCurrentStoryboard(newStoryboard);
    
    // Add to storyboards list
    setStoryboards(prev => [newStoryboard, ...prev]);
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    
    console.log('New storyboard created:', newStoryboard.title);
  };

  const handleRetryLoad = () => {
    if (user) {
      const loadStoryboards = async () => {
        try {
          setIsLoading(true);
          setLoadError(null);
          const userStoryboards = await storyboardService.getUserStoryboards(user.id);
          setStoryboards(userStoryboards);
          
          if (userStoryboards.length > 0) {
            setCurrentStoryboard(userStoryboards[0]);
          }
        } catch (error) {
          console.error('Failed to load storyboards:', error);
          setLoadError('Failed to load your storyboards. Please try again.');
          setStoryboards([]);
          setCurrentStoryboard(null);
        } finally {
          setIsLoading(false);
        }
      };
      loadStoryboards();
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your storyboards...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
            <p className="text-gray-600 mb-6">You need to be signed in to access your storyboards.</p>
            <a 
              href="/auth" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {loadError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span>{loadError}</span>
              <button
                onClick={handleRetryLoad}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <span>New storyboard created successfully! Start adding your content.</span>
            </div>
          </div>
        )}

        {/* Storyboard Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {storyboards.length > 0 ? 'Your Storyboards' : 'Create Your First Storyboard'}
            </h2>
            <button
              onClick={handleCreateNewStoryboard}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              + New Storyboard
            </button>
          </div>
          
          {/* Show existing storyboards */}
          {storyboards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {storyboards.map((storyboard) => (
                <div
                  key={storyboard.id}
                  onClick={() => handleLoadStoryboard(storyboard)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    currentStoryboard?.id === storyboard.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{storyboard.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {storyboard.completionPercentage}% Complete
                  </p>
                  <p className="text-xs text-gray-500">
                    Updated: {storyboard.updatedAt.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Show message when no storyboards exist */}
          {storyboards.length === 0 && !currentStoryboard && (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Storyboards Yet</h3>
              <p className="text-gray-600 mb-6">Create your first business plan storyboard to get started!</p>
              <button
                onClick={handleCreateNewStoryboard}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg"
              >
                Create Your First Storyboard
              </button>
            </div>
          )}
        </div>

        {/* Storyboard Builder */}
        <StoryboardBuilder 
          data={currentStoryboard || undefined} 
          onSave={handleSave} 
        />
      </div>
    </main>
  );
}
