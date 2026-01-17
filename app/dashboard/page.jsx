'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/auth'

function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      if (typeof window === 'undefined') return

      const authData = await getCurrentUser()
      if (!authData) {
        router.replace('/login')
        return
      }

      const role = authData.user.role
      const redirectTo =
        role === 'admin'
          ? '/admin'
          : role === 'courtier'
            ? '/dashboard-courtier'
            : '/dashboard-client'

      router.replace(redirectTo)
      setLoading(false)
    }

    run()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return null
}

export default DashboardPage

