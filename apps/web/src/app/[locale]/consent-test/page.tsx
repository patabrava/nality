import ConsentTestDashboard from '@/components/consent/ConsentTestDashboard'
import LandingHeader from '@/components/landing/navigation/LandingHeader'

export default function ConsentTestPage() {
  return (
    <>
      <LandingHeader />
      <main style={{ paddingTop: '80px' }}>
        <ConsentTestDashboard />
      </main>
    </>
  )
}