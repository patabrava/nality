Read file: architecture.md

# Nality MVP Development Plan

Based on the technical architecture, here's a granular, dependency-ordered plan where each task is incredibly small, testable, and focused on a single concern.

## Phase 1: Infrastructure Foundation

### Task 1.1: Initialize Monorepo Structure
**Start:** Empty repository  
**End:** Working TurboRepo with package.json workspaces  
**Test:** `pnpm install` runs successfully, `turbo` command available  
**Focus:** Project scaffolding  
**Files:** `package.json`, `turbo.json`, `pnpm-workspace.yaml`

### Task 1.2: Create Supabase Project
**Start:** Local development environment  
**End:** Supabase project created with CLI configured  
**Test:** `supabase status` shows running services  
**Focus:** Backend infrastructure  
**Files:** `supabase/config.toml`, local Docker containers running

### Task 1.3: Setup Environment Configuration
**Start:** Supabase project created  
**End:** Environment variables properly configured for local dev  
**Test:** `.env.local` loads correctly, Supabase connection established  
**Focus:** Configuration management  
**Files:** `.env.example`, `.env.local`, `.gitignore` updates

## Phase 2: Database Schema Foundation

### Task 2.1: Create Core User Tables Migration
**Start:** Supabase project initialized  
**End:** `users` table with basic profile fields  
**Test:** Migration applies successfully, table visible in Supabase dashboard  
**Focus:** User data persistence  
**Files:** `supabase/migrations/001_create_users.sql`

### Task 2.2: Create Life Events Table Migration
**Start:** Users table exists  
**End:** `life_event` table with required fields and foreign keys  
**Test:** Can insert/query life events with user_id relationship  
**Focus:** Core timeline data structure  
**Files:** `supabase/migrations/002_create_life_events.sql`

### Task 2.3: Create Media Objects Table Migration
**Start:** Life events table exists  
**End:** `media_object` table with storage references  
**Test:** Can link media objects to life events  
**Focus:** Media metadata persistence  
**Files:** `supabase/migrations/003_create_media_objects.sql`

### Task 2.4: Setup Basic RLS Policies
**Start:** Core tables exist  
**End:** Owner-scoped RLS policies on all tables  
**Test:** Authenticated user can only access their own data  
**Focus:** Data security  
**Files:** `supabase/migrations/004_setup_rls.sql`

## Phase 3: Next.js Application Bootstrap

### Task 3.1: Initialize Next.js App
**Start:** Monorepo structure exists  
**End:** Basic Next.js 14 app with App Router  
**Test:** `pnpm dev` serves landing page at localhost:3000  
**Focus:** Frontend foundation  
**Files:** `apps/web/package.json`, `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`

### Task 3.2: Setup TypeScript Configuration
**Start:** Next.js app running  
**End:** Strict TypeScript config with proper paths  
**Test:** No TypeScript errors, proper path resolution  
**Focus:** Type safety  
**Files:** `apps/web/tsconfig.json`, type definitions

### Task 3.3: Install and Configure Tailwind CSS
**Start:** Next.js app with TypeScript  
**End:** Tailwind CSS working with basic styles  
**Test:** Can apply Tailwind classes, styles render correctly  
**Focus:** Styling foundation  
**Files:** `apps/web/tailwind.config.js`, `apps/web/styles/globals.css`

### Task 3.4: Setup Supabase Client Helper
**Start:** Next.js app configured  
**End:** Supabase client singleton with proper types  
**Test:** Can connect to Supabase from Next.js app  
**Focus:** Backend connectivity  
**Files:** `apps/web/lib/supabase/client.ts`, `apps/web/lib/supabase/server.ts`

## Phase 4: Authentication System

### Task 4.1: Configure Supabase Auth
**Start:** Supabase project and Next.js client exist  
**End:** Auth providers configured (magic link)  
**Test:** Auth configuration visible in Supabase dashboard  
**Focus:** Auth backend setup  
**Files:** Supabase dashboard configuration

### Task 4.2: Create Auth Helper Hook
**Start:** Supabase auth configured  
**End:** `useAuth` hook with login/logout/session state  
**Test:** Hook returns proper auth state, handles loading states  
**Focus:** Auth state management  
**Files:** `apps/web/hooks/useAuth.ts`

### Task 4.3: Create Login Component
**Start:** Auth hook exists  
**End:** Simple magic link login form  
**Test:** Can send magic link email successfully  
**Focus:** User login UI  
**Files:** `apps/web/components/auth/LoginForm.tsx`

### Task 4.4: Create Auth Layout Wrapper
**Start:** Login component exists  
**End:** Protected route wrapper that redirects unauthenticated users  
**Test:** Unauthenticated users redirected to login  
**Focus:** Route protection  
**Files:** `apps/web/app/(protected)/layout.tsx`

### Task 4.5: Create Basic Profile Page
**Start:** Auth protection working  
**End:** Simple profile page showing user email  
**Test:** Authenticated users can view their profile  
**Focus:** Auth verification  
**Files:** `apps/web/app/(protected)/profile/page.tsx`

