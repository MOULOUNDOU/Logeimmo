'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FiArrowLeft, FiMail, FiSend } from 'react-icons/fi'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (!email.trim()) {
        throw new Error("L'email est requis")
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false
        }
      })

      if (error) {
        throw new Error(error.message || "Erreur lors de l'envoi du code")
      }

      setSuccessMessage('Un code de validation a été envoyé par email. Redirection...')
      setTimeout(() => {
        router.push(`/auth/reset?email=${encodeURIComponent(email.trim())}`)
      }, 800)
    } catch (err) {
      setErrorMessage(err.message || "Erreur lors de l'envoi du code")
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié</h1>
            <p className="text-gray-600">Entrez votre email pour recevoir un code OTP</p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-500 hover:bg-primary-600 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend size={20} />
              {isSubmitting ? 'Envoi...' : 'Envoyer le code'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un code ?{' '}
              <Link href={`/auth/reset?email=${encodeURIComponent(email || '')}`} className="text-primary-600 hover:text-primary-700 font-medium">
                Valider le code
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
