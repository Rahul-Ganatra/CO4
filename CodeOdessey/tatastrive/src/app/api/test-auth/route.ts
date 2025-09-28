import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminAuth) {
      return NextResponse.json({ 
        success: false, 
        message: 'Firebase Admin not initialized' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Firebase Admin initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing Firebase Admin',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
