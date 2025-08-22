import fs from 'fs';
import path from 'path';
import type { CoreMessage } from 'ai';

let cachedPrompt: string | null = null;

function resolveYamlPath(): string | null {
  const cwd = process.cwd();
  const candidates = [
    // Most likely in the Next app workspace
    path.join(cwd, 'src', 'lib', 'prompts', 'onboarding.yaml'),
    // Monorepo fallback when cwd is the repo root
    path.join(cwd, 'nality', 'apps', 'web', 'src', 'lib', 'prompts', 'onboarding.yaml'),
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // ignore
    }
  }
  return null;
}

function resolveXmlPath(): string | null {
  const cwd = process.cwd();
  const candidates = [
    // Most likely in the Next app workspace
    path.join(cwd, 'src', 'lib', 'prompts', 'onboarding.xml'),
    // Monorepo fallback when cwd is the repo root
    path.join(cwd, 'nality', 'apps', 'web', 'src', 'lib', 'prompts', 'onboarding.xml'),
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // ignore
    }
  }
  return null;
}

export function getOnboardingSystemPrompt(): string {
  if (cachedPrompt) return cachedPrompt;

  // Prefer YAML
  const yamlPath = resolveYamlPath();
  if (yamlPath) {
    try {
      cachedPrompt = fs.readFileSync(yamlPath, 'utf-8');
      return cachedPrompt;
    } catch (err) {
      console.error('[onboarding] Failed to read onboarding.yaml:', err);
    }
  }

  // Fallback to XML
  const xmlPath = resolveXmlPath();
  if (xmlPath) {
    try {
      cachedPrompt = fs.readFileSync(xmlPath, 'utf-8');
      return cachedPrompt;
    } catch (err) {
      console.error('[onboarding] Failed to read onboarding.xml:', err);
    }
  }

  // Final minimal fallback
  console.warn('[onboarding] Unable to locate onboarding.yaml/xml. Falling back to minimal system prompt.');
  cachedPrompt = [
    'Systemrolle: empathischer, datenschutzbewusster Biografie-Onboarding-Assistent (DE).',
    'Bitte halte dich an knappe, klare Rückfragen, sammle nur grundlegende Lebensdaten (Identität, Familie, Bildung, Karriere, Einflüsse, Sprachstil).',
    'Verwende „du“ oder „Sie“ erst nach Klärung der Präferenz.',
  ].join('\n');
  return cachedPrompt;
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
