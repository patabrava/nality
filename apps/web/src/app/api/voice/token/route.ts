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
  return NextResponse.json(
    {
      error: 'Client-side voice tokens are disabled. Use the server-side voice routes instead.',
    },
    { status: 410 },
  );
}
