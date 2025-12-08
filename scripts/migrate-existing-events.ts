/**
 * Migration Script: Clean Up Bad Life Event Data
 * 
 * This script migrates incorrectly stored data:
 * 1. Moves "Profile:" and "Influences:" events to user_profile table
 * 2. Deletes non-event data from life_event table
 * 3. Re-processes onboarding answers through the new extraction pipeline
 * 
 * Usage:
 *   npx tsx scripts/migrate-existing-events.ts
 * 
 * Environment variables required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 */

import { createClient } from '@supabase/supabase-js';

// ──────────────────────
// Configuration
// ──────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Patterns that indicate bad data (should not be life events)
const BAD_EVENT_PATTERNS = [
  { pattern: /^Profile:/i, type: 'profile' },
  { pattern: /^Influences:/i, type: 'influences' },
  { pattern: /^Einflüsse:/i, type: 'influences' },
  { pattern: /^Values:/i, type: 'values' },
  { pattern: /^Werte:/i, type: 'values' },
  { pattern: /^Role Model:/i, type: 'role_models' },
  { pattern: /^Vorbild:/i, type: 'role_models' },
];

// ──────────────────────
// Types
// ──────────────────────

interface LifeEvent {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  metadata: Record<string, unknown>;
}

interface MigrationResult {
  eventsAnalyzed: number;
  eventsDeleted: number;
  profilesUpdated: number;
  errors: string[];
}

// ──────────────────────
// Main Migration
// ──────────────────────

async function migrateExistingEvents(): Promise<MigrationResult> {
  const result: MigrationResult = {
    eventsAnalyzed: 0,
    eventsDeleted: 0,
    profilesUpdated: 0,
    errors: [],
  };

  console.log('🔄 Starting migration of existing events...\n');

  try {
    // Step 1: Find all life events that match bad patterns
    const { data: allEvents, error: fetchError } = await supabase
      .from('life_event')
      .select('id, user_id, title, description, category, metadata');

    if (fetchError) {
      result.errors.push(`Failed to fetch events: ${fetchError.message}`);
      return result;
    }

    if (!allEvents || allEvents.length === 0) {
      console.log('📋 No events found in database');
      return result;
    }

    console.log(`📊 Found ${allEvents.length} total events to analyze\n`);
    result.eventsAnalyzed = allEvents.length;

    // Step 2: Identify bad events
    const badEvents: Array<{ event: LifeEvent; type: string }> = [];
    
    for (const event of allEvents as LifeEvent[]) {
      for (const { pattern, type } of BAD_EVENT_PATTERNS) {
        if (pattern.test(event.title)) {
          badEvents.push({ event, type });
          break;
        }
      }
    }

    console.log(`⚠️  Found ${badEvents.length} events that should not be life events:\n`);
    
    // Group by user for processing
    const eventsByUser = new Map<string, Array<{ event: LifeEvent; type: string }>>();
    for (const item of badEvents) {
      const userId = item.event.user_id;
      if (!eventsByUser.has(userId)) {
        eventsByUser.set(userId, []);
      }
      eventsByUser.get(userId)!.push(item);
    }

    // Step 3: Process each user's bad events
    for (const [userId, userEvents] of eventsByUser) {
      console.log(`\n👤 Processing user: ${userId}`);
      console.log(`   Found ${userEvents.length} bad events`);

      // Extract data for user_profile
      const profileData = {
        influences: [] as Array<{ name: string; type: string }>,
        role_models: [] as Array<{ name: string }>,
        values: [] as string[],
      };

      for (const { event, type } of userEvents) {
        console.log(`   - "${event.title}" (${type})`);

        // Extract data based on type
        if (type === 'influences') {
          const names = extractNamesFromDescription(event.description);
          profileData.influences.push(...names.map(name => ({ name, type: 'other' })));
        } else if (type === 'role_models') {
          const names = extractNamesFromDescription(event.description);
          profileData.role_models.push(...names.map(name => ({ name })));
        } else if (type === 'values') {
          const values = extractValuesFromDescription(event.description);
          profileData.values.push(...values);
        }
        // 'profile' type events are just deleted (identity data should be in users table)
      }

      // Step 4: Update user_profile if we extracted any data
      if (profileData.influences.length > 0 || profileData.role_models.length > 0 || profileData.values.length > 0) {
        try {
          // Get existing profile
          const { data: existingProfile } = await supabase
            .from('user_profile')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          // Merge with existing data
          const mergedData = {
            user_id: userId,
            influences: mergeArrays(existingProfile?.influences || [], profileData.influences),
            role_models: mergeArrays(existingProfile?.role_models || [], profileData.role_models),
            values: [...new Set([...(existingProfile?.values || []), ...profileData.values])],
            updated_at: new Date().toISOString(),
          };

          const { error: upsertError } = await supabase
            .from('user_profile')
            .upsert(mergedData, { onConflict: 'user_id' });

          if (upsertError) {
            result.errors.push(`Failed to update profile for ${userId}: ${upsertError.message}`);
          } else {
            result.profilesUpdated++;
            console.log(`   ✅ Updated user_profile with extracted data`);
          }
        } catch (err) {
          result.errors.push(`Error updating profile for ${userId}: ${err}`);
        }
      }

      // Step 5: Delete bad events
      const eventIds = userEvents.map(e => e.event.id);
      const { error: deleteError } = await supabase
        .from('life_event')
        .delete()
        .in('id', eventIds);

      if (deleteError) {
        result.errors.push(`Failed to delete events for ${userId}: ${deleteError.message}`);
      } else {
        result.eventsDeleted += eventIds.length;
        console.log(`   🗑️  Deleted ${eventIds.length} bad events`);
      }
    }

    // Step 6: Summary
    console.log('\n' + '═'.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Events analyzed:    ${result.eventsAnalyzed}`);
    console.log(`Events deleted:     ${result.eventsDeleted}`);
    console.log(`Profiles updated:   ${result.profilesUpdated}`);
    console.log(`Errors:             ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(e => console.log(`   - ${e}`));
    }

    return result;

  } catch (err) {
    result.errors.push(`Unexpected error: ${err}`);
    return result;
  }
}

