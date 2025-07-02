# Nality MVP

## Quick Start

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key

# OpenAI Configuration (for Edge Functions)
OPENAI_API_KEY=your_openai_api_key

# Local Development
NODE_ENV=development
```

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

## Architecture

This is a Next.js + Supabase monorepo built with TurboRepo. See `architecture.md` for detailed technical documentation. 