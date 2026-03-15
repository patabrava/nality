type ServerConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  appUrl: string | null;
  geminiApiKey: string | null;
  deepgramKey: string | null;
  adminEmailWhitelist: string[];
};

let cachedConfig: ServerConfig | null = null;

export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

export function getOptionalEnv(name: string): string | null {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : null;
}

function getCsvEnv(name: string): string[] {
  const value = getOptionalEnv(name);
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function getServerConfig(): ServerConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig = {
    supabaseUrl: getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey: getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    supabaseServiceRoleKey: getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    appUrl: getOptionalEnv('NEXT_PUBLIC_APP_URL'),
    geminiApiKey:
      getOptionalEnv('GEMINI_API_KEY') || getOptionalEnv('GOOGLE_GENERATIVE_AI_API_KEY'),
    deepgramKey: getOptionalEnv('DEEPGRAM_KEY'),
    adminEmailWhitelist: getCsvEnv('ADMIN_EMAIL_WHITELIST'),
  };

  return cachedConfig;
}
