/**
 * Unified Event Extraction API
 * 
 * Handles extraction from both onboarding answers and chapter chats.
 * Routes data to appropriate destinations: users, user_profile, or life_event.
 */

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  authenticationRequiredResponse,
  getAuthenticatedRequestContext,
} from '@/lib/server/auth';
import {
  getDestination,
  needsSplitting,
  getCategoryForChapter,
  getCategoryForTopic,
  hasSaveMemoryBlock,
  parseSaveMemoryBlocks,
  extractUserData,
  extractBirthData,
  extractProfileData,
  splitCompositeAnswer,
  type ExtractionRequest,
  type ExtractionResult,
  type ExtractionResponse,
  type ExtractedLifeEvent,
} from '@/lib/extraction';
import type { LifeEventCategoryType } from '@nality/schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const auth = await getAuthenticatedRequestContext(req);
    if (!auth) {
      return authenticationRequiredResponse();
    }

    const body: ExtractionRequest = await req.json();
    const { content, source, topic, chapterId } = body;

    // Validate content
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required', success: false }, { status: 400 });
    }

    // Route based on source
    let result: ExtractionResult;

    if (source === 'chapter_chat') {
      result = await extractFromChapterChat(content, chapterId || 'moments');
    } else if (source === 'voice_monologue') {
      result = {
        destination: 'life_event',
        events: [
          {
            title: content.slice(0, 60).trim() || 'Erinnerung',
            description: content,
            start_date: null,
            category: chapterId ? getCategoryForChapter(chapterId) : 'personal',
            confidence: 0.7,
            source: 'voice_monologue',
          },
        ],
        rawContent: content,
        confidence: 0.7,
      };
    } else if (source === 'onboarding') {
      result = await extractFromOnboarding(content, topic || 'identity');
    } else {
      return NextResponse.json({ error: 'Invalid source', success: false }, { status: 400 });
    }

    // Persist extracted data
    const serviceClient = await createServiceClient();
    const persistResult = await persistExtractionResult(result, auth.user.id, serviceClient);

    const response: ExtractionResponse = {
      success: true,
      ...result,
      persisted: persistResult,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Extraction API error:', error);
    return NextResponse.json(
      { error: 'Extraction failed', success: false },
      { status: 500 }
    );
  }
}

// ──────────────────────
// Chapter Chat Extraction
// ──────────────────────

async function extractFromChapterChat(
  content: string,
  chapterId: string
): Promise<ExtractionResult> {
  const category = getCategoryForChapter(chapterId);

  // Check for [SAVE_MEMORY] blocks
  if (hasSaveMemoryBlock(content)) {
    const events = parseSaveMemoryBlocks(content, category);
    console.log(`🔍 Parsed ${events.length} SAVE_MEMORY blocks`);
    
    return {
      destination: 'life_event',
      events,
      rawContent: content,
      confidence: 0.95,
    };
  }

  // No [SAVE_MEMORY] block = no extraction needed
  return {
    destination: 'skip',
    rawContent: content,
    confidence: 1.0,
  };
}

// ──────────────────────
// Onboarding Extraction
// ──────────────────────

async function extractFromOnboarding(
  content: string,
  topic: string
): Promise<ExtractionResult> {
  const destination = getDestination(topic);
  console.log(`🔍 Topic "${topic}" routes to "${destination}"`);

  switch (destination) {
    case 'users': {
      // Q1 (identity) or Q2 (origins)
      const userData = topic === 'identity' || topic === 'Identity'
        ? extractUserData(content)
        : extractBirthData(content);
      
      console.log(`� Extracted user data:`, userData);
      return {
        destination: 'users',
        userData,
        rawContent: content,
        confidence: 0.9,
      };
    }

    case 'user_profile': {
      // Q6 (influences) or Q7 (values)
      const profileData = await extractProfileData(content, topic);
      console.log(`🔍 Extracted profile data:`, Object.keys(profileData));
      
      return {
        destination: 'user_profile',
        profileData,
        rawContent: content,
        confidence: 0.85,
      };
    }

    case 'life_event': {
      // Q3-Q5: family, education, career
      const category = getCategoryForTopic(topic);
      let events: ExtractedLifeEvent[];

      if (needsSplitting(topic)) {
        console.log(`🔍 Splitting composite ${topic} answer via LLM`);
        events = await splitCompositeAnswer(content, category);
      } else {
        // Single event fallback
        events = [{
          title: `${topic}: ${content.slice(0, 50)}${content.length > 50 ? '...' : ''}`,
          description: content,
          start_date: null,
          category,
          confidence: 0.7,
          source: 'onboarding',
        }];
      }

      console.log(`🔍 Extracted ${events.length} life events`);
      return {
        destination: 'life_event',
        events,
        rawContent: content,
        confidence: events.length > 0 ? 0.85 : 0.5,
      };
    }

    default:
      return {
        destination: 'skip',
        rawContent: content,
        confidence: 1.0,
      };
  }
}

// ──────────────────────
// Persistence
// ──────────────────────

async function persistExtractionResult(
  result: ExtractionResult,
  userId: string,
  supabase: ReturnType<typeof createServiceClient> extends Promise<infer T> ? T : never
): Promise<{ success: boolean; ids?: string[]; error?: string }> {
  try {
    switch (result.destination) {
      case 'users': {
        if (result.userData && Object.keys(result.userData).length > 0) {
          const { error } = await supabase
            .from('users')
            .update(result.userData)
            .eq('id', userId);
          
          if (error) {
            console.error('❌ Failed to update users:', error);
            return { success: false, error: error.message };
          }
          console.log('✅ Updated users table');
        }
        return { success: true };
      }

      case 'user_profile': {
        if (result.profileData && Object.keys(result.profileData).length > 0) {
          const { error } = await supabase
            .from('user_profile')
            .upsert({
              user_id: userId,
              ...result.profileData,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
          
          if (error) {
            console.error('❌ Failed to upsert user_profile:', error);
            return { success: false, error: error.message };
          }
          console.log('✅ Upserted user_profile');
        }
        return { success: true };
      }

      case 'life_event': {
        if (result.events && result.events.length > 0) {
          const rows = result.events.map(e => ({
            user_id: userId,
            title: e.title,
            description: e.description,
            start_date: e.start_date || new Date().toISOString().slice(0, 10),
            end_date: e.end_date || null,
            is_ongoing: e.is_ongoing || false,
            category: e.category,
            location: e.location || null,
            metadata: {
              source: e.source,
              confidence: e.confidence,
              extracted_at: new Date().toISOString(),
            },
          }));

          const { data, error } = await supabase
            .from('life_event')
            .insert(rows)
            .select('id');

          if (error) {
            console.error('❌ Failed to insert life_events:', error);
            return { success: false, error: error.message };
          }
          
          const ids = data?.map((r: { id: string }) => r.id) || [];
          console.log(`✅ Inserted ${ids.length} life events`);
          return { success: true, ids };
        }
        return { success: true };
      }

      case 'skip':
      default:
        return { success: true };
    }
  } catch (error) {
    console.error('❌ Persistence error:', error);
    return { success: false, error: String(error) };
  }
}
