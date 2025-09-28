const SPEECH_TO_TEXT_API_URL = process.env.NEXT_PUBLIC_SPEECH_TO_TEXT_URL || 'http://localhost:5000';

export interface TranscriptionResult {
  status: 'success' | 'error';
  transcription?: string;
  language?: string;
  duration?: number;
  error?: string;
}

export interface RecordingStatus {
  is_recording: boolean;
  recording_length: number;
}

class SpeechToTextService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = SPEECH_TO_TEXT_API_URL;
  }

  /**
   * Check if the speech-to-text service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      console.log('Checking health at:', `${this.baseUrl}/health`);
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      console.log('Health check response:', data);
      return data.status === 'healthy' && data.model_loaded;
    } catch (error) {
      console.error('Speech-to-text service health check failed:', error);
      console.error('Backend URL:', this.baseUrl);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/start-recording`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start recording');
      }

      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and get transcription
   */
  async stopRecording(): Promise<TranscriptionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/stop-recording`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Backend error:', data);
        return {
          status: 'error',
          error: data.error || 'Failed to stop recording and transcribe',
        };
      }

      // Always return success if we get a response (even if it's mock)
      return {
        status: 'success',
        transcription: data.transcription || 'No transcription available',
        language: data.language || 'en',
        duration: data.duration || 0,
      };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Transcribe an uploaded audio file
   */
  async transcribeFile(audioBlob: Blob): Promise<TranscriptionResult> {
    try {
      console.log('Creating FormData with audio blob:', audioBlob.size, 'bytes');
      console.log('Backend URL:', this.baseUrl);
      
      // Ensure we have a valid blob
      if (!audioBlob || audioBlob.size === 0) {
        return {
          status: 'error',
          error: 'No audio data provided',
        };
      }

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      console.log('Sending request to backend...', `${this.baseUrl}/transcribe-file`);
      const response = await fetch(`${this.baseUrl}/transcribe-file`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (!response.ok) {
        return {
          status: 'error',
          error: data.error || 'Failed to transcribe audio file',
        };
      }

      return {
        status: 'success',
        transcription: data.transcription,
        language: data.language,
        duration: data.duration,
      };
    } catch (error) {
      console.error('Failed to transcribe file:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          status: 'error',
          error: 'Unable to connect to speech-to-text service. Please ensure the backend is running on port 5000.',
        };
      }
      
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get current recording status
   */
  async getRecordingStatus(): Promise<RecordingStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/recording-status`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get recording status:', error);
      return {
        is_recording: false,
        recording_length: 0,
      };
    }
  }

  /**
   * Check if the service is available and ready
   */
  async isServiceReady(): Promise<boolean> {
    try {
      const isHealthy = await this.healthCheck();
      return isHealthy;
    } catch (error) {
      console.error('Service readiness check failed:', error);
      return false;
    }
  }
}

export const speechToTextService = new SpeechToTextService();
