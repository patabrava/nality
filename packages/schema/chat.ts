/**
 * Chat Message Types for Nality Onboarding System
 * 
 * These types are compatible with AI SDK message structure
 * and provide type safety for chat-related data operations.
 */

// Base message roles supported by the AI SDK
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

// Core message structure compatible with AI SDK
export interface ChatMessage {
  id?: string;
  role: MessageRole;
  content: string;
  createdAt?: Date;
}

// Message for user input
export interface UserMessage extends Omit<ChatMessage, 'role'> {
  role: 'user';
}

// Message for AI assistant responses
export interface AssistantMessage extends Omit<ChatMessage, 'role'> {
  role: 'assistant';
}

// System message for prompts (not usually displayed in UI)
export interface SystemMessage extends Omit<ChatMessage, 'role'> {
  role: 'system';
}

// Chat conversation state
export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  type: 'onboarding' | 'general';
}

// Chat request/response types for API
export interface ChatRequest {
  messages: ChatMessage[];
  conversationId?: string;
}

export interface ChatResponse {
  message: AssistantMessage;
  conversationId: string;
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
  conversation: ChatConversation;
  progress: OnboardingProgress;
  suggestions: string[];
}

// Type guards for message validation
export function isValidMessage(obj: unknown): obj is ChatMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'role' in obj &&
    'content' in obj &&
    typeof (obj as ChatMessage).role === 'string' &&
    typeof (obj as ChatMessage).content === 'string' &&
    ['user', 'assistant', 'system', 'tool'].includes((obj as ChatMessage).role)
  );
}

export function isUserMessage(message: ChatMessage): message is UserMessage {
  return message.role === 'user';
}

export function isAssistantMessage(message: ChatMessage): message is AssistantMessage {
  return message.role === 'assistant';
}

// Utility functions for chat operations
export function createUserMessage(content: string, id?: string): UserMessage {
  return {
    id: id || generateMessageId(),
    role: 'user',
    content,
    createdAt: new Date(),
  };
}

export function createAssistantMessage(content: string, id?: string): AssistantMessage {
  return {
    id: id || generateMessageId(),
    role: 'assistant',
    content,
    createdAt: new Date(),
  };
}

export function createSystemMessage(content: string): SystemMessage {
  return {
    id: generateMessageId(),
    role: 'system',
    content,
    createdAt: new Date(),
  };
}

// Simple ID generator for messages
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// All types are already exported above 