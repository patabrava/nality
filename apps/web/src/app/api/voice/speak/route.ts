import { createClient } from '@deepgram/sdk';
import { NextResponse } from 'next/server';

/**
 * Voice TTS API Route
 * Converts text to speech using Deepgram Aura
 * Returns audio stream for playback
 */
export async function POST(req: Request) {
  const apiKey = process.env.DEEPGRAM_KEY;
  
  if (!apiKey) {
    console.error('❌ DEEPGRAM_KEY not configured');
    return NextResponse.json(
      { error: 'Sprachdienst ist nicht konfiguriert' }, 
      { status: 500 }
    );
  }

  try {
    const rawBody = await req.text();
    if (!rawBody) {
      console.error('❌ Empty TTS request body');
      return NextResponse.json(
        { error: 'Text ist erforderlich' },
        { status: 400 }
      );
    }

    let parsed: { text?: string; voice?: string };
    try {
      parsed = JSON.parse(rawBody);
    } catch (e) {
      console.error('❌ Invalid JSON for TTS request:', e);
      return NextResponse.json(
        { error: 'Ungültiger JSON-Body' },
        { status: 400 }
      );
    }

    const { text, voice = 'aura-2-viktoria-de' } = parsed;
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text ist erforderlich' }, 
        { status: 400 }
      );
    }

    // Limit text length to prevent abuse
    const trimmedText = text.slice(0, 2000);
    
    console.log(`🔊 Generating speech for ${trimmedText.length} characters`);
    
    const deepgram = createClient(apiKey);

    // Available voices:
    // - aura-asteria-en (English, female, warm)
    // - aura-luna-en (English, female, soft)
    // - aura-stella-en (English, female, confident)
    // - aura-athena-en (English, female, professional)
    // - aura-hera-en (English, female, mature)
    // - aura-orion-en (English, male, confident)
    // - aura-arcas-en (English, male, warm)
    // - aura-perseus-en (English, male, deep)
    // - aura-angus-en (English, male, Irish)
    // - aura-orpheus-en (English, male, gentle)
    // - aura-helios-en (English, male, bright)
    // - aura-zeus-en (English, male, authoritative)
    
    const response = await deepgram.speak.request(
      { text: trimmedText },
      {
        model: voice,
        encoding: 'linear16',
        container: 'wav',
      }
    );

    const stream = await response.getStream();
    
    if (!stream) {
      console.error('❌ No audio stream returned from Deepgram');
      return NextResponse.json(
        { error: 'Audio konnte nicht erzeugt werden' }, 
        { status: 500 }
      );
    }

    console.log('✅ Speech generated successfully');

    // Return the audio stream directly
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('❌ TTS generation failed:', error);
    return NextResponse.json(
      { error: 'Sprachausgabe konnte nicht erzeugt werden' }, 
      { status: 500 }
    );
  }
}
