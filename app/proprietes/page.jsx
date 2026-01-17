'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { FiHome } from 'react-icons/fi'
import { getCurrentUser } from '@/lib/supabase/auth'
import { getAnnoncesByCourtier } from '@/lib/supabase/annonces'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProprietesPage() {
  const [annonces, setAnnonces] = useState([])

  useEffect(() => {
    const load = async () => {
      if (typeof window === 'undefined') return
      const authData = await getCurrentUser()
      if (authData?.user) {
        const mes = await getAnnoncesByCourtier(authData.user.id)
        setAnnonces(mes)
      }
    }

    load()
  }, [])

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Propriétés</h1>
                <p className="text-gray-600">Toutes vos propriétés publiées</p>
              </div>
              {annonces.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <FiHome className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune propriété</h3>
                  <p className="text-gray-600 mb-6">Commencez par publier votre première propriété</p>
                  <Link
                    href="/publier"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg transition-colors font-medium"
                  >
                    Publier une propriété
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {annonces.map((annonce) => (
                    <Link key={annonce.id} href={`/annonces/${annonce.id}`}>
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                        <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden group">
                          {annonce.photos && annonce.photos.length > 0 ? (
                            <img src={annonce.photos[0]} alt={annonce.titre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiHome className="text-primary-600" size={64} />
                            </div>
                          )}
                        </div>
                        <div className="p-4 sm:p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{annonce.titre}</h3>
                          <p className="text-xl font-bold text-primary-600 mb-2">
                            {new Intl.NumberFormat('fr-FR').format(annonce.prix)} FCFA/mois
                          </p>
                          <p className="text-sm text-gray-600">{annonce.quartier}, {annonce.ville}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
