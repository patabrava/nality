import { LoginForm } from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return <LoginForm />
} 