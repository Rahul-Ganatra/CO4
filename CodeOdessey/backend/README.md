# Speech-to-Text Backend

This Flask backend provides speech-to-text functionality using OpenAI's Whisper model for the TataStrive storyboard application.

## Features

- Real-time audio recording and transcription
- File upload and transcription
- Health check endpoint
- CORS enabled for frontend integration
- Automatic fallback to frontend recording if backend is unavailable

## Quick Start

### Windows
```bash
# Double-click start.bat or run in command prompt
start.bat
```

### Linux/macOS
```bash
# Make executable and run
chmod +x start.sh
./start.sh
```

### Manual Setup

1. **Install Python 3.8+** (if not already installed)

2. **Create virtual environment:**
```bash
python -m venv venv
```

3. **Activate virtual environment:**
```bash
# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

4. **Install dependencies:**
```bash
pip install -r requirements.txt
```

5. **Run the Flask server:**
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/health` - Check if the service is running and model is loaded

### Recording
- **POST** `/start-recording` - Start audio recording
- **POST** `/stop-recording` - Stop recording and get transcription
- **GET** `/recording-status` - Get current recording status

### File Upload
- **POST** `/transcribe-file` - Upload and transcribe an audio file

## Response Format

All endpoints return JSON responses:

```json
{
  "status": "success",
  "transcription": "Your transcribed text here",
  "language": "en",
  "duration": 5.2
}
```

## Error Handling

Errors are returned with appropriate HTTP status codes:

```json
{
  "error": "Error message description"
}
```

## Configuration

The backend can be configured using environment variables:

- `WHISPER_MODEL`: Whisper model size (tiny, base, small, medium, large)
- `AUDIO_SAMPLE_RATE`: Audio sample rate (default: 16000)
- `FLASK_PORT`: Port to run the server on (default: 5000)
- `CORS_ORIGINS`: Allowed CORS origins (comma-separated)

## Frontend Integration

The frontend automatically detects if the backend is available:

1. **Backend Available**: Uses AI transcription with Whisper
2. **Backend Unavailable**: Falls back to basic audio recording

Set the environment variable in your frontend:
```bash
NEXT_PUBLIC_SPEECH_TO_TEXT_URL=http://localhost:5000
```

## Troubleshooting

### Common Issues

1. **"Module not found" errors:**
   - Make sure virtual environment is activated
   - Run `pip install -r requirements.txt`

2. **"Permission denied" on microphone:**
   - Grant microphone permissions to your browser
   - Check system audio settings

3. **"CORS error" in browser:**
   - Ensure backend is running on correct port
   - Check CORS_ORIGINS configuration

4. **"Whisper model loading" takes long:**
   - First startup downloads the model (can take a few minutes)
   - Subsequent startups are faster

### Performance Notes

- **Model Size**: `small` provides good balance of speed/accuracy
- **Audio Quality**: 16kHz sample rate is optimal for Whisper
- **Memory Usage**: Whisper model requires ~1GB RAM
- **Processing Time**: Transcription takes ~1-2 seconds for 10 seconds of audio

## Development

### Running in Development Mode
```bash
export FLASK_ENV=development
export FLASK_DEBUG=1
python app.py
```

### Testing the API
```bash
# Health check
curl http://localhost:5000/health

# Start recording
curl -X POST http://localhost:5000/start-recording

# Stop recording (after recording some audio)
curl -X POST http://localhost:5000/stop-recording
```

## Production Deployment

For production deployment:

1. Set `FLASK_ENV=production`
2. Use a production WSGI server (e.g., Gunicorn)
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use environment variables for sensitive configuration

## Notes

- The Whisper model is loaded on startup (may take a moment)
- Audio is recorded at 16kHz sample rate
- Temporary files are automatically cleaned up
- CORS is enabled for frontend integration
- The service gracefully handles errors and provides fallback options
