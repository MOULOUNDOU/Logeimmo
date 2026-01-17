'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { canPublishAnnonces } from '@/lib/supabase/auth'
import { createAnnonce } from '@/lib/supabase/annonces'
import { FiHome, FiMapPin, FiDollarSign, FiMaximize2, FiFileText, FiNavigation } from 'react-icons/fi'
import ImageUpload from '@/components/ImageUpload'

function PublierPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    titre: '',
    type: 'chambre',
    description: '',
    prix: '',
    superficie: '',
    adresse: '',
    ville: 'Dakar',
    quartier: '',
    chambres: '1',
    sallesDeBain: '1',
    meuble: false,
    latitude: '',
    longitude: ''
  })
  const [photos, setPhotos] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
    const check = async () => {
      if (typeof window === 'undefined') return
      const canPublish = await canPublishAnnonces()
      if (!canPublish) {
        router.push('/annonces')
      }
    }

    check()
  }, [router])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur')
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }))
        setGettingLocation(false)
        setMessage('Localisation récupérée avec succès!')
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error)
        setMessage('Impossible de récupérer la localisation: ' + error.message)
        setGettingLocation(false)
      }
    )
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setMessage('')
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est requis'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise'
    } else if (formData.description.length < 50) {
      newErrors.description = 'La description doit contenir au moins 50 caractères'
    }

    if (!formData.prix) {
      newErrors.prix = 'Le prix est requis'
    } else if (parseFloat(formData.prix) <= 0) {
      newErrors.prix = 'Le prix doit être supérieur à 0'
    }

    if (!formData.superficie) {
      newErrors.superficie = 'La superficie est requise'
    }

    if (!formData.adresse.trim()) {
      newErrors.adresse = "L'adresse est requise"
    }

    if (!formData.quartier.trim()) {
      newErrors.quartier = 'Le quartier est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      await createAnnonce({
        ...formData,
        prix: parseFloat(formData.prix),
        superficie: parseFloat(formData.superficie),
        chambres: parseInt(formData.chambres),
        sallesDeBain: parseInt(formData.sallesDeBain),
        photos: photos,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      })
      setMessage('Annonce publiée avec succès !')
      setFormData({
        titre: '',
        type: 'chambre',
        description: '',
        prix: '',
        superficie: '',
        adresse: '',
        ville: 'Dakar',
        quartier: '',
        chambres: '1',
        sallesDeBain: '1',
        meuble: false,
        latitude: '',
        longitude: ''
      })
      setPhotos([])
      setTimeout(() => {
        router.push('/dashboard-courtier')
      }, 2000)
    } catch (error) {
      setMessage(error.message || 'Erreur lors de la publication de l\'annonce')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="courtier">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Publier une annonce</h1>
                <p className="text-gray-600">Remplissez les informations de votre propriété</p>
              </div>

              {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.includes('succès') 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de l'annonce *
                    </label>
                    <input
                      id="titre"
                      name="titre"
                      type="text"
                      value={formData.titre}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.titre ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Jolie chambre meublée à Dakar Plateau"
                    />
                    {errors.titre && (
                      <p className="mt-1 text-sm text-red-600">{errors.titre}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                      Type de logement *
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="chambre">Chambre</option>
                      <option value="studio">Studio</option>
                      <option value="appartement">Appartement</option>
                      <option value="maison">Maison</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-2">
                      Prix (FCFA/mois) *
                    </label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        id="prix"
                        name="prix"
                        type="number"
                        value={formData.prix}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.prix ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="50000"
                      />
                    </div>
                    {errors.prix && (
                      <p className="mt-1 text-sm text-red-600">{errors.prix}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="superficie" className="block text-sm font-medium text-gray-700 mb-2">
                      Superficie (m²) *
                    </label>
                    <div className="relative">
                      <FiMaximize2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        id="superficie"
                        name="superficie"
                        type="number"
                        value={formData.superficie}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.superficie ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="25"
                      />
                    </div>
                    {errors.superficie && (
                      <p className="mt-1 text-sm text-red-600">{errors.superficie}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="chambres" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de chambres
                    </label>
                    <input
                      id="chambres"
                      name="chambres"
                      type="number"
                      min="1"
                      value={formData.chambres}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="sallesDeBain" className="block text-sm font-medium text-gray-700 mb-2">
                      Salles de bain
                    </label>
                    <input
                      id="sallesDeBain"
                      name="sallesDeBain"
                      type="number"
                      min="1"
                      value={formData.sallesDeBain}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <select
                      id="ville"
                      name="ville"
                      value={formData.ville}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Dakar">Dakar</option>
                      <option value="Thiès">Thiès</option>
                      <option value="Saint-Louis">Saint-Louis</option>
                      <option value="Kaolack">Kaolack</option>
                      <option value="Ziguinchor">Ziguinchor</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quartier" className="block text-sm font-medium text-gray-700 mb-2">
                      Quartier *
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        id="quartier"
                        name="quartier"
                        type="text"
                        value={formData.quartier}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.quartier ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ex: Plateau, Almadies, Ouakam"
                      />
                    </div>
                    {errors.quartier && (
                      <p className="mt-1 text-sm text-red-600">{errors.quartier}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse complète *
                    </label>
                    <div className="relative">
                      <FiHome className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        id="adresse"
                        name="adresse"
                        type="text"
                        value={formData.adresse}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.adresse ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ex: Avenue Léopold Sédar Senghor, immeuble X"
                      />
                    </div>
                    {errors.adresse && (
                      <p className="mt-1 text-sm text-red-600">{errors.adresse}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photos de la propriété
                    </label>
                    <ImageUpload
                      photos={photos}
                      onPhotosChange={setPhotos}
                      maxPhotos={10}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description détaillée *
                    </label>
                    <div className="relative">
                      <FiFileText className="absolute left-3 top-3 text-gray-400" size={20} />
                      <textarea
                        id="description"
                        name="description"
                        rows="6"
                        value={formData.description}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Décrivez votre propriété en détail (emplacement, commodités, règles de vie, etc.)"
                      />
                    </div>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.description.length}/50 caractères minimum
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localisation GPS (optionnel)
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <FiNavigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="number"
                            step="any"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Latitude"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <FiNavigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="number"
                            step="any"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Longitude"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={gettingLocation}
                        className="px-3 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                      >
                        <FiNavigation size={18} />
                        {gettingLocation ? 'Récupération...' : 'Utiliser ma position'}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Récupérez automatiquement votre position GPS ou saisissez-la manuellement
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="meuble"
                        checked={formData.meuble}
                        onChange={handleChange}
                        className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Logement meublé</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Publication...' : 'Publier l\'annonce'}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default PublierPage

