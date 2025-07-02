# Nality MVP

## Quick Start

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://yltgqpgblvktywtcdmbt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdGdxcGdibHZrdHl3dGNkbWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0Njk5NDYsImV4cCI6MjA2NzA0NTk0Nn0.2z2gqhUUtgsjJGqTfnpwMRJSzTYEobHBDU-Y5yTdIR0

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