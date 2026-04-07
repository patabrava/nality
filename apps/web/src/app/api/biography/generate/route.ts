/**
 * Biography Generation API
 * 
 * POST: Generate biography from chapters using AI
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { BiographyToneType } from '@nality/schema';
import { getOptionalEnv } from '@/lib/server/env';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

const TONE_PROMPTS: Record<BiographyToneType, string> = {
  neutral: 'Schreibe klar, ausgewogen und gut zugänglich. Nutze eine direkte, lebendige Sprache, ohne übertrieben emotional zu werden.',
  poetic: 'Schreibe lyrisch und ausdrucksstark. Nutze starke Bilder, Metaphern und emotionale Sprache für eine persönliche, berührende Erzählung.',
  formal: 'Schreibe professionell und strukturiert. Nutze formale Sprache und eine klare Gliederung, geeignet für Dokumentation oder Veröffentlichung.',
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentifizierung erforderlich' }, { status: 401 });
    }

    const body = await req.json();
    const tone: BiographyToneType = body.tone || 'neutral';
    const chapterIds: string[] = body.chapter_ids || [];
    const regenerate = body.regenerate || false;

    // Get chapters (all or specified)
    let chaptersQuery = supabase
      .from('chapters')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .order('display_order', { ascending: true });

    if (chapterIds.length > 0) {
      chaptersQuery = chaptersQuery.in('id', chapterIds);
    }

    const { data: chapters, error: chaptersError } = await chaptersQuery;

    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError);
      return NextResponse.json({ error: 'Kapitel konnten nicht geladen werden' }, { status: 500 });
    }

    if (!chapters || chapters.length === 0) {
      return NextResponse.json({
        error: 'Es sind keine Kapitel für die Biografieerstellung verfügbar',
      }, { status: 400 });
    }

    // Get memories for each chapter
    const chapterContents = [];
    for (const chapter of chapters) {
      const { data: memories } = await supabase
        .from('memories')
        .select('raw_transcript, cleaned_content, captured_at')
        .eq('chapter_id', chapter.id)
        .eq('user_id', user.id)
        .order('captured_at', { ascending: true });

      const memoryTexts = (memories || [])
        .map(m => m.cleaned_content || m.raw_transcript)
        .join('\n\n');

      chapterContents.push({
        title: chapter.title,
        summary: chapter.summary,
        timeRange: chapter.time_range_start && chapter.time_range_end
          ? `${chapter.time_range_start} to ${chapter.time_range_end}`
          : 'Various periods',
        content: memoryTexts,
      });
    }

    // Get user profile for personalization
    const { data: userProfile } = await supabase
      .from('users')
      .select('full_name, birth_date, birth_place')
      .eq('id', user.id)
      .single();

    const openAiKey = getOptionalEnv('OPENAI_API_KEY');
    const geminiKey =
      getOptionalEnv('GEMINI_API_KEY') || getOptionalEnv('GOOGLE_GENERATIVE_AI_API_KEY');

    let model;
    if (openAiKey) {
      process.env.OPENAI_API_KEY = openAiKey;
      model = openai('gpt-4o');
    } else if (geminiKey) {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = geminiKey;
      model = google('gemini-2.0-flash');
    } else if (process.env.NODE_ENV === 'test') {
      model = openai('gpt-4o');
    } else {
      return NextResponse.json({ error: 'KI-Anbieter ist nicht konfiguriert' }, { status: 500 });
    }

    // Generate biography using AI
    const { text: biographyContent } = await generateText({
      model,
      prompt: `Du bist eine erfahrene Biografin bzw. ein erfahrener Biograf und hilfst dabei, eine persönliche Autobiografie zu verfassen.

${TONE_PROMPTS[tone]}

Wichtige Informationen über die Person:
- Name: ${userProfile?.full_name || 'Unbekannt'}
- Geburtsdatum: ${userProfile?.birth_date || 'Unbekannt'}
- Geburtsort: ${userProfile?.birth_place || 'Unbekannt'}

Hier sind die Kapitel ihrer Lebensgeschichte:

${chapterContents.map((ch, idx) => `
## Kapitel ${idx + 1}: ${ch.title}
Zeitraum: ${ch.timeRange}
Zusammenfassung: ${ch.summary || 'Keine Zusammenfassung vorhanden'}

Erinnerungen:
${ch.content || 'Für dieses Kapitel wurden noch keine konkreten Erinnerungen festgehalten.'}
`).join('\n\n')}

Schreibe daraus eine zusammenhängende, fließende Autobiografie auf Deutsch, die diese Kapitel zu einer starken Erzählung verbindet.
- Beginne mit einer Einführung, die den Rahmen setzt
- Führe weich zwischen den Lebensabschnitten über
- Fange die Essenz der Erfahrungen und Gefühle ein
- Beende den Text mit einer Reflexion über den Lebensweg

Die Biografie sollte je nach Materialtiefe etwa 500 bis 1000 Wörter umfassen.`,
    });

    // Check if we should create new version or this is first
    const { data: existingBios } = await supabase
      .from('biographies')
      .select('version')
      .eq('user_id', user.id)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = existingBios && existingBios.length > 0 && existingBios[0]
      ? existingBios[0].version + 1
      : 1;

    // Mark existing as not current
    if (regenerate || nextVersion > 1) {
      await supabase
        .from('biographies')
        .update({ is_current: false })
        .eq('user_id', user.id);
    }

    // Save the generated biography
    const { data: biography, error: saveError } = await supabase
      .from('biographies')
      .insert({
        user_id: user.id,
        content: biographyContent,
        tone,
        version: nextVersion,
        is_current: true,
        chapter_ids: chapters.map(c => c.id),
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving biography:', saveError);
      return NextResponse.json({ error: 'Biografie konnte nicht gespeichert werden' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        biography,
        chapters_used: chapters.length,
        word_count: biographyContent.split(/\s+/).length,
      },
    });
  } catch (error) {
    console.error('Biography generation error:', error);
    return NextResponse.json({ error: 'Biografie konnte nicht erstellt werden' }, { status: 500 });
  }
}
