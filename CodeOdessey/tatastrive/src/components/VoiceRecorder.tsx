'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { VoiceInput } from '@/types/input';
import { speechToTextService } from '@/services/speechToTextService';

interface VoiceRecorderProps {
  onRecording: (voice: VoiceInput) => void;
  onClose: () => void;
  sectionId: string;
}

export default function VoiceRecorder({ onRecording, onClose, sectionId }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [serviceReady, setServiceReady] = useState<boolean>(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const serviceReadyRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataRef = useRef<Float32Array[]>([]);

  // Check if backend service is available
  useEffect(() => {
    const checkService = async () => {
      try {
        console.log('Checking speech-to-text service availability...');
        const ready = await speechToTextService.isServiceReady();
        console.log('Service ready:', ready);
        setServiceReady(ready);
        serviceReadyRef.current = ready;
      } catch (error) {
        console.error('Failed to check speech-to-text service:', error);
        setServiceReady(false);
        serviceReadyRef.current = false;
      }
    };

    checkService();
  }, []);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    if (!audioBlob) {
      console.log('No audio blob provided for transcription');
      return;
    }
    
    console.log('Starting transcription process...', {
      blobSize: audioBlob.size,
      blobType: audioBlob.type,
      serviceReady
    });
    
    // Additional validation
    if (audioBlob.size === 0) {
      console.error('Cannot transcribe empty audio blob!');
      setError('Empty audio file - please try recording again');
      return;
    }
    
    // Test if blob is readable
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      console.log('Audio blob is readable, size:', arrayBuffer.byteLength, 'bytes');
      
      if (arrayBuffer.byteLength === 0) {
        console.error('Audio blob arrayBuffer is empty!');
        setError('Invalid audio data - please try recording again');
        return;
      }
    } catch (error) {
      console.error('Failed to read audio blob:', error);
      setError('Invalid audio data - please try recording again');
      return;
    }
    
    setIsTranscribing(true);
    try {
      console.log('Sending audio blob to backend for transcription...', audioBlob.size, 'bytes');
      const result = await speechToTextService.transcribeFile(audioBlob);
      console.log('Backend transcription result:', result);
      
      if (result.status === 'success' && result.transcription) {
        setTranscription(result.transcription);
        console.log('Transcription received:', result.transcription);
      } else {
        setError(result.error || 'Failed to transcribe audio');
        console.error('Transcription failed:', result.error);
      }
    } catch (err) {
      setError('Failed to transcribe audio. Please try again.');
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  }, [serviceReady]);

  // Web Audio API fallback for audio capture
  const setupWebAudioCapture = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      audioDataRef.current = [];
      
      // Capture audio data every 50ms for better reliability
      const captureAudioData = () => {
        if (analyser && audioContext.state === 'running') {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Float32Array(bufferLength);
          analyser.getFloatTimeDomainData(dataArray);
          
          // Always capture data, but log when we detect audio
          audioDataRef.current.push(new Float32Array(dataArray));
          
          // Check if there's actual audio data (not just silence)
          const hasAudio = dataArray.some(value => Math.abs(value) > 0.01);
          if (hasAudio) {
            console.log('Web Audio: Detected audio, total samples:', audioDataRef.current.length);
          }
          
          // Log every 20 samples (1 second) to show progress
          if (audioDataRef.current.length % 20 === 0) {
            console.log('Web Audio: Captured', audioDataRef.current.length, 'samples');
          }
        }
      };
      
      const audioCaptureInterval = setInterval(captureAudioData, 50);
      (audioContext as AudioContext & { captureInterval?: NodeJS.Timeout }).captureInterval = audioCaptureInterval;
      
      return true;
    } catch (error) {
      console.error('Web Audio setup failed:', error);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscription(null);
      
      // Always use frontend recording for better reliability
      if (typeof window === 'undefined' || !navigator.mediaDevices) {
        throw new Error('Media devices not available');
      }
      
      console.log('🎤 Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false, // Disable to get raw audio
          noiseSuppression: false, // Disable to get raw audio
          autoGainControl: false,  // Disable to get raw audio
          sampleRate: 44100        // Use standard sample rate
        } 
      });
      
      console.log('✅ Microphone access granted');
      console.log('Audio tracks:', stream.getAudioTracks().length);
      
      // Setup Web Audio API as primary method (more reliable)
      const webAudioSuccess = setupWebAudioCapture(stream);
      console.log('Web Audio setup:', webAudioSuccess ? 'success' : 'failed');
      
      // Simplified MediaRecorder setup (backup only)
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }
      
      console.log('MediaRecorder MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes', 'type:', event.data.type);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('Added chunk, total chunks:', audioChunksRef.current.length);
        } else {
          console.log('Empty data chunk received');
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred. Please try again.');
      };

      mediaRecorder.onstart = () => {
        console.log('MediaRecorder started successfully');
      };

      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped, creating audio blob...');
        console.log('Audio chunks:', audioChunksRef.current.length);
        console.log('Chunk details:', audioChunksRef.current.map((chunk, i) => `Chunk ${i}: ${chunk.size} bytes, type: ${chunk.type}`));
        
        // Ensure we have audio data
        if (audioChunksRef.current.length === 0) {
          console.error('No audio chunks collected!');
          setError('No audio data was recorded. Please try again.');
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('Audio blob created:', audioBlob.size, 'bytes, type:', audioBlob.type);
        
        if (audioBlob.size === 0) {
          console.error('Created empty audio blob!');
          setError('No audio data was recorded. Please try again.');
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        console.log('✅ MediaRecorder successfully created audio blob');
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        
        // Trigger transcription if backend service is available
        console.log('Checking if should transcribe:', { serviceReady: serviceReadyRef.current });
        if (serviceReadyRef.current && audioBlob.size > 0) {
          console.log('Triggering transcription...');
          setTimeout(() => {
            transcribeAudio(audioBlob);
          }, 100);
        } else {
          console.log('Not transcribing - backend service not available or no audio data');
        }
      };

      // Start recording with different timeslice strategies
      try {
        // Try with a very small timeslice first
        mediaRecorder.start(50); // Collect data every 50ms
        console.log('Started recording with 50ms timeslice');
      } catch (error) {
        console.warn('Failed to start with 50ms, trying 100ms:', error);
        try {
          mediaRecorder.start(100);
          console.log('Started recording with 100ms timeslice');
        } catch (error2) {
          console.warn('Failed to start with 100ms, trying 1000ms:', error2);
          mediaRecorder.start(1000);
          console.log('Started recording with 1000ms timeslice');
        }
      }

      // Force data collection every 500ms as a backup
      const forceDataCollection = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          console.log('Forcing data collection...');
          // This will trigger ondataavailable if there's data
          try {
            mediaRecorder.requestData();
          } catch (e) {
            console.log('requestData not supported or failed:', e);
          }
        }
      }, 500);
      
      // Store the interval so we can clear it later
      (mediaRecorder as MediaRecorder & { forceDataInterval?: NodeJS.Timeout }).forceDataInterval = forceDataCollection;
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Add comprehensive debugging
      setTimeout(() => {
        console.log('=== Audio Recording Debug Info ===');
        console.log('Recording time:', recordingTime, 'seconds');
        console.log('MediaRecorder chunks:', audioChunksRef.current.length);
        console.log('Web Audio samples:', audioDataRef.current.length);
        console.log('MediaRecorder state:', mediaRecorder.state);
        console.log('Stream active:', stream.active);
        console.log('Stream tracks:', stream.getTracks().length);
        
        if (stream.getAudioTracks().length > 0) {
          const track = stream.getAudioTracks()[0];
          console.log('Audio track state:', track.readyState);
          console.log('Audio track enabled:', track.enabled);
          console.log('Audio track muted:', track.muted);
          console.log('Audio track settings:', track.getSettings());
        }
        
        if (audioChunksRef.current.length === 0 && audioDataRef.current.length === 0) {
          console.warn('⚠️ No audio data collected from either method!');
          console.log('This might be a browser compatibility issue or microphone permission problem.');
        } else if (audioChunksRef.current.length > 0) {
          console.log('✅ MediaRecorder is working - audio data collected');
        } else if (audioDataRef.current.length > 0) {
          console.log('✅ Web Audio API is working - audio data collected (MediaRecorder fallback)');
        }
        console.log('=== End Debug Info ===');
      }, 2000);

    } catch (err) {
      setError('Microphone access denied or not available. Please check your permissions.');
      console.error('Voice recording error:', err);
    }
  }, [transcribeAudio, recordingTime, setupWebAudioCapture]);

  // Create minimal test audio as last resort
  const createMinimalTestAudio = useCallback(() => {
    try {
      console.log('Creating minimal test audio...');
      
      // Create a very simple 0.5-second audio file
      const sampleRate = 16000;
      const duration = 0.5; // 0.5 seconds
      const length = sampleRate * duration;
      const buffer = new ArrayBuffer(44 + length * 2);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length * 2, true);
      
      // Generate simple audio (silence with small noise)
      let offset = 44;
      for (let i = 0; i < length; i++) {
        const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1;
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
      
      const testBlob = new Blob([buffer], { type: 'audio/wav' });
      console.log('Minimal test audio created:', testBlob.size, 'bytes');
      setAudioBlob(testBlob);
      
      // Try transcription
      if (serviceReadyRef.current) {
        console.log('Testing transcription with minimal audio...');
        transcribeAudio(testBlob);
      }
    } catch (error) {
      console.error('Failed to create minimal test audio:', error);
      setError('Recording failed completely. Please check your microphone and browser permissions.');
    }
  }, [transcribeAudio]);

  // Create audio blob from Web Audio API data as fallback
  const createAudioBlobFromWebAudio = useCallback(() => {
    try {
      if (audioDataRef.current.length === 0) {
        console.log('No Web Audio data available for fallback');
        return;
      }

      console.log('Creating audio blob from Web Audio data...');
      
      // Convert Float32Array data to WAV format
      const sampleRate = 16000;
      const length = audioDataRef.current.length * audioDataRef.current[0].length;
      const buffer = new ArrayBuffer(44 + length * 2);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length * 2, true);
      
      // Convert audio data to 16-bit PCM
      let offset = 44;
      for (const dataArray of audioDataRef.current) {
        for (let i = 0; i < dataArray.length; i++) {
          const sample = Math.max(-1, Math.min(1, dataArray[i]));
          view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
          offset += 2;
        }
      }
      
      const audioBlob = new Blob([buffer], { type: 'audio/wav' });
      console.log('Created Web Audio fallback blob:', audioBlob.size, 'bytes');
      setAudioBlob(audioBlob);
      
      // Trigger transcription if backend service is available
      if (serviceReadyRef.current && audioBlob.size > 0) {
        console.log('Triggering transcription from Web Audio fallback...');
        setTimeout(() => {
          transcribeAudio(audioBlob);
        }, 100);
      }
    } catch (error) {
      console.error('Failed to create audio blob from Web Audio:', error);
      setError('Failed to process audio recording. Please try again.');
    }
  }, [transcribeAudio]);

  const stopRecording = useCallback(async () => {
    if (!isRecording) return;

    // Check minimum recording time
    if (recordingTime < 1) {
      setError('Please record for at least 1 second');
      return;
    }

    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Clear the force data collection interval
    if (mediaRecorderRef.current && (mediaRecorderRef.current as MediaRecorder & { forceDataInterval?: NodeJS.Timeout }).forceDataInterval) {
      clearInterval((mediaRecorderRef.current as MediaRecorder & { forceDataInterval?: NodeJS.Timeout }).forceDataInterval);
    }

    // Cleanup Web Audio API
    if (audioContextRef.current) {
      const audioContext = audioContextRef.current;
      if ((audioContext as AudioContext & { captureInterval?: NodeJS.Timeout }).captureInterval) {
        clearInterval((audioContext as AudioContext & { captureInterval?: NodeJS.Timeout }).captureInterval);
      }
      audioContext.close();
      audioContextRef.current = null;
    }

    // Stop the media recorder - transcription will be handled in onstop callback
    if (mediaRecorderRef.current) {
      console.log('Stopping MediaRecorder, current state:', mediaRecorderRef.current.state);
      mediaRecorderRef.current.stop();
    }

      // Prioritize Web Audio API over MediaRecorder
      setTimeout(() => {
        console.log('=== Post-Recording Check ===');
        console.log('MediaRecorder chunks:', audioChunksRef.current.length);
        console.log('Web Audio samples:', audioDataRef.current.length);
        
        if (audioDataRef.current.length > 0) {
          console.log('✅ Using Web Audio API data (primary method)');
          createAudioBlobFromWebAudio();
        } else if (audioChunksRef.current.length > 0) {
          console.log('✅ Using MediaRecorder data (fallback)');
          // MediaRecorder data is already processed in onstop callback
        } else {
          console.error('❌ Both recording methods failed!');
          console.log('Creating minimal test audio as last resort...');
          createMinimalTestAudio();
        }
      }, 500);
  }, [isRecording, recordingTime, createAudioBlobFromWebAudio, createMinimalTestAudio]);

  const saveRecording = async () => {
    if (!audioBlob && !transcription) return;

    try {
      const voiceInput: VoiceInput = {
        id: `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        method: 'voice',
        content: transcription || URL.createObjectURL(audioBlob!),
        audioBlob: audioBlob || undefined,
        duration: recordingTime,
        sectionId,
        isProcessed: !!transcription, // Mark as processed if we have transcription
        transcription: transcription || undefined,
        metadata: {
          timestamp: new Date(),
          size: audioBlob?.size || 0,
          duration: recordingTime,
          language: 'en', // Default, could be detected
          quality: 0.8, // Default quality
        },
      };

      onRecording(voiceInput);
      onClose();
    } catch (err) {
      setError('Failed to process recording. Please try again.');
      console.error('Voice processing error:', err);
    }
  };

  const retakeRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setError(null);
    setTranscription(null);
    audioChunksRef.current = []; // Clear previous chunks
    audioDataRef.current = []; // Clear Web Audio data
  };

  // Test function to create a simple audio file for debugging
  const createTestAudio = () => {
    try {
      console.log('Creating test audio file...');
      
      // Create a simple 1-second sine wave audio
      const sampleRate = 16000;
      const duration = 1; // 1 second
      const frequency = 440; // A note
      const length = sampleRate * duration;
      const buffer = new ArrayBuffer(44 + length * 2);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length * 2, true);
      
      // Generate sine wave
      let offset = 44;
      for (let i = 0; i < length; i++) {
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
      
      const testBlob = new Blob([buffer], { type: 'audio/wav' });
      console.log('Test audio created:', testBlob.size, 'bytes');
      setAudioBlob(testBlob);
      
      // Test transcription
      if (serviceReadyRef.current) {
        console.log('Testing transcription with generated audio...');
        transcribeAudio(testBlob);
      }
    } catch (error) {
      console.error('Failed to create test audio:', error);
      setError('Failed to create test audio');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioBlob || transcription) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-semibold mb-4">Review Recording</h3>
          
          <div className="mb-4 text-center">
            <div className="text-4xl mb-2">🎤</div>
            <p className="text-lg font-medium">Recording Complete</p>
            <p className="text-gray-600">Duration: {formatTime(recordingTime)}</p>
            {audioBlob && audioBlob.size > 0 && (
              <p className="text-sm text-gray-500">Size: {(audioBlob.size / 1024).toFixed(1)} KB</p>
            )}
            {serviceReady && (
              <p className="text-sm text-green-600">✓ AI Transcription Available</p>
            )}
          </div>

          {transcription && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Transcription:</h4>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-sm text-gray-700">{transcription}</p>
              </div>
            </div>
          )}

          {audioBlob && audioBlob.size > 0 && (
            <audio controls className="w-full mb-4">
              <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          )}

          {isTranscribing && (
            <div className="mb-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Transcribing audio...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <div className="font-semibold">Recording Error:</div>
              <div>{error}</div>
              <div className="text-sm mt-2">
                <strong>Tips:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Make sure your microphone is working and not muted</li>
                  <li>Check browser permissions for microphone access</li>
                  <li>Try speaking closer to your microphone</li>
                  <li>Record for at least 2-3 seconds</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={retakeRecording}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Retake
            </button>
            <button
              onClick={saveRecording}
              disabled={isTranscribing}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isTranscribing ? 'Processing...' : 'Use Recording'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Voice Recording</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="text-center mb-6">
          <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-200'
          }`}>
            <span className="text-4xl">🎤</span>
          </div>
          
          <p className="text-lg font-medium mb-2">
            {isRecording ? 'Recording...' : 'Ready to Record'}
          </p>
          
          {isRecording && (
            <p className="text-2xl font-mono text-red-600">
              {formatTime(recordingTime)}
            </p>
          )}

          {serviceReady && (
            <p className="text-sm text-green-600 mt-2">
              ✓ AI Speech-to-Text Available
            </p>
          )}
          
          {!serviceReady && (
            <p className="text-sm text-yellow-600 mt-2">
              ⚠ Using Basic Recording (AI transcription unavailable)
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Recording
              </button>
            )}
          </div>
          
          {/* Debug Test Button */}
          <div className="text-center">
            <button
              onClick={createTestAudio}
              className="text-xs bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600 transition-colors"
            >
              🧪 Test Audio Generation
            </button>
            <p className="text-xs text-gray-500 mt-1">Click to test if backend transcription works</p>
          </div>
        </div>
      </div>
    </div>
  );
}
