'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { FiTrendingUp } from 'react-icons/fi'
import { getCurrentUser } from '@/lib/supabase/auth'
import { getAnnoncesByCourtier } from '@/lib/supabase/annonces'
import { useState, useEffect } from 'react'

export default function RevenusPage() {
  const [stats, setStats] = useState({ total: 0, ceMois: 0, ceAnnee: 0 })

  useEffect(() => {
    const load = async () => {
      if (typeof window === 'undefined') return
      const authData = await getCurrentUser()
      if (authData?.user) {
        const mes = await getAnnoncesByCourtier(authData.user.id)
        const total = mes.reduce((sum, a) => sum + (a.prix || 0), 0)
        setStats({ total, ceMois: total * 0.3, ceAnnee: total })
      }
    }

    load()
  }, [])

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Revenus</h1>
                <p className="text-gray-600">Analysez vos revenus locatifs</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <FiTrendingUp className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Revenus totaux</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('fr-FR').format(stats.total)} FCFA
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <FiTrendingUp className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ce mois</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('fr-FR').format(stats.ceMois)} FCFA
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <FiTrendingUp className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cette année</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('fr-FR').format(stats.ceAnnee)} FCFA
                      </p>
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
