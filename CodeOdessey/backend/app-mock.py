from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import os
import warnings
import json
from datetime import datetime

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Global variables for recording
recording = []
is_recording = False
stream = None

# Mock Whisper model for testing (replace with actual Whisper later)
class MockWhisperModel:
    def transcribe(self, audio):
        # Mock transcription for testing
        return {
            "text": "This is a mock transcription. Please install Whisper for real transcription.",
            "language": "en"
        }

# Use mock model for now
model = MockWhisperModel()
print("Using mock Whisper model for testing")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': True,
        'model_type': 'mock'
    })

@app.route('/start-recording', methods=['POST'])
def start_recording():
    """Start audio recording"""
    global is_recording, stream, recording
    
    try:
        if is_recording:
            return jsonify({'error': 'Already recording'}), 400
        
        # Clear previous recording
        recording.clear()
        
        # Mock recording start (in real implementation, this would start actual audio recording)
        is_recording = True
        
        return jsonify({
            'status': 'recording_started',
            'message': 'Recording started successfully (mock mode)'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stop-recording', methods=['POST'])
def stop_recording():
    """Stop recording and return transcription"""
    global is_recording, stream, recording
    
    try:
        if not is_recording:
            return jsonify({'error': 'Not currently recording'}), 400
        
        # Stop recording
        is_recording = False
        
        # Mock transcription
        result = model.transcribe(None)
        
        return jsonify({
            'status': 'success',
            'transcription': result['text'],
            'language': result['language'],
            'duration': 5.0  # Mock duration
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/transcribe-file', methods=['POST'])
def transcribe_file():
    """Transcribe an uploaded audio file"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Mock transcription
        result = model.transcribe(None)
        
        return jsonify({
            'status': 'success',
            'transcription': result['text'],
            'language': result['language'],
            'duration': 3.0  # Mock duration
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recording-status', methods=['GET'])
def recording_status():
    """Get current recording status"""
    return jsonify({
        'is_recording': is_recording,
        'recording_length': len(recording) if recording else 0
    })

if __name__ == '__main__':
    print("Starting Flask server (Mock Mode)...")
    print("Available endpoints:")
    print("  GET  /health - Health check")
    print("  POST /start-recording - Start audio recording")
    print("  POST /stop-recording - Stop recording and get transcription")
    print("  POST /transcribe-file - Transcribe uploaded audio file")
    print("  GET  /recording-status - Get recording status")
    print("\nNote: This is running in MOCK MODE for testing.")
    print("To enable real Whisper transcription, install the full requirements.")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
