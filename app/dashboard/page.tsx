import DashboardClient from './client'

// Disable static prerendering - this page requires user session
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return <DashboardClient />
}
