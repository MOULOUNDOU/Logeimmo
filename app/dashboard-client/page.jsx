'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { getCurrentUser } from '@/lib/supabase/auth'
import { useEffect, useState } from 'react'
import { FiHome, FiUsers, FiUser } from 'react-icons/fi'
import { getFollowerCount, getFollowingCount } from '@/lib/supabase/follows'

export default function DashboardClientPage() {
  const [user, setUser] = useState(null)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      const authData = await getCurrentUser()
      setUser(authData?.user || null)

      if (authData?.user?.id) {
        try {
          const [followers, following] = await Promise.all([
            getFollowerCount(authData.user.id),
            getFollowingCount(authData.user.id)
          ])
          setFollowersCount(followers)
          setFollowingCount(following)
        } catch (e) {
          console.error(e)
        }
      }
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

                <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    <div className="flex items-center justify-between gap-4 px-4 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700">
                          <FiUsers size={18} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">Abonnés</p>
                          <p className="text-xs text-gray-500">Personnes abonnées à toi</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-yellow-500">{followersCount}</p>
                    </div>

                    <div className="flex items-center justify-between gap-4 px-4 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 text-primary-700">
                          <FiUser size={18} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">Abonnements</p>
                          <p className="text-xs text-gray-500">Courtiers que tu suis</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-primary-600">{followingCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
