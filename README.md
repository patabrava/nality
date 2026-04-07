# Nality MVP

## Requirements

- **Package Manager**: pnpm 9.12.3+ (required for monorepo workspace configuration)
- **Node.js**: 18+ 
- **Framework**: Next.js 15.3.5, React 19.x

## Quick Start

### Environment Setup

Copy the root `.env.example` into `apps/web/.env.local` and fill in the real values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key

# Server-only Supabase key (do not expose to the browser)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google AI / Gemini (one provider key is enough)
GEMINI_API_KEY=your_google_ai_api_key

# Optional speech provider
DEEPGRAM_KEY=your_deepgram_key

# Admin access
ADMIN_EMAIL_WHITELIST=admin@example.com

# Local Development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

**Important**: Use only pnpm to avoid package manager conflicts.

```bash
# Enable corepack for pnpm support
corepack enable

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev

# Type checking
pnpm type-check

# Route tests
pnpm --filter web test

# Production build
pnpm --filter web build
```

The protected staff workspace lives at `/admin` and is only available to authenticated users whose email is present in `ADMIN_EMAIL_WHITELIST`.

## Deployment

### Vercel Deployment

This project is optimized for Vercel deployment with:

- **Build Command**: `turbo build --filter=web` (configured in `vercel.json`)
- **Install Command**: `corepack enable && pnpm install`
- **Output Directory**: `apps/web/.next`

The repository includes:
- `vercel.json` with optimized monorepo configuration
- `turbo.json` with Vercel-compatible task definitions
- Workspace configuration for proper dependency resolution

### Local Build Verification

Before deploying, verify the build works locally:

```bash
pnpm install
pnpm type-check
pnpm --filter web test
pnpm --filter web build
```

## Architecture

This is a Next.js + Supabase monorepo built with TurboRepo and optimized for Vercel deployment.

**Package Structure**:
- `apps/web/` - Next.js application
- `packages/schema/` - Shared TypeScript schemas with Zod validation

See `architecture.md` for detailed technical documentation.
