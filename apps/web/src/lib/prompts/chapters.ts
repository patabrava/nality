import fs from 'fs';
import path from 'path';
import type { ChapterId } from '@nality/schema';

// In development, don't cache to allow prompt changes without restart
const isDev = process.env.NODE_ENV === 'development';
const promptCache: Map<string, string> = new Map();

function resolveChapterPromptPath(chapterId: ChapterId): string | null {
  const cwd = process.cwd();
  // Convert chapter_id to filename (e.g., growing_up -> growing_up.txt)
  const filename = `${chapterId}.txt`;
  
  const candidates = [
    path.join(cwd, 'src', 'lib', 'prompts', 'files', 'chapters', filename),
    path.join(cwd, 'apps', 'web', 'src', 'lib', 'prompts', 'files', 'chapters', filename),
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        return p;
      }
    } catch {
      // ignore
    }
  }
  
  return null;
}

export function getChapterSystemPrompt(chapterId: ChapterId): string {
  // In development, skip cache to allow hot-reloading of prompts
  if (!isDev && promptCache.has(chapterId)) {
    return promptCache.get(chapterId)!;
  }

  const promptPath = resolveChapterPromptPath(chapterId);
  
  if (promptPath) {
    try {
      const prompt = fs.readFileSync(promptPath, 'utf-8');
      promptCache.set(chapterId, prompt);
      console.log(`[prompts] Loaded chapter prompt: ${chapterId}`);
      return prompt;
    } catch (err) {
      console.error(`[prompts] Failed to read chapter prompt ${chapterId}:`, err);
    }
  }

  // Fallback generic prompt
  const fallback = `You are a warm Biography Assistant helping document memories for the "${chapterId.replace('_', ' ')}" chapter.

Ask focused questions one at a time and help capture meaningful life events.
After gathering a memory, summarize it and ask for confirmation before saving.
Be warm, patient, and respect the user's pace.
Respond in the same language the user is using.`;

  promptCache.set(chapterId, fallback);
  console.log(`[prompts] Using fallback prompt for chapter: ${chapterId}`);
  return fallback;
}

export function buildChapterSystemPrompt(chapterId: ChapterId): string {
  const outputConstraints = [
    'OUTPUT_CONSTRAINTS:',
    '- Respond in plain text only.',
    '- Ask one question at a time.',
    '- After gathering a memory, confirm with the user, then output the [SAVE_MEMORY] block.',
    '- Respond in the same language the user is using.',
    '',
    'CRITICAL: When saving a memory, you MUST output this exact format:',
    '',
    '[SAVE_MEMORY]',
    'Title: [A brief descriptive title for this memory]',
    'Date: [YYYY-MM-DD or just YYYY if only year is known]', 
    'Description: [The details of this memory in 1-3 sentences]',
    '',
    'The [SAVE_MEMORY] block triggers automatic saving. Include ALL three fields.',
  ].join('\n');

  return outputConstraints + '\n\n' + getChapterSystemPrompt(chapterId);
}

// Clear cache (useful for development/testing)
export function clearChapterPromptCache(): void {
  promptCache.clear();
}
