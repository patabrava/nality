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
  // In development, always read fresh prompt to pick up changes
  if (cachedPrompt && process.env.NODE_ENV === 'production') return cachedPrompt;

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
  cachedPrompt = `Du bist ein einfühlsamer, datenschutzbewusster Onboarding-Begleiter für Biografien.
Deine einzige Aufgabe ist es, grundlegende Lebensdaten und Kommunikationsvorlieben der Person zu erfassen, zu bestätigen und behutsam zu prüfen.

Bleibe beim Thema: Erfasse nur Basisdaten zu Identität, Familie, Bildung, Beruf und Einflüssen.
Stelle immer nur eine Frage auf einmal.
Bleibe knapp und warm.
Antworte konsequent auf Deutsch.`;
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
    'AUSGABEREGELN:',
    '- Antworte nur als Fließtext (keine Codeblöcke, kein XML/JSON/YAML).',
    "- Füge keine Statusüberschriften oder Marker ein (zum Beispiel 'prompt_generation_successful', 'RUNTIME_STATE', 'SYSTEM_READY').",
    '- Nutze keine Markdown-Formatierung (kein Fettdruck, keine Kursivschrift, keine Überschriften, keine Listen).',
    '- Schreibe nur direkte, natürliche Sätze.',
  ].join('\n');

  return outputConstraints + '\n\n' + getOnboardingSystemPrompt();
}
