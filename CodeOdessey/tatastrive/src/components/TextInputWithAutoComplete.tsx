'use client';

import { useState, useRef, useEffect } from 'react';
import { TextInput, AutoCompleteSuggestion } from '@/types/input';

interface TextInputWithAutoCompleteProps {
  onInput: (text: TextInput) => void;
  onClose: () => void;
  sectionId: string;
  placeholder?: string;
}

// Business plan related suggestions
const BUSINESS_SUGGESTIONS: AutoCompleteSuggestion[] = [
  { text: 'target market', confidence: 0.9, category: 'business_term' },
  { text: 'revenue model', confidence: 0.9, category: 'business_term' },
  { text: 'competitive advantage', confidence: 0.9, category: 'business_term' },
  { text: 'customer acquisition', confidence: 0.8, category: 'business_term' },
  { text: 'market opportunity', confidence: 0.8, category: 'business_term' },
  { text: 'value proposition', confidence: 0.9, category: 'business_term' },
  { text: 'business model', confidence: 0.9, category: 'business_term' },
  { text: 'market research', confidence: 0.8, category: 'business_term' },
  { text: 'financial projections', confidence: 0.8, category: 'business_term' },
  { text: 'risk assessment', confidence: 0.8, category: 'business_term' },
  { text: 'sustainable growth', confidence: 0.7, category: 'common_phrase' },
  { text: 'customer satisfaction', confidence: 0.7, category: 'common_phrase' },
  { text: 'market penetration', confidence: 0.8, category: 'business_term' },
  { text: 'operational efficiency', confidence: 0.7, category: 'business_term' },
  { text: 'scalable solution', confidence: 0.7, category: 'common_phrase' },
];

export default function TextInputWithAutoComplete({ 
  onInput, 
  onClose, 
  sectionId, 
  placeholder = "Type your ideas here..." 
}: TextInputWithAutoCompleteProps) {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState<AutoCompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Auto-complete logic
  useEffect(() => {
    if (text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const words = text.toLowerCase().split(' ');
    const lastWord = words[words.length - 1];
    
    if (lastWord.length >= 2) {
      const filteredSuggestions = BUSINESS_SUGGESTIONS
        .filter(suggestion => 
          suggestion.text.toLowerCase().includes(lastWord.toLowerCase()) ||
          suggestion.text.toLowerCase().startsWith(lastWord.toLowerCase())
        )
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [text]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          insertSuggestion(suggestions[selectedSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
    }
  };

  const insertSuggestion = (suggestion: AutoCompleteSuggestion) => {
    const words = text.split(' ');
    words[words.length - 1] = suggestion.text;
    setText(words.join(' ') + ' ');
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    textareaRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: AutoCompleteSuggestion) => {
    insertSuggestion(suggestion);
  };

  const handleSave = () => {
    if (!text.trim()) {
      setError('Please enter some text before saving.');
      return;
    }

    if (text.length > 10000) {
      setError('Text is too long. Please keep it under 10,000 characters.');
      return;
    }

    try {
      const textInput: TextInput = {
        id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        method: 'text',
        content: text,
        text: text,
        sectionId,
        isProcessed: false,
        suggestions: suggestions.map(s => s.text),
        metadata: {
          timestamp: new Date(),
          size: new Blob([text]).size,
          language: 'en', // Default, could be detected
          quality: 0.8, // Default quality
        },
      };

      onInput(textInput);
      onClose();
    } catch (err) {
      setError('Failed to save text. Please try again.');
      console.error('Text input error:', err);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Text Input</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="relative mb-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
            autoFocus
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`p-3 cursor-pointer hover:bg-gray-100 ${
                    index === selectedSuggestion ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{suggestion.text}</span>
                    <span className="text-xs text-gray-500 capitalize">
                      {suggestion.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Confidence: {Math.round(suggestion.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <p>Characters: {text.length}/10,000</p>
          <p>Words: {text.trim().split(/\s+/).filter(word => word.length > 0).length}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Text
          </button>
        </div>
      </div>
    </div>
  );
}
