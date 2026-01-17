'use client'

import { useState, useEffect } from 'react'
import { FiStar, FiUser } from 'react-icons/fi'
import { getCurrentUser } from '@/lib/auth'
import { getAnnonceAvis, addAvis, hasUserAvis } from '@/lib/avis'

export default function AvisSection({ annonceId, courtierId }) {
  const [avis, setAvis] = useState([])
  const [user, setUser] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    note: 5,
    commentaire: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authData = getCurrentUser()
      setUser(authData?.user || null)
      loadAvis()
    }
  }, [annonceId])

  const loadAvis = () => {
    const allAvis = getAnnonceAvis(annonceId)
    setAvis(allAvis)
  }

  const canAddAvis = () => {
    if (!user) return false
    if (user.role === 'client') {
      return !hasUserAvis(user.id, annonceId)
    }
    return false
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      alert('Vous devez être connecté pour donner un avis')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      await addAvis(
        user.id,
        user.nom,
        user.photoProfil,
        annonceId,
        courtierId,
        formData.note,
        formData.commentaire
      )
      setFormData({ note: 5, commentaire: '' })
      setShowForm(false)
      loadAvis()
      setMessage('Avis ajouté avec succès!')
    } catch (error) {
      setMessage(error.message || 'Erreur lors de l\'ajout de l\'avis')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (note) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={`${i < note ? 'fill-current text-primary-500' : 'text-gray-300'}`}
        size={20}
      />
    ))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Avis ({avis.length})
        </h2>
        {canAddAvis() && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg text-sm font-medium transition-colors"
          >
            Laisser un avis
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('succès')
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Formulaire d'avis */}
      {showForm && canAddAvis() && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Donner votre avis</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (étoiles)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, note: star })}
                    className="focus:outline-none"
                  >
                    <FiStar
                      className={`${
                        star <= formData.note
                          ? 'fill-current text-primary-500'
                          : 'text-gray-300'
                      }`}
                      size={32}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">({formData.note}/5)</span>
              </div>
            </div>

            <div>
              <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire *
              </label>
              <textarea
                id="commentaire"
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                rows="4"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Partagez votre expérience..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? 'Publication...' : 'Publier l\'avis'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ note: 5, commentaire: '' })
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des avis */}
      <div className="space-y-6">
        {avis.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun avis pour le moment. Soyez le premier !</p>
        ) : (
          avis.map((avisItem) => (
            <div key={avisItem.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start gap-4">
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
                        {new Date(avisItem.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(avisItem.note)}
                    </div>
                  </div>
                  <p className="text-gray-700">{avisItem.commentaire}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
