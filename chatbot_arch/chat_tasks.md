# Chat Module MVP Development Plan

*Granular step-by-step tasks for implementing the chatbot module based on `chatbot_arch.md`*

---

## Phase 1: Core Infrastructure Setup

### Task 1.1: Create Chat Database Schema Migration
**Start:** Existing Supabase schema with users and life_events tables  
**End:** Chat tables (chat_sessions, chat_messages, chat_extracted_events) created  
**Test:** Migration applies successfully, tables visible in Supabase dashboard with proper relationships  
**Focus:** Database foundation for chat persistence  
**Files:**
- `supabase/migrations/005_create_chat_tables.sql`

**Validation:** 
- Can insert test chat session with user_id
- Can insert test message with session_id
- Foreign key constraints work correctly

### Task 1.2: Create Chat Types Package
**Start:** Chat database schema exists  
**End:** TypeScript types for all chat entities with validation  
**Test:** Types compile without errors, validation functions work correctly  
**Focus:** Type safety foundation  
**Files:**
- Update `packages/schema/chat.ts` with database-compatible types
- Add Zod schemas for runtime validation

**Validation:**
- Import types in test file without TypeScript errors
- Type guards correctly identify message roles
- Zod validation catches invalid chat data

### Task 1.3: Create Chat API Route Handlers
**Start:** Chat types defined  
**End:** Basic CRUD API routes for chat operations  
**Test:** All routes respond correctly, handle auth, return proper error codes  
**Focus:** Server-side API foundation  
**Files:**
- `apps/web/src/app/api/chat/messages/route.ts` - Message CRUD
- `apps/web/src/app/api/chat/sessions/route.ts` - Session management

**Validation:**
- GET /api/chat/sessions returns user's sessions
- POST /api/chat/messages creates message with proper user auth
- Error handling returns consistent JSON error responses

## Phase 2: Basic Chat Components

### Task 2.1: Create Base Chat UI Components
**Start:** API routes exist  
**End:** Basic chat interface components without AI integration  
**Test:** Components render correctly, handle props, show loading states  
**Focus:** UI foundation without business logic  
**Files:**
- `apps/web/src/components/chat/ChatInterface.tsx` - Main container
- `apps/web/src/components/chat/MessageList.tsx` - Message display
- `apps/web/src/components/chat/MessageInput.tsx` - Input field with send

**Validation:**
- Components render in Storybook/test environment
- Props are typed correctly
- Loading and error states display properly

### Task 2.2: Create Message Bubble Component
**Start:** Base components exist  
**End:** Individual message styling with user/assistant distinction  
**Test:** Messages display correctly with proper styling, timestamps, status indicators  
**Focus:** Message presentation following style.html design tokens  
**Files:**
- `apps/web/src/components/chat/MessageBubble.tsx`

**Validation:**
- User messages align right with correct background color
- AI messages align left with different styling
- Timestamps display in consistent format
- Uses style.html CSS custom properties correctly

### Task 2.3: Create Chat State Management Hooks
**Start:** UI components exist  
**End:** React hooks for chat state without real-time or AI  
**Test:** State updates correctly, optimistic updates work, error states handled  
**Focus:** Client-side state management  
**Files:**
- `apps/web/src/hooks/useChat.ts` - Main chat orchestration
- `apps/web/src/hooks/useChatMessages.ts` - Message operations with TanStack Query

**Validation:**
- Can send/receive messages with local state updates
- TanStack Query integration works for message fetching
- Error states are properly managed and exposed

## Phase 3: Dashboard Integration

### Task 3.1: Replace Chat Placeholder with Real Component
**Start:** Chat components and hooks exist  
**End:** ChatPlaceholder replaced with functional ChatInterface  
**Test:** Chat module loads in dashboard, basic messaging works  
**Focus:** Dashboard module integration  
**Files:**
- Update `apps/web/src/modules/chat/ChatPlaceholder.tsx` to import ChatInterface
- Or create `apps/web/src/modules/chat/ChatModule.tsx`

**Validation:**
- Chat tab in dashboard loads ChatInterface
- Can type messages and see them in message list
- Dashboard navigation to/from chat works

### Task 3.2: Add Chat State to Dashboard Store
**Start:** Chat module integrated into dashboard  
**End:** Dashboard store includes chat-related state (unread counts, last activity)  
**Test:** Dashboard shows unread indicators, chat state persists across navigation  
**Focus:** Global state integration  
**Files:**
- Update `apps/web/src/lib/dashboard-store.types.ts` with chat state
- Update `apps/web/src/lib/dashboard-store.ts` with chat actions

