'use client'

import { useState, useCallback } from 'react'
import { loadModule, type ModuleConfig, type ModuleLoadResult } from '@/lib/module-loader'

interface ModuleState {
  component: React.ComponentType<any> | null
  loading: boolean
  error: string | null
  loadTime: number | null
}

/**
 * Hook for managing module loading state
 * Implements Observable Implementation with structured logging
 */
export function useModuleLoader() {
  const [modules, setModules] = useState<Map<string, ModuleState>>(new Map())

  const loadModuleById = useCallback(async (config: ModuleConfig) => {
    console.log(`🚀 useModuleLoader: Starting load for ${config.id}`)
    
    // Set loading state
    setModules(prev => new Map(prev).set(config.id, {
      component: null,
      loading: true,
      error: null,
      loadTime: null
    }))

    try {
      const result: ModuleLoadResult = await loadModule(config)
      
      // Update with result
      setModules(prev => new Map(prev).set(config.id, {
        component: result.component,
        loading: false,
        error: result.error,
        loadTime: result.loadTime
      }))

      if (result.error) {
        console.error(`📉 Module load metrics: ${config.id} failed`, {
          error: result.error,
          loadTime: result.loadTime
        })
      } else {
        console.log(`📊 Module load metrics: ${config.id} success`, {
          loadTime: result.loadTime
        })
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected loading error'
      
      setModules(prev => new Map(prev).set(config.id, {
        component: null,
        loading: false,
        error: errorMessage,
        loadTime: null
      }))

      console.error(`💥 useModuleLoader: Unexpected error for ${config.id}`, error)
      throw error
    }
  }, [])

  const getModuleState = useCallback((moduleId: string): ModuleState => {
    return modules.get(moduleId) || {
      component: null,
      loading: false,
      error: null,
      loadTime: null
    }
  }, [modules])

  const clearModule = useCallback((moduleId: string) => {
    console.log(`🗑️ Clearing module: ${moduleId}`)
    setModules(prev => {
      const newMap = new Map(prev)
      newMap.delete(moduleId)
      return newMap
    })
  }, [])

  return {
    loadModule: loadModuleById,
    getModuleState,
    clearModule,
    moduleCount: modules.size
  }
}
