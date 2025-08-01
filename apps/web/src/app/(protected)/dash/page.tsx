'use client'

export default function DashboardPage() {
  console.log('📊 Dashboard page mounted')

  return (
    <div className="h-full p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: 'var(--font-primary)' }}>
          Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Placeholder KPI cards */}
          <div 
            className="rounded-lg p-6"
            style={{ backgroundColor: 'var(--c-neutral-dark)' }}
          >
            <h3 className="text-lg font-semibold mb-2">Life Events</h3>
            <p className="text-3xl font-bold" style={{ color: '#007AFF' }}>--</p>
            <p className="text-sm" style={{ color: 'var(--c-neutral-medium)' }}>Total events</p>
          </div>
          
          <div 
            className="rounded-lg p-6"
            style={{ backgroundColor: 'var(--c-neutral-dark)' }}
          >
            <h3 className="text-lg font-semibold mb-2">Timeline Range</h3>
            <p className="text-lg font-bold" style={{ color: '#10B981' }}>-- to --</p>
            <p className="text-sm" style={{ color: 'var(--c-neutral-medium)' }}>Date coverage</p>
          </div>
          
          <div 
            className="rounded-lg p-6"
            style={{ backgroundColor: 'var(--c-neutral-dark)' }}
          >
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <p className="text-lg font-bold" style={{ color: '#8B5CF6' }}>-- types</p>
            <p className="text-sm" style={{ color: 'var(--c-neutral-medium)' }}>Event categories</p>
          </div>
        </div>
        
        <div 
          className="mt-8 p-4 rounded-lg"
          style={{ backgroundColor: 'var(--c-neutral-medium)' }}
        >
          <p className="text-sm" style={{ color: 'var(--c-primary-100)' }}>
            ✅ Dashboard shell working - Tab navigation functional
          </p>
        </div>
      </div>
    </div>
  )
}
