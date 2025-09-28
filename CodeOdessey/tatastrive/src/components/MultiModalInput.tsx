'use client';

import { useState } from 'react';
import PhotoCapture from './PhotoCapture';
import VoiceRecorder from './VoiceRecorder';
import TextInputWithAutoComplete from './TextInputWithAutoComplete';
import { InputData, InputMethod } from '@/types/input';

interface MultiModalInputProps {
  onInput: (input: InputData) => void;
  onClose: () => void;
  sectionId: string;
  sectionTitle: string;
}

export default function MultiModalInput({ onInput, onClose, sectionId, sectionTitle }: MultiModalInputProps) {
  const [selectedMethod, setSelectedMethod] = useState<InputMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInput = (input: InputData) => {
    try {
      // Validate input size (10MB limit)
      if (input.metadata.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit. Please use a smaller file.');
        return;
      }

      // Additional validation based on input type
      if (input.method === 'photo') {
        const photoInput = input as any;
        if (photoInput.metadata.dimensions.width < 100 || photoInput.metadata.dimensions.height < 100) {
          setError('Image is too small. Please capture a larger image.');
          return;
        }
      }

      if (input.method === 'voice') {
        const voiceInput = input as any;
        if (voiceInput.metadata.duration < 1) {
          setError('Recording is too short. Please record for at least 1 second.');
          return;
        }
      }

      if (input.method === 'text') {
        const textInput = input as any;
        if (textInput.text.trim().length < 10) {
          setError('Text is too short. Please provide more details.');
          return;
        }
      }

      onInput(input);
      onClose();
    } catch (err) {
      setError('Failed to process input. Please try again.');
      console.error('Input processing error:', err);
    }
  };

  const inputMethods = [
    {
      method: 'text' as InputMethod,
      title: 'Text Input',
      description: 'Type your ideas with auto-complete suggestions',
      icon: '✍️',
      color: 'blue',
    },
    {
      method: 'voice' as InputMethod,
      title: 'Voice Recording',
      description: 'Record your thoughts in your own voice',
      icon: '🎤',
      color: 'green',
    },
    {
      method: 'photo' as InputMethod,
      title: 'Photo Capture',
      description: 'Take photos of handwritten notes or sketches',
      icon: '📷',
      color: 'purple',
    },
  ];

  if (selectedMethod) {
    switch (selectedMethod) {
      case 'text':
        return (
          <TextInputWithAutoComplete
            onInput={handleInput}
            onClose={() => setSelectedMethod(null)}
            sectionId={sectionId}
            placeholder={`Describe ${sectionTitle.toLowerCase()}...`}
          />
        );
      case 'voice':
        return (
          <VoiceRecorder
            onRecording={handleInput}
            onClose={() => setSelectedMethod(null)}
            sectionId={sectionId}
          />
        );
      case 'photo':
        return (
          <PhotoCapture
            onCapture={handleInput}
            onClose={() => setSelectedMethod(null)}
            sectionId={sectionId}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold">Add Input for {sectionTitle}</h3>
            <p className="text-gray-600">Choose how you'd like to express your ideas</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {inputMethods.map((method) => (
            <button
              key={method.method}
              onClick={() => setSelectedMethod(method.method)}
              className={`p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-${method.color}-400 hover:bg-${method.color}-50 transition-all group`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {method.icon}
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-900">
                  {method.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {method.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Tips for Better Input:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Text:</strong> Use business terms and be specific about your ideas</li>
            <li>• <strong>Voice:</strong> Speak clearly and include key details about your business</li>
            <li>• <strong>Photo:</strong> Ensure good lighting and readable handwriting</li>
          </ul>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
