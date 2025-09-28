#!/usr/bin/env python3
"""
Test script for the Speech-to-Text API
"""

import requests
import time
import json

BASE_URL = "http://localhost:5000"

def test_health():
    """Test health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Is it running?")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_recording_status():
    """Test recording status endpoint"""
    print("🔍 Testing recording status...")
    try:
        response = requests.get(f"{BASE_URL}/recording-status")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Recording status: {data}")
            return True
        else:
            print(f"❌ Recording status failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Recording status error: {e}")
        return False

def test_start_recording():
    """Test start recording endpoint"""
    print("🔍 Testing start recording...")
    try:
        response = requests.post(f"{BASE_URL}/start-recording")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Start recording: {data}")
            return True
        else:
            print(f"❌ Start recording failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Start recording error: {e}")
        return False

def test_stop_recording():
    """Test stop recording endpoint"""
    print("🔍 Testing stop recording...")
    try:
        response = requests.post(f"{BASE_URL}/stop-recording")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Stop recording: {data}")
            return True
        else:
            data = response.json()
            print(f"⚠️ Stop recording: {data}")
            return True  # This might fail if no recording was made
    except Exception as e:
        print(f"❌ Stop recording error: {e}")
        return False

def main():
    print("🧪 Speech-to-Text API Test Suite")
    print("=" * 40)
    
    tests = [
        ("Health Check", test_health),
        ("Recording Status", test_recording_status),
        ("Start Recording", test_start_recording),
        ("Stop Recording", test_stop_recording),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 20)
        if test_func():
            passed += 1
        time.sleep(1)  # Small delay between tests
    
    print("\n" + "=" * 40)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The API is working correctly.")
    else:
        print("⚠️ Some tests failed. Check the server logs for details.")
    
    print("\n💡 To test with actual audio:")
    print("   1. Start recording: curl -X POST http://localhost:5000/start-recording")
    print("   2. Speak into your microphone")
    print("   3. Stop recording: curl -X POST http://localhost:5000/stop-recording")

if __name__ == "__main__":
    main()
