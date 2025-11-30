import { createClient } from '@/lib/supabase/server';
import { 
  extractEventFromMessage, 
  createLifeEventFromExtraction,
  isEventExtractionMessage 
} from '@/lib/events/extraction';
import { getChapterById, isValidChapterId } from '@/lib/chapters';
import type { ChapterId, LifeEventCategoryType } from '@nality/schema';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  console.log("📦 Event Extraction API endpoint hit");
  
  try {
    const { content, chapterId, userId: bodyUserId } = await req.json();
    
    // Validate inputs
    if (!content || typeof content !== 'string') {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }
    
    if (!chapterId || !isValidChapterId(chapterId)) {
      return Response.json({ error: "Valid chapterId is required" }, { status: 400 });
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const effectiveUserId = user?.id || bodyUserId;

    if (!effectiveUserId) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check if content contains extraction patterns
    if (!isEventExtractionMessage(content)) {
      return Response.json({ 
        extracted: false, 
        message: "No event extraction detected in content" 
      });
    }

    // Get chapter to determine category
    const chapter = getChapterById(chapterId as ChapterId);
    if (!chapter) {
      return Response.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Extract event data
    const extraction = extractEventFromMessage(
      content, 
      chapter.primaryCategory as LifeEventCategoryType
    );

    if (!extraction) {
      return Response.json({ 
        extracted: false, 
        message: "Could not extract event data from content" 
      });
    }

    // Create the life event
    const result = await createLifeEventFromExtraction(extraction, effectiveUserId, supabase);

    if (!result.success) {
      return Response.json({ 
        extracted: true,
        saved: false,
        error: result.error,
        extraction 
      }, { status: 500 });
    }

    console.log(`✅ Event extracted and saved: ${result.eventId}`);
    
    return Response.json({
      extracted: true,
      saved: true,
      eventId: result.eventId,
      extraction
    });
    
  } catch (error) {
    console.error("❌ Event Extraction API error:", error);
    return Response.json(
      { error: "Failed to extract event" },
      { status: 500 }
    );
  }
}
