'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { FiMail, FiKey, FiArrowLeft } from 'react-icons/fi'
import Image from 'next/image'

export default function AuthVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const initialEmail = searchParams?.get('email') || ''
    setEmail(initialEmail)
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (!email.trim()) {
        throw new Error("L'email est requis")
      }
      if (!token.trim()) {
        throw new Error('Le code est requis')
      }

      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'signup'
      })

      if (error) {
        throw new Error(error.message || 'Code invalide')
      }

      setSuccessMessage('Compte validé avec succès. Redirection...')
      router.replace('/dashboard')
      router.refresh()
    } catch (err) {
      setErrorMessage(err.message || 'Erreur lors de la validation')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4 transition-colors"
        >
          <FiArrowLeft size={18} />
          <span className="text-sm font-medium">Retour à la connexion</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-20 w-20 rounded-2xl overflow-hidden border border-gray-200 bg-white">
              <Image src="/digicode-immo-logo.jpeg" alt="Digicode Immo" width={80} height={80} priority />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Digicode Immo</h1>
            <p className="text-gray-600">Validez votre compte</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                Code de validation
              </label>
              <div className="relative">
                <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="token"
                  name="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="123456"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Entrez le code reçu par email depuis Supabase.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-500 hover:bg-primary-600 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Validation...' : 'Valider le compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
