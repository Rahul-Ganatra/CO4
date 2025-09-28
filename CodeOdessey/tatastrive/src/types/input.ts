export type InputMethod = 'text' | 'voice' | 'photo';

export interface InputData {
  id: string;
  method: InputMethod;
  content: string;
  metadata: {
    timestamp: Date;
    size: number;
    duration?: number; // for audio
    dimensions?: { width: number; height: number }; // for photos
    language?: string;
    quality?: number; // 0-1 scale
  };
  sectionId: string;
  isProcessed: boolean;
}

export interface PhotoInput extends InputData {
  method: 'photo';
  file: File;
  preview: string;
  metadata: {
    timestamp: Date;
    size: number;
    dimensions: { width: number; height: number };
    quality: number;
  };
}

export interface VoiceInput extends InputData {
  method: 'voice';
  audioBlob?: Blob;
  duration: number;
  transcription?: string;
  metadata: {
    timestamp: Date;
    size: number;
    duration: number;
    language: string;
    quality: number;
  };
}

export interface TextInput extends InputData {
  method: 'text';
  text: string;
  suggestions?: string[];
  metadata: {
    timestamp: Date;
    size: number;
    language: string;
    quality: number;
  };
}

export interface InputValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface AutoCompleteSuggestion {
  text: string;
  confidence: number;
  category: 'business_term' | 'common_phrase' | 'industry_specific';
}
