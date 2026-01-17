'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { FiStar, FiUser, FiHome, FiTrash2 } from 'react-icons/fi'
import { getCurrentUser } from '@/lib/auth'
import { getCourtierAvis, getCourtierNoteMoyenne, deleteAvis } from '@/lib/avis'
import { getAnnonces } from '@/lib/auth'
import Link from 'next/link'

export default function AvisPage() {
  const [user, setUser] = useState(null)
  const [avis, setAvis] = useState([])
  const [loading, setLoading] = useState(true)
  const [noteMoyenne, setNoteMoyenne] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authData = getCurrentUser()
      if (authData?.user) {
        setUser(authData.user)
        loadAvis(authData.user.id)
      }
    }
  }, [])

  const loadAvis = (courtierId) => {
    const allAvis = getCourtierAvis(courtierId)
    const moyenne = getCourtierNoteMoyenne(courtierId)
    setAvis(allAvis)
    setNoteMoyenne(parseFloat(moyenne))
    setLoading(false)
  }

  const handleDelete = (avisId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      try {
        deleteAvis(avisId, user.id)
        loadAvis(user.id)
      } catch (error) {
        alert('Erreur: ' + error.message)
      }
    }
  }

  const renderStars = (note) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={`${i < note ? 'fill-current text-primary-500' : 'text-gray-300'}`}
        size={18}
      />
    ))
  }

  const getAnnonceTitre = (annonceId) => {
    const annonces = getAnnonces()
    const annonce = annonces.find(a => a.id === annonceId)
    return annonce ? annonce.titre : 'Annonce supprimée'
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-gray-50 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Avis reçus</h1>
                <p className="text-gray-600">Gérez les avis sur vos propriétés</p>
              </div>

              {/* Résumé */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Note moyenne</p>
                    <div className="flex items-center gap-2">
                      <span className="text-4xl font-bold text-gray-900">{noteMoyenne.toFixed(1)}</span>
                      <div className="flex items-center gap-1">
                        {renderStars(Math.round(noteMoyenne))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Total d'avis</p>
                    <p className="text-3xl font-bold text-primary-600">{avis.length}</p>
                  </div>
                </div>
              </div>

              {/* Liste des avis */}
              {avis.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <FiStar className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun avis</h3>
                  <p className="text-gray-600">Les avis sur vos propriétés apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {avis.map((avisItem) => (
                    <div key={avisItem.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {avisItem.userPhoto ? (
                            <img
                              src={avisItem.userPhoto}
                              alt={avisItem.userName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                              <FiUser className="text-primary-600" size={24} />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium text-gray-900">{avisItem.userName}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(avisItem.createdAt).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {renderStars(avisItem.note)}
                              </div>
                            </div>
                            <Link
                              href={`/annonces/${avisItem.annonceId}`}
                              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-2 text-sm"
                            >
                              <FiHome size={16} />
                              {getAnnonceTitre(avisItem.annonceId)}
                            </Link>
                            <p className="text-gray-700 mt-2">{avisItem.commentaire}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(avisItem.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-4"
                          title="Supprimer"
                        >
                          <FiTrash2 size={18} />
                        </button>
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

