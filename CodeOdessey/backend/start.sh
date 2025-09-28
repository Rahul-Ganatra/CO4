#!/bin/bash

echo "🎤 Speech-to-Text Backend Startup"
echo "========================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Start the Flask server
echo "🚀 Starting Flask server..."
echo "📡 Server will be available at: http://localhost:5000"
echo "🔗 Health check: http://localhost:5000/health"
echo "========================================"
echo "Press Ctrl+C to stop the server"
echo

python app.py
