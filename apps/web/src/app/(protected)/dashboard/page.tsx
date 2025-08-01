'use client'

import { useEffect, useState } from 'react'
import { KPICard } from '@/components/dashboard/KPICard'
import { DurationWidget } from '@/components/dashboard/DurationWidget'
import { CategoryChart } from '@/components/dashboard/CategoryChart'

interface DashboardStats {
  totalEvents: number
  thisYearEvents: number
  thisMonthEvents: number
}

interface DateRange {
  startDate: string | null
  endDate: string | null
  totalYears: number
}

interface CategoryData {
  categories: Record<string, number>
  total: number
}

interface DashboardData {
  stats: DashboardStats | null
  range: DateRange | null
  categories: CategoryData | null
}

interface LoadingState {
  stats: boolean
  range: boolean
  categories: boolean
}

interface ErrorState {
  stats: string | null
  range: string | null
  categories: string | null
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    range: null,
    categories: null
  })
  
  const [loading, setLoading] = useState<LoadingState>({
    stats: true,
    range: true,
    categories: true
  })
  
  const [errors, setErrors] = useState<ErrorState>({
    stats: null,
    range: null,
    categories: null
  })

  const fetchDashboardData = async () => {
    console.log('[Dashboard] Starting data fetch...')
    const startTime = performance.now()

    // Fetch all dashboard data in parallel
    const promises = [
      fetch('/api/dashboard/stats').then(res => {
        if (!res.ok) throw new Error(`Stats API error: ${res.status}`)
        return res.json()
      }).then(result => ({ type: 'stats' as const, data: result })),
      
      fetch('/api/dashboard/range').then(res => {
        if (!res.ok) throw new Error(`Range API error: ${res.status}`)
        return res.json()
      }).then(result => ({ type: 'range' as const, data: result })),
      
      fetch('/api/dashboard/categories').then(res => {
        if (!res.ok) throw new Error(`Categories API error: ${res.status}`)
        return res.json()
      }).then(result => ({ type: 'categories' as const, data: result }))
    ]

    const results = await Promise.allSettled(promises)
    
    results.forEach((result, index) => {
      const dataType = ['stats', 'range', 'categories'][index] as keyof DashboardData
      
      if (result.status === 'fulfilled') {
        const { type, data: responseData } = result.value
        
        setData(prev => ({
          ...prev,
          [type]: responseData
        }))
        
        setErrors(prev => ({
          ...prev,
          [type]: null
        }))
        
        console.log(`[Dashboard] ${type} loaded:`, responseData)
      } else {
        const errorMessage = result.reason?.message || 'Unknown error'
        setErrors(prev => ({
          ...prev,
          [dataType]: errorMessage
        }))
        console.error(`[Dashboard] ${dataType} error:`, result.reason)
      }
      
      setLoading(prev => ({
        ...prev,
        [dataType]: false
      }))
    })

    const endTime = performance.now()
    console.log(`[Dashboard] Data fetch completed in ${endTime - startTime}ms`)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRetry = (dataType: keyof DashboardData) => {
    console.log(`[Dashboard] Retrying ${dataType} fetch...`)
    setLoading(prev => ({ ...prev, [dataType]: true }))
    setErrors(prev => ({ ...prev, [dataType]: null }))
    
    // Re-fetch specific data type
    fetchDashboardData()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 
          className="text-2xl font-bold"
          style={{ color: 'var(--c-primary-100)' }}
        >
          Dashboard
        </h1>
        <p 
          className="text-sm"
          style={{ color: 'var(--c-neutral-dark)' }}
        >
          Overview of your life timeline and key metrics
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Events"
          value={data.stats?.totalEvents}
          isLoading={loading.stats}
          error={errors.stats}
          onRetry={() => handleRetry('stats')}
        />
        <KPICard
          title="This Year"
          value={data.stats?.thisYearEvents}
          isLoading={loading.stats}
          error={errors.stats}
          onRetry={() => handleRetry('stats')}
        />
        <KPICard
          title="This Month"
          value={data.stats?.thisMonthEvents}
          isLoading={loading.stats}
          error={errors.stats}
          onRetry={() => handleRetry('stats')}
        />
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DurationWidget
          startDate={data.range?.startDate}
          endDate={data.range?.endDate}
          totalYears={data.range?.totalYears}
          isLoading={loading.range}
          error={errors.range}
          onRetry={() => handleRetry('range')}
        />
        
        <CategoryChart
          categories={data.categories?.categories}
          total={data.categories?.total}
          isLoading={loading.categories}
          error={errors.categories}
        />
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8">
          <summary 
            className="cursor-pointer text-sm font-medium mb-2"
            style={{ color: 'var(--c-neutral-dark)' }}
          >
            Debug Information
          </summary>
          <div 
            className="p-4 rounded-lg border text-xs font-mono"
            style={{ 
              backgroundColor: 'var(--c-neutral-light)',
              borderColor: 'var(--c-neutral-medium)',
              color: 'var(--c-neutral-dark)'
            }}
          >
            <div className="space-y-2">
              <div>
                <strong>Loading State:</strong> {JSON.stringify(loading, null, 2)}
              </div>
              <div>
                <strong>Error State:</strong> {JSON.stringify(errors, null, 2)}
              </div>
              <div>
                <strong>Data State:</strong> {JSON.stringify(data, null, 2)}
              </div>
            </div>
          </div>
        </details>
      )}
    </div>
  )
}
