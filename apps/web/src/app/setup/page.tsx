'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DatabaseSetupPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])
  const [databaseStatus, setDatabaseStatus] = useState<{
    ready: boolean
    tables: string[]
    error?: string
  }>({ ready: false, tables: [] })

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      router.replace('/dash')
    }
  }, [router])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const checkDatabaseStatus = async () => {
    addLog('🔍 Datenbankstatus wird geprüft...')
    try {
      const response = await fetch('/api/migrate')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setDatabaseStatus({
          ready: result.database_ready,
          tables: result.tables
        })
        addLog(`✅ Datenbankprüfung abgeschlossen. Bereit: ${result.database_ready}`)
        addLog(`📊 Gefundene Tabellen: ${result.tables.join(', ') || 'keine'}`)
      } else {
        setDatabaseStatus({
          ready: false,
          tables: [],
          error: result.error
        })
        addLog(`❌ Datenbankprüfung fehlgeschlagen: ${result.error}`)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      addLog(`❌ Datenbankprüfung fehlgeschlagen: ${message}`)
      setDatabaseStatus({
        ready: false,
        tables: [],
        error: message
      })
    }
  }

  const openSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard', '_blank')
  }

  const copySetupScript = async () => {
    try {
      const response = await fetch('/database_setup.sql')
      const sqlScript = await response.text()
      
      await navigator.clipboard.writeText(sqlScript)
      addLog('📋 Einrichtungs-Skript in die Zwischenablage kopiert!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      addLog(`❌ Einrichtungs-Skript konnte nicht kopiert werden: ${message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Datenbankeinrichtung und Migration
          </h1>
          <p className="text-gray-600 mb-8">
            Richte deine Nality-Datenbank mit den erforderlichen Tabellen und Richtlinien ein.
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
                Datenbankstatus: {databaseStatus.ready ? 'Bereit' : 'Einrichtung nötig'}
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              {databaseStatus.ready 
                ? `${databaseStatus.tables.length} Tabellen gefunden: ${databaseStatus.tables.join(', ')}`
                : 'Die Tabelle life_event und das zugehörige Schema müssen erstellt werden.'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={checkDatabaseStatus}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              🔍 Datenbankstatus prüfen
            </button>
            
            <button
              onClick={openSupabaseDashboard}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              🚀 Supabase-SQL-Editor öffnen
            </button>
            
            <button
              onClick={copySetupScript}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              📋 Einrichtungs-Skript kopieren
            </button>
          </div>

          {/* Instructions */}
          {!databaseStatus.ready && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🔧 Einrichtungsanleitung
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Klicke oben auf „Supabase-SQL-Editor öffnen“, um deinen Bereich zu öffnen</li>
                <li>Klicke auf „Einrichtungs-Skript kopieren“, um das SQL-Skript zu kopieren</li>
                <li>Füge das SQL-Skript in den Supabase-SQL-Editor ein</li>
                <li>Klicke auf „Ausführen“, um das Skript auszuführen</li>
                <li>Kehre hierher zurück und prüfe den Datenbankstatus erneut</li>
              </ol>
            </div>
          )}

          {/* Success Message */}
          {databaseStatus.ready && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                🎉 Datenbank bereit!
              </h3>
              <p className="text-green-800">
                Deine Datenbank ist korrekt eingerichtet. Du kannst jetzt die Zeitleiste nutzen.
              </p>
              <a 
                href="/timeline" 
                className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Zur Zeitleiste →
              </a>
            </div>
          )}

          {/* Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Einrichtungsfortschritt</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))}
                {logs.length === 0 && (
                  <div className="text-gray-500">Klicke auf „Datenbankstatus prüfen“, um zu beginnen...</div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Was erstellt wird</h2>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                  <strong>Benutzerdaten</strong><br/>
                  Benutzerprofile, die mit Supabase-Auth verknüpft sind
                </div>
                <div className="p-3 bg-gray-50 rounded border-l-4 border-green-500">
                  <strong>Lebensereignisse</strong><br/>
                  Zentrale Zeitleisten-Ereignisse mit Daten, Kategorien und Metadaten
                </div>
                <div className="p-3 bg-gray-50 rounded border-l-4 border-purple-500">
                  <strong>Medienobjekte</strong><br/>
                  Bilder, Videos und Dokumente, die Ereignissen zugeordnet sind
                </div>
                <div className="p-3 bg-gray-50 rounded border-l-4 border-yellow-500">
                  <strong>RLS-Richtlinien</strong><br/>
                  Zeilenbasierte Sicherheit, damit Nutzer nur ihre eigenen Daten sehen
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
