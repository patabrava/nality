#!/bin/bash

echo "🔧 Nality Development Server Setup"
echo "=================================="

# Set Supabase environment variables for local development
export NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
export NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Set other environment variables
export NODE_ENV=development
export OPENAI_API_KEY=your_openai_api_key

echo "✅ Environment variables configured:"
echo "   NEXT_PUBLIC_SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:30}..."
echo ""

echo "🚀 Starting Next.js development server..."
echo "   Your app will be available at: http://localhost:3000"
echo ""

# Change to web directory and start development server
cd apps/web && pnpm dev 