**Validation:**
- Tab navigation shows unread message count
- Last activity timestamp updates correctly
- State persists when navigating between dashboard modules

### Task 3.3: Add Chat Loading and Error States
**Start:** Chat integrated with dashboard store  
**End:** Proper loading and error handling with dashboard error boundaries  
**Test:** Error boundary catches chat errors, loading states work correctly  
**Focus:** Error resilience and user feedback  
**Files:**
- `apps/web/src/components/chat/ChatErrorBoundary.tsx`
- Update `apps/web/src/components/loading/ModuleLoadingState.tsx` for chat

**Validation:**
- Chat errors display in error boundary with retry options
- Module loading state shows chat-specific loading message
- Loading states don't block other dashboard functionality

## Phase 4: AI Integration

### Task 4.1: Create AI Streaming API Route
**Start:** Basic chat API exists  
**End:** Streaming AI responses using existing `/api/chat/route.ts` pattern  
**Test:** AI responds to messages, streaming works, maintains conversation context  
**Focus:** AI integration with existing chat API  
**Files:**
- Update `apps/web/src/app/api/chat/stream/route.ts` (may already exist)
- Ensure compatibility with existing AI integration

**Validation:**
- AI responds to user messages with relevant content
- Streaming responses appear word-by-word in chat
- Conversation context is maintained across messages

### Task 4.2: Create AI Streaming Hook
**Start:** AI streaming API exists  
**End:** React hook for handling streaming AI responses  
**Test:** Streaming responses display correctly, handle errors, manage loading states  
**Focus:** Client-side AI integration  
**Files:**
- `apps/web/src/hooks/useChatStream.ts` - AI streaming integration

**Validation:**
- Streaming text appears progressively in message bubbles
- Loading indicators show while AI is generating
- Stream errors are handled gracefully with retry options

### Task 4.3: Integrate AI Streaming with Chat Interface
**Start:** AI streaming hook exists  
**End:** Complete chat experience with AI responses  
**Test:** End-to-end chat with AI works, responses are contextual, errors handled  
**Focus:** Full chat functionality  
**Files:**
- Update `apps/web/src/components/chat/ChatInterface.tsx` with AI integration
- Update `apps/web/src/hooks/useChat.ts` to orchestrate AI responses

**Validation:**
- Users can have natural conversations with AI
- AI responses are relevant to timeline/life events context
- Conversation history is maintained and affects AI responses

## Phase 5: Real-time Features

### Task 5.1: Add Real-time Message Synchronization
**Start:** Basic chat with AI works  
**End:** Real-time updates using Supabase channels  
**Test:** Messages sync across browser tabs, real-time indicators work  
**Focus:** Real-time messaging infrastructure  
**Files:**
- `apps/web/src/hooks/useChatRealtime.ts` - Supabase real-time subscriptions

**Validation:**
- New messages appear in real-time across browser sessions
- Typing indicators work (if applicable)
- Connection status is properly managed and displayed

### Task 5.2: Add Typing Indicators and Presence
**Start:** Real-time sync exists  
**End:** Typing indicators and online presence features  
**Test:** Typing indicators appear/disappear correctly, presence is accurate  
**Focus:** Real-time user feedback  
**Files:**
- `apps/web/src/components/chat/TypingIndicator.tsx`
- Update real-time hooks with presence/typing state

**Validation:**
- Typing indicators show when AI is generating responses
- Presence indicators work correctly
- Performance impact is minimal

### Task 5.3: Add Message Status and Delivery Confirmation
**Start:** Real-time features exist  
**End:** Message delivery status and read receipts  
**Test:** Message status updates correctly, failed messages can be retried  
**Focus:** Message reliability and user confidence  
**Files:**
- Update message components with status indicators
- Add retry mechanisms for failed messages

**Validation:**
- Messages show sent/delivered/failed status
- Failed messages have retry buttons
- Status updates happen in real-time

## Phase 6: Advanced Features

### Task 6.1: Add Life Event Extraction from Conversations
**Start:** Full chat functionality works  
**End:** AI can suggest life events from conversation content  
**Test:** Life events are extracted correctly, suggestions are relevant  
**Focus:** Integration with timeline functionality  
**Files:**
- `supabase/functions/chat-extract-events/index.ts` - Event extraction
- UI components for reviewing extracted events

**Validation:**
- AI identifies potential life events in conversations
- Event suggestions are accurate and well-formatted
- Users can easily add extracted events to their timeline

