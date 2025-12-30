import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Voice Token API Route
 * Returns the Deepgram API key for client-side WebSocket connections
 * 
 * Note: For production with high security requirements, consider using
 * Deepgram's ephemeral key feature (requires admin API key permissions)
 */
export async function GET() {
  const apiKey = process.env.DEEPGRAM_KEY;
  
  if (!apiKey) {
    console.error('❌ DEEPGRAM_KEY not configured');
    return NextResponse.json(
      { error: 'Voice service not configured' }, 
      { status: 500 }
    );
  }

  console.log('🎤 Providing Deepgram token for voice session');
  
  return NextResponse.json({ 
    key: apiKey,
    expiresIn: 3600 // Session valid for 1 hour
  });
}
