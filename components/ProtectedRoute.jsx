'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/auth'
import Image from 'next/image'

export default function ProtectedRoute({ children, requiredRole = null }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') return

      const authData = await getCurrentUser()
      
      if (!authData) {
        router.push('/login?from=' + encodeURIComponent(window.location.pathname))
        setIsAuthorized(false)
        setIsLoading(false)
        return
      }

      if (requiredRole) {
        const required = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
        if (!required.includes(authData?.user?.role)) {
          const role = authData?.user?.role
          const redirectTo =
            role === 'admin'
              ? '/admin'
              : role === 'courtier'
                ? '/dashboard-courtier'
                : '/annonces'
          router.replace(redirectTo)
          setIsAuthorized(false)
          setIsLoading(false)
          return
        }
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, requiredRole])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden">
            <Image src="/digicode-immo-logo.jpeg" alt="Digicode Immo" width={72} height={72} priority className="animate-pulse" />
          </div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return children
}

