import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Voice Transcription API Route
 * Server-side proxy for Deepgram live transcription
 * Receives audio via POST, transcribes, and returns results via SSE
 */
export async function POST(req: Request) {
  const apiKey = process.env.DEEPGRAM_KEY;
  
  if (!apiKey) {
    console.error('❌ DEEPGRAM_KEY not configured');
    return new Response(JSON.stringify({ error: 'Voice service not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const audioData = await req.arrayBuffer();
    
    if (!audioData || audioData.byteLength === 0) {
      return new Response(JSON.stringify({ error: 'No audio data received' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const deepgram = createClient(apiKey);
    
    // Use pre-recorded transcription for each chunk (simpler than WebSocket proxy)
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      Buffer.from(audioData),
      {
        model: 'nova-2',
        smart_format: true,
        language: 'en-US',
      }
    );

    if (error) {
      console.error('❌ Deepgram transcription error:', error);
      return new Response(JSON.stringify({ error: 'Transcription failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    
    return new Response(JSON.stringify({ 
      transcript,
      is_final: true 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Transcription failed:', error);
    return new Response(JSON.stringify({ error: 'Transcription failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
