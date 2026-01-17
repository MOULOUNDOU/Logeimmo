'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { getAnnonces } from '@/lib/supabase/annonces'
import { FiMapPin, FiHome, FiMaximize2, FiDollarSign, FiSearch, FiFilter } from 'react-icons/fi'
import Link from 'next/link'
import LikeButton from '@/components/LikeButton'
import ShareButton from '@/components/ShareButton'

function AnnoncesPage() {
  const [annonces, setAnnonces] = useState([])
  const [filteredAnnonces, setFilteredAnnonces] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    ville: '',
    prixMin: '',
    prixMax: ''
  })

  useEffect(() => {
    const loadAnnonces = async () => {
      const allAnnonces = await getAnnonces({ onlyCourtiers: true })
      setAnnonces(allAnnonces)
      setFilteredAnnonces(allAnnonces)
      setLoading(false)
    }
    loadAnnonces()
  }, [])

  useEffect(() => {
    let filtered = [...annonces]

    if (searchTerm) {
      filtered = filtered.filter(annonce =>
        annonce.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        annonce.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        annonce.quartier.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filters.type) {
      filtered = filtered.filter(annonce => annonce.type === filters.type)
    }

    if (filters.ville) {
      filtered = filtered.filter(annonce => annonce.ville === filters.ville)
    }

    if (filters.prixMin) {
      filtered = filtered.filter(annonce => annonce.prix >= parseFloat(filters.prixMin))
    }

    if (filters.prixMax) {
      filtered = filtered.filter(annonce => annonce.prix <= parseFloat(filters.prixMax))
    }

    setFilteredAnnonces(filtered)
  }, [searchTerm, filters, annonces])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA/mois'
  }

  const getFirstPhoto = (photos) => {
    if (!photos) return null
    if (Array.isArray(photos)) return photos[0] || null
    if (typeof photos === 'string') {
      try {
        const parsed = JSON.parse(photos)
        if (Array.isArray(parsed)) return parsed[0] || null
      } catch (e) {
        return photos
      }
    }
    return null
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Trouvez votre logement</h1>
                <p className="text-gray-600">Parcourez les annonces disponibles au Sénégal</p>
              </div>

              {/* Recherche et filtres */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Rechercher par titre, quartier, description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Tous les types</option>
                      <option value="chambre">Chambre</option>
                      <option value="studio">Studio</option>
                      <option value="appartement">Appartement</option>
                      <option value="maison">Maison</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={filters.ville}
                      onChange={(e) => setFilters({ ...filters, ville: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Toutes les villes</option>
                      <option value="Dakar">Dakar</option>
                      <option value="Thiès">Thiès</option>
                      <option value="Saint-Louis">Saint-Louis</option>
                      <option value="Kaolack">Kaolack</option>
                      <option value="Ziguinchor">Ziguinchor</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      placeholder="Prix minimum (FCFA)"
                      value={filters.prixMin}
                      onChange={(e) => setFilters({ ...filters, prixMin: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Prix maximum (FCFA)"
                      value={filters.prixMax}
                      onChange={(e) => setFilters({ ...filters, prixMax: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Liste des annonces */}
              <div className="mb-4">
                <p className="text-gray-600">
                  {filteredAnnonces.length} {filteredAnnonces.length === 1 ? 'annonce trouvée' : 'annonces trouvées'}
                </p>
              </div>

              {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement...</p>
                </div>
              ) : filteredAnnonces.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <FiHome className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune annonce trouvée</h3>
                  <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAnnonces.map((annonce) => (
                    <div key={annonce.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                      {/* Image */}
                      <Link href={`/annonces/${annonce.id}`}>
                        <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden cursor-pointer group">
                          {getFirstPhoto(annonce.photos) ? (
                            <img
                              src={getFirstPhoto(annonce.photos)}
                              alt={annonce.titre}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiHome className="text-primary-600" size={64} />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <span className="inline-block px-3 py-1 bg-primary-500 text-gray-900 text-xs font-medium rounded-full">
                              {annonce.type}
                            </span>
                          </div>
                          {annonce.meuble && (
                            <div className="absolute top-3 right-3">
                              <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                                Meublé
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-6">
                        <Link href={`/annonces/${annonce.id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                            {annonce.titre}
                          </h3>
                        </Link>
                        <p className="text-2xl font-bold text-primary-600 mb-4">
                          {formatPrice(annonce.prix)}
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiMapPin size={16} />
                            <span>{annonce.quartier}, {annonce.ville}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiMaximize2 size={16} />
                            <span>{annonce.superficie} m²</span>
                          </div>
                          {annonce.chambres > 1 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiHome size={16} />
                              <span>{annonce.chambres} chambres • {annonce.sallesDeBain} salle(s) de bain</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {annonce.description}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
                          <LikeButton annonceId={annonce.id} />
                          <ShareButton annonceId={annonce.id} titre={annonce.titre} />
                          <Link
                            href={`/annonces/${annonce.id}`}
                            className="w-full sm:w-auto sm:ml-auto px-4 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg text-sm font-medium transition-colors text-center"
                          >
                            Voir détails
                          </Link>
                        </div>
                      </div>
                    </div>
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

export default AnnoncesPage

