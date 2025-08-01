'use client'

import { ChatPlaceholder } from '@/modules/chat/ChatPlaceholder'

/**
 * Chat Page - Module entry point for dashboard shell
 * Loads chat placeholder module
 */
export default function ChatPage() {
  console.log('[ChatPage] Module page mounted')
  
  return <ChatPlaceholder />
}
