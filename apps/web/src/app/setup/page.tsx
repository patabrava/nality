'use client'

import { useState } from 'react'

export default function DatabaseSetupPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [databaseStatus, setDatabaseStatus] = useState<{
    ready: boolean
    tables: string[]
    error?: string
  }>({ ready: false, tables: [] })

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const checkDatabaseStatus = async () => {
    addLog('🔍 Checking database status...')
    try {
      const response = await fetch('/api/migrate')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setDatabaseStatus({
          ready: result.database_ready,
          tables: result.tables
        })
        addLog(`✅ Database check completed. Ready: ${result.database_ready}`)
        addLog(`📊 Found tables: ${result.tables.join(', ') || 'none'}`)
      } else {
        setDatabaseStatus({
          ready: false,
          tables: [],
          error: result.error
        })
        addLog(`❌ Database check failed: ${result.error}`)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      addLog(`❌ Database check failed: ${message}`)
      setDatabaseStatus({
        ready: false,
        tables: [],
        error: message
      })
    }
  }

  const openSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard/project/kjtpqfylijhbetpguntr/sql/new', '_blank')
  }

  const copySetupScript = async () => {
    try {
      const response = await fetch('/database_setup.sql')
      const sqlScript = await response.text()
      
      await navigator.clipboard.writeText(sqlScript)
      addLog('📋 Setup script copied to clipboard!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      addLog(`❌ Failed to copy setup script: ${message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Database Setup & Migration
          </h1>
          <p className="text-gray-600 mb-8">
            Initialize your Nality database with the required tables and policies.
          </p>
          
          {/* Status Card */}
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            databaseStatus.ready 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">
                {databaseStatus.ready ? '✅' : '⚠️'}
              </span>
              <h2 className="text-lg font-semibold">
                Database Status: {databaseStatus.ready ? 'Ready' : 'Needs Setup'}
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              {databaseStatus.ready 
                ? `Found ${databaseStatus.tables.length} tables: ${databaseStatus.tables.join(', ')}`
                : 'The life_event table and related schema need to be created.'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={checkDatabaseStatus}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              🔍 Check Database Status
            </button>
            
            <button
              onClick={openSupabaseDashboard}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              🚀 Open Supabase SQL Editor
            </button>
            
            <button
              onClick={copySetupScript}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              📋 Copy Setup Script
            </button>
          </div>

          {/* Instructions */}
          {!databaseStatus.ready && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🔧 Setup Instructions
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Click "Open Supabase SQL Editor" above to open your dashboard</li>
                <li>Click "Copy Setup Script" to copy the database setup SQL</li>
                <li>Paste the SQL script in the Supabase SQL Editor</li>
                <li>Click "Run" to execute the script</li>
                <li>Return here and click "Check Database Status" to verify</li>
              </ol>
            </div>
          )}

          {/* Success Message */}
          {databaseStatus.ready && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                🎉 Database Ready!
              </h3>
              <p className="text-green-800">
                Your database is properly configured. You can now use the timeline feature.
              </p>
              <a 
                href="/timeline" 
                className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Go to Timeline →
              </a>
            </div>
          )}

          {/* Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Setup Progress</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))}
                {logs.length === 0 && (
                  <div className="text-gray-500">Click "Check Database Status" to start...</div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">What Gets Created</h2>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                  <strong>users table</strong><br/>
                  User profiles linked to Supabase auth
                </div>
                <div className="p-3 bg-gray-50 rounded border-l-4 border-green-500">
                  <strong>life_event table</strong><br/>
                  Core timeline events with dates, categories, and metadata
                </div>
                <div className="p-3 bg-gray-50 rounded border-l-4 border-purple-500">
                  <strong>media_object table</strong><br/>
                  Images, videos, and documents linked to events
                </div>
                <div className="p-3 bg-gray-50 rounded border-l-4 border-yellow-500">
                  <strong>RLS Policies</strong><br/>
                  Row-level security ensuring users only see their own data
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
