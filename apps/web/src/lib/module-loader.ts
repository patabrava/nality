/**
 * Dynamic module loader with instrumentation and error handling
 * Implements Progressive Construction principle - load modules on demand
 */

export interface ModuleLoadResult {
  component: React.ComponentType<any> | null
  error: string | null
  loadTime: number
}

export interface ModuleConfig {
  id: string
  path: string
  displayName: string
}

// Observable Implementation - track loading metrics
const loadMetrics = new Map<string, { attempts: number; lastLoadTime: number }>()

export async function loadModule(config: ModuleConfig): Promise<ModuleLoadResult> {
  const startTime = performance.now()
  
  console.log(`🔄 Loading module: ${config.displayName} (${config.id})`)
  
  // Update metrics
  const metrics = loadMetrics.get(config.id) || { attempts: 0, lastLoadTime: 0 }
  metrics.attempts++
  loadMetrics.set(config.id, metrics)

  try {
    // Dynamic import with explicit error handling
    const module = await import(config.path)
    const component = module.default
    
    if (!component) {
      throw new Error(`Module ${config.id} has no default export`)
    }
    
    const loadTime = performance.now() - startTime
    metrics.lastLoadTime = loadTime
    
    console.log(`✅ Module loaded: ${config.displayName} in ${loadTime.toFixed(2)}ms`)
    
    return {
      component,
      error: null,
      loadTime
    }
  } catch (error) {
    const loadTime = performance.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown module loading error'
    
    console.error(`❌ Module load failed: ${config.displayName}`, {
      error: errorMessage,
      loadTime: loadTime.toFixed(2) + 'ms',
      attempts: metrics.attempts
    })
    
    // Graceful Fallbacks - return error state instead of throwing
    return {
      component: null,
      error: errorMessage,
      loadTime
    }
  }
}

export function getModuleMetrics(moduleId: string) {
  return loadMetrics.get(moduleId) || { attempts: 0, lastLoadTime: 0 }
}
