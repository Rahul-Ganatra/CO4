'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StoryboardSection as SectionType, STORYBOARD_SECTIONS } from '@/types/storyboard';
import { InputData } from '@/types/input';
import MultiModalInput from './MultiModalInput';
import FeedbackDisplay from './FeedbackDisplay';

interface StoryboardSectionProps {
  section: SectionType;
  onUpdate: (section: SectionType) => void;
  onDelete: (id: string) => void;
}

export default function StoryboardSection({ section, onUpdate, onDelete }: StoryboardSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(section.content);
  const [showMultiModal, setShowMultiModal] = useState(false);
  const [inputs, setInputs] = useState<InputData[]>([]);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sectionConfig = section.isCustom 
    ? { 
        title: section.title, 
        description: 'Custom section', 
        icon: '📝', 
        color: 'purple' 
      }
    : STORYBOARD_SECTIONS[section.type];
  const isCompleted = content.trim().length > 0;

  const handleSave = () => {
    onUpdate({
      ...section,
      content,
      isCompleted,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(section.content);
    setIsEditing(false);
  };

  const handleMultiModalInput = (input: InputData) => {
    setInputs(prev => [...prev, input]);
    
    // Process the input based on type
    let processedContent = '';
    switch (input.method) {
      case 'text':
        processedContent = input.content;
        break;
      case 'voice':
        const voiceInput = input as any;
        // Use transcription if available, otherwise show duration
        if (voiceInput.transcription) {
          processedContent = voiceInput.transcription;
        } else {
          processedContent = `[Voice Recording: ${input.metadata.duration}s]`;
        }
        break;
      case 'photo':
        processedContent = `[Photo: ${input.metadata.dimensions.width}x${input.metadata.dimensions.height}]`;
        break;
    }
    
    setContent(prev => prev + (prev ? '\n\n' : '') + processedContent);
    setShowMultiModal(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${
        isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{sectionConfig.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {sectionConfig.title}
            </h3>
            <p className="text-sm text-gray-600">
              {sectionConfig.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isCompleted && (
            <span className="text-green-600 text-sm font-medium">
              ✓ Completed
            </span>
          )}
          <button
            onClick={() => setShowMultiModal(true)}
            className="text-blue-500 hover:text-blue-700 p-1"
            title="Add input"
          >
            ➕
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="text-red-500 hover:text-red-700 p-1"
            title="Delete section"
          >
            🗑️
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Describe ${sectionConfig.title.toLowerCase()}...`}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
            rows={4}
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            onClick={() => setIsEditing(true)}
            className="cursor-pointer min-h-[100px] p-3 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            {content ? (
              <p className="text-black whitespace-pre-wrap">{content}</p>
            ) : (
              <p className="text-gray-400 italic">
                Click to add {sectionConfig.title.toLowerCase()}...
              </p>
            )}
          </div>
          
          {/* Feedback Display */}
          {content && (
            <FeedbackDisplay
              sectionId={section.id}
              content={content}
              sectionType={section.type}
            />
          )}
        </>
      )}

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        ⋮⋮
      </div>

      {/* Multi-modal input modal */}
      {showMultiModal && (
        <MultiModalInput
          onInput={handleMultiModalInput}
          onClose={() => setShowMultiModal(false)}
          sectionId={section.id}
          sectionTitle={sectionConfig.title}
        />
      )}
    </div>
  );
}
