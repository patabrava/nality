import { createClient, createServiceClient } from '@/lib/supabase/server';
import { 
  extractEventFromMessage, 
  createLifeEventFromExtraction,
  isEventExtractionMessage 
} from '@/lib/events/extraction';
import { getChapterById, isValidChapterId } from '@/lib/chapters';
import type { ChapterId, LifeEventCategoryType } from '@nality/schema';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  console.log("📦 Event Extraction API endpoint hit");
  console.log("📦 Timestamp:", new Date().toISOString());
  
  try {
    const { content, chapterId, userId: bodyUserId } = await req.json();
    
    // Validate inputs
    if (!content || typeof content !== 'string') {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }
    
    if (!chapterId || !isValidChapterId(chapterId)) {
      return Response.json({ error: "Valid chapterId is required" }, { status: 400 });
    }

    // Get authenticated user using SSR client
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const effectiveUserId = user?.id || bodyUserId;

    if (!effectiveUserId) {
      console.error("❌ No authenticated user found");
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }
    
    console.log("📦 Authenticated user:", effectiveUserId);

    console.log("📦 Content received (first 200 chars):", content.substring(0, 200));
    console.log("📦 Chapter ID:", chapterId);
    
    // Check if content contains extraction patterns
    const hasExtractionPattern = isEventExtractionMessage(content);
    console.log("📦 Has extraction pattern:", hasExtractionPattern);
    
    if (!hasExtractionPattern) {
      console.log("📦 No extraction pattern found in content");
      return Response.json({ 
        extracted: false, 
        message: "No event extraction detected in content" 
      });
    }

    // Get chapter to determine category
    const chapter = getChapterById(chapterId as ChapterId);
    if (!chapter) {
      console.error("❌ Chapter not found:", chapterId);
      return Response.json({ error: "Chapter not found" }, { status: 404 });
    }

    console.log("📦 Chapter found:", chapter.name, "Primary category:", chapter.primaryCategory);

    // Extract event data
    const extraction = extractEventFromMessage(
      content, 
      chapter.primaryCategory as LifeEventCategoryType
    );

    console.log("📦 Extraction result:", extraction ? JSON.stringify(extraction) : "null");

    if (!extraction) {
      console.log("⚠️ Extraction pattern matched but no event data could be extracted");
      return Response.json({ 
        extracted: false, 
        message: "Could not extract event data from content" 
      });
    }

    // Create the life event using service client (bypasses RLS since we've validated user)
    const serviceClient = await createServiceClient();
    const result = await createLifeEventFromExtraction(extraction, effectiveUserId, serviceClient);

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
