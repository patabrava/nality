import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatChapterTimeRange, type Chapter, type Biography } from '@nality/schema';
import { buildBiographyPdf, buildBiographyPdfFilename } from '@/features/biography-export/pdf';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentifizierung erforderlich' }, { status: 401 });
    }

    const { data: biography, error: biographyError } = await supabase
      .from('biographies')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_current', true)
      .single();

    if (biographyError) {
      if (biographyError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Keine Biografie zum Export verfügbar' }, { status: 404 });
      }

      console.error('Error fetching biography export source:', biographyError);
      return NextResponse.json({ error: 'Biografie für den Export konnte nicht geladen werden' }, { status: 500 });
    }

    if (!biography) {
      return NextResponse.json({ error: 'Keine Biografie zum Export verfügbar' }, { status: 404 });
    }

    const typedBiography = biography as Biography;

    const [{ data: profile, error: profileError }, { data: chapterRows, error: chaptersError }] = await Promise.all([
      supabase.from('users').select('full_name').eq('id', user.id).single(),
      typedBiography.chapter_ids && typedBiography.chapter_ids.length > 0
        ? supabase
            .from('chapters')
            .select('id, title, time_range_start, time_range_end, status')
            .eq('user_id', user.id)
            .eq('status', 'published')
            .in('id', typedBiography.chapter_ids)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (profileError) {
      console.error('Error loading biography export profile:', profileError);
      return NextResponse.json({ error: 'Autorenprofil der Biografie konnte nicht geladen werden' }, { status: 500 });
    }

    if (chaptersError) {
      console.error('Error loading biography export chapters:', chaptersError);
      return NextResponse.json({ error: 'Kapitel der Biografie konnten für den Export nicht geladen werden' }, { status: 500 });
    }

    const chaptersById = new Map(
      ((chapterRows as Chapter[] | null) ?? []).map((chapter) => [chapter.id as string, chapter]),
    );
    const orderedChapters = (typedBiography.chapter_ids ?? [])
      .map((chapterId) => chaptersById.get(chapterId))
      .filter((chapter): chapter is Chapter => Boolean(chapter))
      .map((chapter) => ({
        title: chapter.title,
        timeRange: formatChapterTimeRange(chapter),
      }));

    const pdfBuffer = await buildBiographyPdf({
      fullName: profile?.full_name ?? null,
      createdAt: typedBiography.created_at ?? null,
      version: typedBiography.version,
      tone: typedBiography.tone,
      content: typedBiography.content,
      chapters: orderedChapters,
    });

    const filename = buildBiographyPdfFilename(profile?.full_name ?? null, typedBiography.version);

    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Biography export error:', error);
    return NextResponse.json({ error: 'Biografie konnte nicht exportiert werden' }, { status: 500 });
  }
}
