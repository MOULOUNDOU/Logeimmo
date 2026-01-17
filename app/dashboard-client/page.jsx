'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { getCurrentUser } from '@/lib/supabase/auth'
import { useEffect, useState } from 'react'
import { FiHome } from 'react-icons/fi'

export default function DashboardClientPage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const load = async () => {
      const authData = await getCurrentUser()
      setUser(authData?.user || null)
    }
    load()
  }, [])

  return (
    <ProtectedRoute requiredRole="client">
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <FiHome className="text-primary-500" size={28} />
                  <h1 className="text-3xl font-bold text-gray-900">Accueil</h1>
                </div>
                <p className="text-gray-600">
                  Bienvenue{user?.nom ? `, ${user.nom}` : ''}. Vous pouvez consulter les annonces sur la page d'accueil.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard client</h2>
                <p className="text-gray-600">
                  Utilisez le menu à gauche pour accéder à vos favoris, notifications et rechercher des courtiers.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
