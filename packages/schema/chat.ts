/**
 * Chat Message Types for Nality Chat System
 * 
 * These types are compatible with AI SDK message structure
 * and database schema from 005_create_chat_tables.sql
 */

import { z } from 'zod';

// Base message roles supported by the AI SDK
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';
export type ChatSessionType = 'onboarding' | 'general';
export type ExtractedEventStatus = 'pending' | 'accepted' | 'rejected';

// Core message structure compatible with AI SDK and database
export interface ChatMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: Date;
  metadata?: Record<string, unknown>;
}

// Database entity for chat sessions
export interface ChatSession {
  id: string;
  user_id: string;
  title?: string;
  type: ChatSessionType;
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, unknown>;
}

// Database entity for extracted life events from chat
export interface ChatExtractedEvent {
  id: string;
  session_id: string;
  message_id?: string;
  user_id: string;
  suggested_title: string;
  suggested_description?: string;
  suggested_date?: string; // ISO date string
  suggested_category?: string;
  confidence_score: number;
  status: ExtractedEventStatus;
  created_life_event_id?: string;
  created_at: Date;
  processed_at?: Date;
}

// Message types for specific roles
export interface UserMessage extends Omit<ChatMessage, 'role'> {
  role: 'user';
}

export interface AssistantMessage extends Omit<ChatMessage, 'role'> {
  role: 'assistant';
}

export interface SystemMessage extends Omit<ChatMessage, 'role'> {
  role: 'system';
}

// API request/response types
export interface ChatRequest {
  messages: Pick<ChatMessage, 'role' | 'content'>[];
  sessionId?: string;
}

export interface ChatResponse {
  message: AssistantMessage;
  sessionId: string;
}

// Error types for chat operations
export interface ChatError {
  message: string;
  code: 'INVALID_INPUT' | 'API_ERROR' | 'RATE_LIMIT' | 'UNAUTHORIZED';
  details?: string;
}

// Chat UI state management
export interface ChatUIState {
  isLoading: boolean;
  isTyping: boolean;
  error: ChatError | null;
  inputValue: string;
}

// Onboarding-specific types
export interface OnboardingProgress {
  stage: 'welcome' | 'story_discovery' | 'memory_expansion' | 'media_integration' | 'timeline_review';
  completedTopics: string[];
  suggestedQuestions: string[];
  timelineEvents: number;
}

export interface OnboardingChatState extends ChatUIState {
  session: ChatSession | null;
  messages: ChatMessage[];
  progress: OnboardingProgress;
  suggestions: string[];
}

// Zod schemas for runtime validation
export const MessageRoleSchema = z.enum(['user', 'assistant', 'system', 'tool']);

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  role: MessageRoleSchema,
  content: z.string().min(1),
  created_at: z.date(),
  metadata: z.record(z.unknown()).optional(),
});

export const ChatSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().optional(),
  type: z.enum(['onboarding', 'general']),
  created_at: z.date(),
  updated_at: z.date(),
  metadata: z.record(z.unknown()).optional(),
});

export const ChatExtractedEventSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  message_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  suggested_title: z.string().min(1),
  suggested_description: z.string().optional(),
  suggested_date: z.string().optional(),
  suggested_category: z.string().optional(),
  confidence_score: z.number().min(0).max(1),
  status: z.enum(['pending', 'accepted', 'rejected']),
  created_life_event_id: z.string().uuid().optional(),
  created_at: z.date(),
  processed_at: z.date().optional(),
});

// Type guards for message validation
export function isValidMessage(obj: unknown): obj is ChatMessage {
  try {
    ChatMessageSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

export function isUserMessage(message: ChatMessage): message is UserMessage {
  return message.role === 'user';
}

export function isAssistantMessage(message: ChatMessage): message is AssistantMessage {
  return message.role === 'assistant';
}

// Utility functions for chat operations
export function createUserMessage(content: string, sessionId: string, id?: string): UserMessage {
  return {
    id: id || generateMessageId(),
    session_id: sessionId,
    role: 'user',
    content,
    created_at: new Date(),
  };
}

export function createAssistantMessage(content: string, sessionId: string, id?: string): AssistantMessage {
  return {
    id: id || generateMessageId(),
    session_id: sessionId,
    role: 'assistant',
    content,
    created_at: new Date(),
  };
}

export function createSystemMessage(content: string, sessionId: string): SystemMessage {
  return {
    id: generateMessageId(),
    session_id: sessionId,
    role: 'system',
    content,
    created_at: new Date(),
  };
}

// Simple ID generator for messages
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate UUID for database entities
export function generateUUID(): string {
  return crypto.randomUUID();
} 