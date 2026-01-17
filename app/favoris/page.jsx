'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { getCurrentUser } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase'
import { FiHeart, FiHome } from 'react-icons/fi'

export default function FavorisPage() {
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const authData = await getCurrentUser()
      const userId = authData?.user?.id
      if (!userId) {
        setFavorites([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('likes')
        .select('annonce_id, annonces!likes_annonce_id_fkey(id, titre, prix, ville, quartier, photos, type)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
        setFavorites([])
        setLoading(false)
        return
      }

      const mapped = (data || [])
        .map((row) => row.annonces)
        .filter(Boolean)

      setFavorites(mapped)
      setLoading(false)
    }

    load()
  }, [])

  const formatPrice = (price) => {
    const n = typeof price === 'string' ? parseFloat(price) : price
    if (!n && n !== 0) return ''
    return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA/mois'
  }

  return (
    <ProtectedRoute requiredRole="client">
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <FiHeart className="text-primary-500" size={28} />
                  <h1 className="text-3xl font-bold text-gray-900">Favoris</h1>
                </div>
                <p className="text-gray-600">Retrouvez ici les annonces que vous avez ajoutées en favoris.</p>
              </div>

              {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <FiHome className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">Chargement...</p>
                </div>
              ) : favorites.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <FiHeart className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun favori</h3>
                  <p className="text-gray-600">Ajoutez des annonces en favoris pour les retrouver ici.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((annonce) => (
                    <Link
                      key={annonce.id}
                      href={`/annonces/${annonce.id}`}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                        {annonce.photos && annonce.photos.length > 0 ? (
                          <img
                            src={annonce.photos[0]}
                            alt={annonce.titre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiHome className="text-primary-600" size={56} />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="inline-block px-3 py-1 bg-primary-500 text-gray-900 text-xs font-medium rounded-full">
                            {annonce.type}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {annonce.titre}
                        </h3>
                        <p className="text-xl font-bold text-primary-600 mb-2">
                          {formatPrice(annonce.prix)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {annonce.quartier}, {annonce.ville}
                        </p>
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
