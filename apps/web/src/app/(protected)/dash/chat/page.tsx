'use client'

import { ChatModule } from '@/modules/chat/ChatModule'
import { usePageTitle } from '@/hooks/usePageTitle'

/**
 * Chat Page - Module entry point for dashboard shell
 * Loads functional chat module
 */
export default function ChatPage() {
  usePageTitle('Chat')
  console.log('[ChatPage] Module page mounted')
  
  return <ChatModule />
}
