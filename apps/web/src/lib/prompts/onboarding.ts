import fs from 'fs';
import path from 'path';
import type { CoreMessage } from 'ai';

let cachedPrompt: string | null = null;

function resolvePromptPath(filename: string): string | null {
  const cwd = process.cwd();
  const candidates = [
    // New location: files subdirectory
    path.join(cwd, 'src', 'lib', 'prompts', 'files', filename),
    // Monorepo fallback
    path.join(cwd, 'apps', 'web', 'src', 'lib', 'prompts', 'files', filename),
    // Legacy location (for backwards compatibility)
    path.join(cwd, 'src', 'lib', 'prompts', filename),
    path.join(cwd, 'apps', 'web', 'src', 'lib', 'prompts', filename),
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        console.log(`[prompts] Found ${filename} at: ${p}`);
        return p;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function getOnboardingSystemPrompt(): string {
  if (cachedPrompt) return cachedPrompt;

  // Priority 1: New TXT format (onboarding.txt)
  const txtPath = resolvePromptPath('onboarding.txt');
  if (txtPath) {
    try {
      cachedPrompt = fs.readFileSync(txtPath, 'utf-8');
      console.log('[prompts] Loaded onboarding.txt successfully');
      return cachedPrompt;
    } catch (err) {
      console.error('[prompts] Failed to read onboarding.txt:', err);
    }
  }

  // Priority 2: Legacy YAML format
  const yamlPath = resolvePromptPath('onboarding.yaml');
  if (yamlPath) {
    try {
      cachedPrompt = fs.readFileSync(yamlPath, 'utf-8');
      console.log('[prompts] Loaded onboarding.yaml (legacy)');
      return cachedPrompt;
    } catch (err) {
      console.error('[prompts] Failed to read onboarding.yaml:', err);
    }
  }

  // Final minimal fallback
  console.warn('[prompts] Falling back to minimal system prompt');
  cachedPrompt = `You are an empathetic, privacy-aware Biography Onboarding Assistant.
Your sole scope is to collect, confirm, and lightly validate a user's basic life data and communication preferences.

Stay in scope: Collect only basic life data (identity, family, education, career, influences).
Ask with focus: Ask one question at a time.
Be concise and warm.
Respond in the same language the user is using.`;
  return cachedPrompt;
}

// Clear cache (useful for development/testing)
export function clearPromptCache(): void {
  cachedPrompt = null;
}

export const ONBOARDING_SYSTEM_PROMPT = getOnboardingSystemPrompt();

// --- Runtime Assembler -------------------------------------------------------
export function buildOnboardingSystemPrompt(
  _messages: ReadonlyArray<CoreMessage> | ReadonlyArray<{ role: string; content: string }> = []
): string {
  // Add strict output constraints to avoid status banners and code fences in responses.
  const outputConstraints = [
    'OUTPUT_CONSTRAINTS:',
    '- Respond in plain text only (no code fences, no XML/JSON/YAML blocks).',
    "- Do not include any status headers or markers (e.g., 'prompt_generation_successful', 'RUNTIME_STATE', 'SYSTEM_READY').",
    '- Write direct, natural sentences only.'
  ].join('\n');

  return outputConstraints + '\n\n' + getOnboardingSystemPrompt();
}