## Phase 5: Core Timeline Functionality

### Task 5.1: Create Life Event Type Definitions
**Start:** Database schema exists  
**End:** TypeScript types matching database schema  
**Test:** Types compile correctly, match database structure  
**Focus:** Type safety for data  
**Files:** `packages/schema/life-event.ts`

### Task 5.2: Create Life Event CRUD Hooks
**Start:** Types and auth exist  
**End:** `useLifeEvents` hook with basic CRUD operations  
**Test:** Can create, read, update, delete life events  
**Focus:** Data operations  
**Files:** `apps/web/hooks/useLifeEvents.ts`

### Task 5.3: Create Life Event Card Component
**Start:** CRUD hooks exist  
**End:** Simple card component displaying life event data  
**Test:** Renders life event with title, description, dates  
**Focus:** Data display  
**Files:** `apps/web/components/timeline/LifeEventCard.tsx`

### Task 5.4: Create Life Event Form Component
**Start:** Card component exists  
**End:** Form for creating/editing life events  
**Test:** Can submit form and create/update life events  
**Focus:** Data input  
**Files:** `apps/web/components/timeline/LifeEventForm.tsx`

### Task 5.5: Create Basic Timeline Page
**Start:** Card and form components exist  
**End:** Timeline page listing all user's life events  
**Test:** Shows user's life events, can add new ones  
**Focus:** Timeline display  
**Files:** `apps/web/app/(protected)/timeline/page.tsx`

Phase 6: Onboarding Chat System
Task 6.1: Setup AI SDK Dependencies and Environment
Start: Next.js application configured
End: AI SDK packages installed and Gemini API key configured in environment
Test: `pnpm install` succeeds, environment variables loaded correctly
Focus: AI service foundation
Files: `apps/web/package.json`, `.env.local` (GEMINI_API_KEY)

Task 6.2: Define Onboarding System Prompt
Start: Environment configured
End: System prompt constant defining AI persona for onboarding conversations
Test: Prompt exports correctly and follows onboarding guidance patterns
Focus: AI behavior specification
Files: `apps/web/lib/prompts/onboarding.ts`

Task 6.3: Create Chat API Route
Start: AI SDK installed and system prompt defined
End: Next.js API route at `/api/chat/route.ts` using streamText with Gemini
Test: API route accepts POST requests, streams responses correctly, handles errors gracefully
Focus: Chat backend processing
Files: `apps/web/app/api/chat/route.ts`

Task 6.4: Create Chat Message Types
Start: API route functional
End: TypeScript types for chat messages compatible with AI SDK
Test: Types compile and match AI SDK message structure
Focus: Type safety for chat data
Files: `packages/schema/chat.ts`

Task 6.5: Create Basic Chat Interface Component
Start: Types defined and API route working
End: Simple chat component using useChat hook from AI SDK
Test: Can send messages, display conversation, handle loading states
Focus: Chat UI implementation
Files: `apps/web/components/onboarding/ChatInterface.tsx`

Task 6.6: Enhance Chat Interface with Onboarding UX
Start: Basic chat interface working
End: Enhanced chat with onboarding-specific styling and user guidance
Test: Chat guides users through onboarding flow with clear prompts
Focus: Onboarding user experience
Files: Updated `apps/web/components/onboarding/ChatInterface.tsx`

Task 6.7: Create Onboarding Page with Chat Integration
Start: Enhanced chat interface complete
End: Onboarding page integrating chat with proper layout and context
Test: Users can access onboarding chat, conversation flows naturally
Focus: Complete onboarding experience
Files: `apps/web/app/(protected)/onboarding/page.tsx`


Phase 7: Media Upload System
Task 7.1: Configure Supabase Storage
Start: Supabase project exists
End: Storage bucket configured with proper policies
Test: Can upload files through Supabase dashboard
Focus: File storage backend
Files: Supabase Storage bucket configuration
Task 7.2: Create Media Upload Hook
Start: Storage configured
End: Hook for uploading files with progress tracking
Test: Can upload images/videos, track progress
Focus: File upload functionality
Files: apps/web/hooks/useMediaUpload.ts
Task 7.3: Create File Upload Component
Start: Upload hook exists
End: Drag-and-drop file upload component
Test: Can select and upload files with visual feedback
Focus: Upload user interface
Files: apps/web/components/media/FileUploader.tsx
Task 7.4: Create Media Gallery Component
Start: Upload component exists
End: Component to display uploaded media
Test: Shows thumbnails of uploaded images/videos
Focus: Media display
Files: apps/web/components/media/MediaGallery.tsx
Task 7.5: Integrate Media with Life Events
Start: Media components and life events exist
End: Can attach media to life events
Test: Life events can display associated media
Focus: Media-timeline integration
Files: Updated LifeEventForm.tsx and LifeEventCard.tsx
Task 7.6 (New): Define Media Analysis System Prompt
Start: Media upload is functional. Life Event schema is defined.
End: A version-controlled system prompt is created to instruct the AI to analyze a media transcript and extract structured life event data (e.g., title, date, description, emotions) in a specific JSON format.
Test: Prompt is manually tested in an AI playground with sample transcripts to ensure it reliably outputs the correct JSON structure.
Focus: Structured Data Extraction from Unstructured Text.
Files: packages/ai/prompts/media-analysis.ts (exporting the prompt as a constant)