### Task 6.2: Add Chat History and Search
**Start:** Event extraction works  
**End:** Message search and conversation history management  
**Test:** Search returns relevant results, history pagination works  
**Focus:** Chat data management and retrieval  
**Files:**
- Search functionality in chat components
- Pagination for long conversation histories

**Validation:**
- Users can search through chat history effectively
- Long conversations load efficiently with pagination
- Search results are highlighted and contextual

### Task 6.3: Add Chat Export and Context Management
**Start:** Search and history work  
**End:** Conversation export and advanced context management  
**Test:** Conversations can be exported, long conversations are summarized properly  
**Focus:** Data portability and performance optimization  
**Files:**
- Export functionality for conversations
- Context compression for long chats

**Validation:**
- Users can export conversations in readable format
- Long conversations don't cause performance issues
- Context summarization maintains conversation quality

## Phase 7: Performance and Polish

### Task 7.1: Optimize Chat Performance
**Start:** All features implemented  
**End:** Chat module meets performance targets from architecture  
**Test:** All performance metrics within target ranges  
**Focus:** Performance optimization  
**Files:**
- Virtual scrolling for long message lists
- Message bundling and pagination
- Memory usage optimization

**Validation:**
- Message send latency < 200ms
- AI response start < 2s
- Memory usage < 20MB for active sessions

### Task 7.2: Add Accessibility Features
**Start:** Performance optimized  
**End:** Full WCAG 2.1 AA compliance for chat interface  
**Test:** Screen readers work correctly, keyboard navigation functional  
**Focus:** Accessibility compliance  
**Files:**
- ARIA labels and live regions
- Keyboard navigation support
- High contrast theme support

**Validation:**
- Screen readers announce new messages
- All functionality accessible via keyboard
- High contrast mode works properly

### Task 7.3: Add Comprehensive Error Handling
**Start:** Accessibility complete  
**End:** All failure modes handled gracefully with recovery options  
**Test:** All error scenarios have appropriate fallbacks and recovery  
**Focus:** Error resilience and user experience  
**Files:**
- Comprehensive error boundaries
- Offline mode support
- Recovery mechanisms

**Validation:**
- AI service outages show appropriate fallback
- Network issues are handled gracefully
- Users can recover from all error states

## Phase 8: Integration Testing

### Task 8.1: End-to-End Chat Flow Testing
**Start:** All features complete  
**End:** Complete chat user journey tested and validated  
**Test:** All user flows work correctly from dashboard navigation to chat completion  
**Focus:** Integration validation  
**Files:**
- Integration test files
- User journey validation

**Validation:**
- Users can complete full onboarding conversation
- Timeline integration works end-to-end
- All error scenarios are properly handled

### Task 8.2: Performance Benchmarking
**Start:** E2E testing complete  
**End:** Performance benchmarks meet architecture targets  
**Test:** All performance targets achieved under load  
**Focus:** Performance validation  
**Files:**
- Performance test suite
- Load testing scenarios

**Validation:**
- All latency targets met under normal load
- Memory usage stays within bounds
- Concurrent users don't degrade performance

### Task 8.3: Production Deployment Preparation
**Start:** Performance validated  
**End:** Chat module ready for production deployment  
**Test:** Production environment works correctly with chat features  
**Focus:** Production readiness  
**Files:**
- Production configuration
- Monitoring and alerting setup

**Validation:**
- Production environment handles chat traffic
- Monitoring captures all relevant metrics
- Deployment process is reliable and reversible

---

## Success Criteria

### Core Functionality
- ✅ Users can have natural conversations with AI about their life events
- ✅ Chat integrates seamlessly with existing dashboard navigation
- ✅ Conversations are persisted and can be resumed
- ✅ AI can extract potential life events from conversations

### Performance Targets
- ✅ Message send latency < 200ms
- ✅ AI response start < 2s
- ✅ Real-time updates < 500ms
- ✅ Memory usage < 20MB per active session

### Integration Requirements
- ✅ Works within existing dashboard shell architecture
- ✅ Follows established error handling patterns
- ✅ Uses existing authentication and authorization
- ✅ Compatible with style.html design system

### User Experience Goals
- ✅ Accessible to all users (WCAG 2.1 AA)
- ✅ Graceful handling of all failure modes
- ✅ Seamless integration with timeline functionality
- ✅ Clear feedback for all user actions

---

This plan provides **25 atomic, testable tasks** that build the complete chat MVP incrementally while leveraging the existing codebase structure and maintaining compatibility with the established architecture patterns.
