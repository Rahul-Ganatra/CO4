#!/usr/bin/env python3

import whisper
import tempfile
import os
import numpy as np

def test_whisper_transcription():
    """Test Whisper transcription with a simple audio file"""
    try:
        print("Loading Whisper model...")
        model = whisper.load_model("small")
        print("Whisper model loaded successfully!")
        
        # Create a simple test audio file (sine wave)
        print("Creating test audio...")
        duration = 2  # seconds
        sample_rate = 16000
        frequency = 440  # A4 note
        
        # Generate sine wave
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        audio = np.sin(2 * np.pi * frequency * t)
        
        # Save as temporary WAV file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            import scipy.io.wavfile as wav
            wav.write(temp_file.name, sample_rate, (audio * 32767).astype(np.int16))
            temp_filename = temp_file.name
        
        print(f"Created test audio file: {temp_filename}")
        
        # Test transcription
        print("Testing transcription...")
        result = model.transcribe(temp_filename)
        
        print(f"Transcription result: {result}")
        print("✅ Whisper transcription test successful!")
        
        # Clean up
        os.unlink(temp_filename)
        
        return True
        
    except Exception as e:
        print(f"❌ Whisper transcription test failed: {e}")
        return False

if __name__ == "__main__":
    test_whisper_transcription()
