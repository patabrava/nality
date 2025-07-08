'use client'

import { useEffect, useState } from 'react'
import { testSupabaseConnection } from '@/lib/supabase/test'

// Force dynamic rendering to avoid build-time Supabase initialization
export const dynamic = 'force-dynamic'

export default function TestPage() {
  console.log('Environment variables during render:')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log('All env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')))
  
  const hasEnvVars = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>Environment Variables Test</h1>
      <div style={{ marginBottom: '20px' }}>
        <strong>Status:</strong> {hasEnvVars ? '✅ Environment variables loaded' : '❌ Environment variables missing'}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {supabaseUrl || 'undefined'}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'}
      </div>
      <div style={{ marginBottom: '20px' }}>
        <strong>All NEXT_PUBLIC_ variables:</strong> {Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')).join(', ') || 'none found'}
      </div>
      {hasEnvVars && (
        <div style={{ marginTop: '20px' }}>
          <p>✅ Environment variables are correctly loaded. The issue might be elsewhere.</p>
        </div>
      )}
      {!hasEnvVars && (
        <div style={{ marginTop: '20px' }}>
          <p>❌ Environment variables are not loaded. This confirms the issue.</p>
          <p>Troubleshooting steps:</p>
          <ul>
            <li>Check if .env.local exists in apps/web/</li>
            <li>Verify file encoding (should be UTF-8)</li>
            <li>Restart development server</li>
            <li>Clear .next cache</li>
          </ul>
        </div>
      )}
    </div>
  )
} 