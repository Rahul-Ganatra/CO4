'use client';

import { useState } from 'react';

interface StoryboardTitleEditorProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

export default function StoryboardTitleEditor({ 
  title, 
  onTitleChange, 
  isEditing, 
  onEditToggle 
}: StoryboardTitleEditorProps) {
  const [editTitle, setEditTitle] = useState(title);

  const handleSave = () => {
    if (editTitle.trim()) {
      onTitleChange(editTitle.trim());
      onEditToggle();
    }
  };

  const handleCancel = () => {
    setEditTitle(title);
    onEditToggle();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-3xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 text-black"
          autoFocus
          placeholder="Enter storyboard title..."
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="text-green-600 hover:text-green-700 p-1"
            title="Save title"
          >
            ✓
          </button>
          <button
            onClick={handleCancel}
            className="text-red-600 hover:text-red-700 p-1"
            title="Cancel"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <button
        onClick={onEditToggle}
        className="text-gray-500 hover:text-gray-700 p-1"
        title="Edit title"
      >
        ✏️
      </button>
    </div>
  );
}
