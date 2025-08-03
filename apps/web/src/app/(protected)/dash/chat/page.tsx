'use client'

import { ChatModule } from '@/modules/chat/ChatModule'

/**
 * Chat Page - Module entry point for dashboard shell
 * Loads functional chat module
 */
export default function ChatPage() {
  console.log('[ChatPage] Module page mounted')
  
  return <ChatModule />
}
