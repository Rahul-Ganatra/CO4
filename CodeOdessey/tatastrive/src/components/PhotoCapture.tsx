'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { PhotoInput } from '@/types/input';

interface PhotoCaptureProps {
  onCapture: (photo: PhotoInput) => void;
  onClose: () => void;
  sectionId: string;
}

export default function PhotoCapture({ onCapture, onClose, sectionId }: PhotoCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;

    setIsCapturing(true);
    setError(null);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
      }
    } catch (err) {
      setError('Failed to capture photo. Please try again.');
      console.error('Photo capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const retake = () => {
    setCapturedImage(null);
    setError(null);
  };

  const savePhoto = async () => {
    if (!capturedImage) return;

    try {
      // Convert data URL to File
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Calculate image dimensions
      const img = new Image();
      img.onload = () => {
        const photoInput: PhotoInput = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          method: 'photo',
          content: capturedImage,
          file,
          preview: capturedImage,
          sectionId,
          isProcessed: false,
          metadata: {
            timestamp: new Date(),
            size: file.size,
            dimensions: { width: img.width, height: img.height },
            quality: 0.8, // Default quality
          },
        };

        onCapture(photoInput);
        onClose();
      };
      img.src = capturedImage;
    } catch (err) {
      setError('Failed to process photo. Please try again.');
      console.error('Photo processing error:', err);
    }
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'environment', // Use back camera if available
  };

  if (capturedImage) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <h3 className="text-xl font-semibold mb-4">Review Photo</h3>
          
          <div className="mb-4">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-64 object-contain border rounded"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={retake}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Retake
            </button>
            <button
              onClick={savePhoto}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Use Photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Capture Photo</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-64 object-cover border rounded"
          />
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
            onClick={capture}
            disabled={isCapturing}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isCapturing ? 'Capturing...' : 'Capture Photo'}
          </button>
        </div>
      </div>
    </div>
  );
}