// ──────────────────────
// Helper Functions
// ──────────────────────

/**
 * Extract names from a description string
 * Handles comma-separated and "und"/"and" separated lists
 */
function extractNamesFromDescription(description: string): string[] {
  if (!description) return [];
  
  // Remove common prefixes
  let text = description
    .replace(/^(influences:|einflüsse:|vorbilder:|role models?:)/i, '')
    .trim();
  
  // Split by common separators
  const names = text
    .split(/[,;]|\s+und\s+|\s+and\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 100)
    .filter(s => !isCommonWord(s));
  
  return names;
}

/**
 * Extract values from a description string
 */
function extractValuesFromDescription(description: string): string[] {
  if (!description) return [];
  
  let text = description
    .replace(/^(values:|werte:)/i, '')
    .trim();
  
  const values = text
    .split(/[,;]|\s+und\s+|\s+and\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 50);
  
  return values;
}

/**
 * Check if a word is a common word (not a name)
 */
function isCommonWord(word: string): boolean {
  const commonWords = [
    'der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'von', 'zu', 'mit',
    'the', 'a', 'an', 'and', 'or', 'of', 'to', 'with', 'by',
    'mich', 'mir', 'mein', 'meine', 'ich', 'hat', 'haben', 'ist', 'sind',
  ];
  return commonWords.includes(word.toLowerCase());
}

/**
 * Merge two arrays, avoiding duplicates by name
 */
function mergeArrays<T extends { name: string }>(existing: T[], newItems: T[]): T[] {
  const existingNames = new Set(existing.map(e => e.name.toLowerCase()));
  const merged = [...existing];
  
  for (const item of newItems) {
    if (!existingNames.has(item.name.toLowerCase())) {
      merged.push(item);
      existingNames.add(item.name.toLowerCase());
    }
  }
  
  return merged;
}

// ──────────────────────
// Re-process Onboarding Answers
// ──────────────────────

async function reprocessOnboardingAnswers(): Promise<void> {
  console.log('\n' + '═'.repeat(50));
  console.log('🔄 RE-PROCESSING ONBOARDING ANSWERS');
  console.log('═'.repeat(50));

  // Get all users with onboarding answers that haven't been extracted
  const { data: answers, error } = await supabase
    .from('onboarding_answers')
    .select('user_id')
    .is('answer_json->extracted', null);

  if (error) {
    console.error('❌ Failed to fetch onboarding answers:', error.message);
    return;
  }

  if (!answers || answers.length === 0) {
    console.log('✅ No unprocessed onboarding answers found');
    return;
  }

  // Get unique user IDs
  const userIds = [...new Set(answers.map(a => a.user_id))];
  console.log(`Found ${userIds.length} users with unprocessed answers\n`);

  console.log('⚠️  To re-process these answers, users should:');
  console.log('   1. Visit the dashboard (auto-converts on load)');
  console.log('   2. Or manually trigger conversion via API');
  console.log('\nUser IDs with pending answers:');
  userIds.forEach(id => console.log(`   - ${id}`));
}

// ──────────────────────
// Run Migration
// ──────────────────────

async function main() {
  console.log('═'.repeat(50));
  console.log('🚀 LIFE EVENT DATA MIGRATION');
  console.log('═'.repeat(50));
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // Run migration
  const result = await migrateExistingEvents();

  // Check for unprocessed onboarding answers
  await reprocessOnboardingAnswers();

  console.log('\n' + '═'.repeat(50));
  console.log('✅ MIGRATION COMPLETE');
  console.log('═'.repeat(50));

  // Exit with error code if there were errors
  if (result.errors.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
