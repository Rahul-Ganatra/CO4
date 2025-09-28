import { NextResponse } from 'next/server';

export async function GET() {
  // Mock API endpoint - in real implementation, this would fetch from database
  return NextResponse.json([]);
}

export async function POST() {
  // Mock API endpoint - in real implementation, this would save to database
  return NextResponse.json({ success: true });
}
