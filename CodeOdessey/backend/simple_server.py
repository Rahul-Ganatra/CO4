#!/usr/bin/env python3

from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import tempfile
import os

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

# Load Whisper model
print("Loading Whisper model...")
model = whisper.load_model("small")
print("Whisper model loaded successfully!")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'model_type': 'whisper'
    })

@app.route('/transcribe-file', methods=['POST'])
def transcribe_file():
    """Transcribe an uploaded audio file"""
    try:
        print("Received transcribe-file request")
        
        if 'audio' not in request.files:
            print("No audio file in request")
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            print("Empty filename")
            return jsonify({'error': 'No file selected'}), 400
        
        print(f"Received audio file: {audio_file.filename}")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            audio_file.save(temp_file.name)
            temp_filename = temp_file.name
        
        try:
            # Transcribe audio using Whisper
            print("Transcribing uploaded file...")
            result = model.transcribe(temp_filename)
            transcription_text = result['text'].strip()
            language = result.get('language', 'unknown')
            
            print(f"Transcription result: {transcription_text[:100]}...")
            
            return jsonify({
                'status': 'success',
                'transcription': transcription_text,
                'language': language,
                'duration': 3.0
            })
            
        except Exception as e:
            print(f"Transcription error: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            # Clean up temporary file
            if temp_filename and os.path.exists(temp_filename):
                try:
                    os.unlink(temp_filename)
                except Exception as cleanup_error:
                    print(f"Error cleaning up temp file: {cleanup_error}")
            
    except Exception as e:
        print(f"Transcribe file error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting simple Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
