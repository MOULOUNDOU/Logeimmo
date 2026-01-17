'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const run = async () => {
      const code = searchParams?.get('code')
      const error = searchParams?.get('error')
      const errorDescription = searchParams?.get('error_description')

      if (error) {
        setErrorMessage(errorDescription || 'Erreur lors de la validation')
        return
      }

      if (!code) {
        setErrorMessage('Code de validation manquant')
        return
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) {
        setErrorMessage(exchangeError.message || 'Erreur lors de la validation')
        return
      }

      router.replace('/dashboard')
      router.refresh()
    }

    run()
  }, [router, searchParams])

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Validation</h1>
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
              {errorMessage}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Validation en cours...</p>
      </div>
    </div>
  )
}
