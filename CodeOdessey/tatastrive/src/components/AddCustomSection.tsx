'use client';

import { useState } from 'react';
import { StoryboardSection } from '@/types/storyboard';

interface AddCustomSectionProps {
  onAddSection: (section: StoryboardSection) => void;
  currentOrder: number;
}

export default function AddCustomSection({ onAddSection, currentOrder }: AddCustomSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sectionTitle.trim()) {
      alert('Please enter a section title');
      return;
    }

    setIsLoading(true);
    
    try {
      const newSection: StoryboardSection = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'custom',
        title: sectionTitle.trim(),
        content: '',
        isCompleted: false,
        order: currentOrder,
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      onAddSection(newSection);
      setSectionTitle('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding custom section:', error);
      alert('Failed to add section. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSectionTitle('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 px-6 py-4 rounded-lg border-2 border-dashed border-purple-300 hover:border-purple-400 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <span className="text-2xl">+</span>
        <span className="font-medium">Add Custom Section</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg border-2 border-purple-200 p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Section</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="sectionTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Section Title
          </label>
          <input
            type="text"
            id="sectionTitle"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="e.g., Market Analysis, Competitive Landscape, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
            autoFocus
            required
          />
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add Section'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