## Phase 8: PDF Export System

### Task 8.1: Create PDF Export Edge Function
**Start:** Life events and media systems exist  
**End:** Edge Function that generates basic PDF  
**Test:** Function returns PDF blob when called  
**Focus:** PDF generation backend  
**Files:** `supabase/functions/pdf-export/index.ts`

### Task 8.2: Create PDF Export Hook
**Start:** PDF Edge Function exists  
**End:** Hook that requests PDF generation  
**Test:** Can trigger PDF generation and download  
**Focus:** PDF export frontend  
**Files:** `apps/web/hooks/usePdfExport.ts`

### Task 8.3: Create Export Button Component
**Start:** PDF hook exists  
**End:** Button that triggers PDF export with loading state  
**Test:** Button generates and downloads PDF  
**Focus:** Export user interface  
**Files:** `apps/web/components/timeline/ExportButton.tsx`

### Task 8.4: Add Export to Timeline Page
**Start:** Export button exists  
**End:** Export functionality integrated into timeline  
**Test:** Users can export their timeline as PDF  
**Focus:** Feature integration  
**Files:** Updated `apps/web/app/(protected)/timeline/page.tsx`

## Phase 9: State Management & Real-time Updates

### Task 9.1: Setup Zustand Store
**Start:** Core features working  
**End:** Zustand store for UI state (modals, toasts)  
**Test:** Store manages UI state properly  
**Focus:** Client state management  
**Files:** `apps/web/store/ui.ts`

### Task 9.2: Setup TanStack Query
**Start:** Zustand configured  
**End:** TanStack Query for server state caching  
**Test:** API calls are cached and synchronized  
**Focus:** Server state management  
**Files:** `apps/web/lib/query-client.ts`

### Task 9.3: Add Realtime Subscriptions
**Start:** TanStack Query configured  
**End:** Real-time updates for life events  
**Test:** Changes in one browser tab appear in another  
**Focus:** Real-time synchronization  
**Files:** Updated timeline hooks with Supabase channels

## Phase 10: Landing Page & Navigation

### Task 10.1: Create Landing Page Components
**Start:** Protected routes working  
**End:** Marketing landing page with "Start My Story" CTA  
**Test:** Landing page renders with proper styling  
**Focus:** User acquisition  
**Files:** `apps/web/components/landing/Hero.tsx`, `apps/web/app/page.tsx`

### Task 10.2: Create Navigation Component
**Start:** Landing page exists  
**End:** Navigation with auth-aware menu items  
**Test:** Navigation shows appropriate links based on auth state  
**Focus:** User navigation  
**Files:** `apps/web/components/layout/Navigation.tsx`

### Task 10.3: Add Loading States and Error Handling
**Start:** Core functionality complete  
**End:** Proper loading states and error boundaries  
**Test:** App handles loading and error states gracefully  
**Focus:** User experience polish  
**Files:** Error components, loading components throughout app

## Testing & Deployment Readiness

### Task 11.1: Add Basic Unit Tests
**Start:** Core features complete  
**End:** Jest/Vitest tests for core utilities and hooks  
**Test:** `pnpm test` passes all tests  
**Focus:** Code quality assurance  
**Files:** Test files for hooks and utilities

### Task 11.2: Add Integration Tests
**Start:** Unit tests exist  
**End:** Tests for critical user flows (auth, timeline CRUD)  
**Test:** Integration tests pass consistently  
**Focus:** Feature reliability  
**Files:** Integration test files

### Task 11.3: Setup GitHub Actions CI
**Start:** Tests exist  
**End:** CI pipeline for linting, testing, and building  
**Test:** CI passes on pull requests  
**Focus:** Deployment automation  
**Files:** `.github/workflows/ci.yml`

### Task 11.4: Production Environment Setup
**Start:** CI pipeline working  
**End:** Production Supabase project configured  
**Test:** Can deploy to production successfully  
**Focus:** Production readiness  
**Files:** Production environment configuration

---

## Task Execution Notes

**For the Engineering LLM:**
- Complete tasks in exact order due to dependencies
- Test each task thoroughly before moving to next
- Each task should be completable in 1-2 hours
- If a task seems too large, break it into smaller subtasks
- Always include error handling and loading states
- Follow the established patterns from architecture.md
- Use TypeScript strictly throughout
- Implement proper error boundaries for user experience

**Testing Between Tasks:**
- After each task, verify the success criteria
- Check that new functionality doesn't break existing features  
- Ensure proper TypeScript compilation
- Test in browser with actual user interactions
- Verify database operations work correctly

This plan provides 35+ atomic, testable tasks that build the complete MVP incrementally while allowing for testing at each step.