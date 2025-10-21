import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'ff-finm-6850',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}