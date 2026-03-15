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
  const fallback = `Du bist ein warmer Biografie-Assistent und hilfst dabei, Erinnerungen für das Kapitel "${chapterId.replace('_', ' ')}" festzuhalten.

Stelle immer nur eine fokussierte Frage.
Hilf dabei, bedeutsame Lebensereignisse konkret zu machen.
Nachdem eine Erinnerung klar geworden ist, fasse sie kurz zusammen und frage nach Bestätigung, bevor du sie speicherst.
Bleibe warm, geduldig und respektiere das Tempo der Person.
Antworte konsequent auf Deutsch.`;

  promptCache.set(chapterId, fallback);
  console.log(`[prompts] Using fallback prompt for chapter: ${chapterId}`);
  return fallback;
}

export function buildChapterSystemPrompt(chapterId: ChapterId): string {
  const outputConstraints = [
    'AUSGABEREGELN:',
    '- Antworte nur als Fließtext.',
    '- Stelle immer nur eine Frage auf einmal.',
    '- Nachdem eine Erinnerung bestätigt wurde, gib den [SAVE_MEMORY]-Block aus.',
    '- Antworte konsequent auf Deutsch.',
    '',
    'WICHTIG: Wenn du eine Erinnerung speicherst, musst du exakt dieses Format verwenden:',
    '',
    '[SAVE_MEMORY]',
    'Title: [Ein kurzer, beschreibender Titel für diese Erinnerung]',
    'Date: [YYYY-MM-DD oder nur YYYY, falls nur das Jahr bekannt ist]',
    'Description: [Die Details dieser Erinnerung in 1 bis 3 Sätzen]',
    '',
    'Der [SAVE_MEMORY]-Block löst das automatische Speichern aus. Alle drei Felder sind Pflicht.',
  ].join('\n');

  return outputConstraints + '\n\n' + getChapterSystemPrompt(chapterId);
}

// Clear cache (useful for development/testing)
export function clearChapterPromptCache(): void {
  promptCache.clear();
}
