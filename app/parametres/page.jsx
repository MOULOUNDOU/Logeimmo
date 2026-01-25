'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { getCurrentUser, updateProfile } from '@/lib/supabase/auth'
import { FiUser, FiMail, FiPhone, FiCamera, FiSave } from 'react-icons/fi'
import { fileToBase64, validateImage, compressImage } from '@/utils/imageUtils'
import { supabase } from '@/lib/supabase'

function ParametresPage() {
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: ''
  })
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [coverPhoto, setCoverPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      if (typeof window === 'undefined') return
      const authData = await getCurrentUser()
      if (!authData) return

      setUser(authData.user)
      setFormData({
        nom: authData.user.nom || '',
        email: authData.user.email || '',
        telephone: authData.user.telephone || ''
      })
      setProfilePhoto(authData.user.photoProfil || null)
      setCoverPhoto(authData.user.coverPhoto || null)
      setLoading(false)
    }

    load()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setMessage('')
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    setMessage('')
  }

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImage(file)
    if (!validation.valid) {
      setMessage('Erreur: ' + validation.error)
      return
    }

    try {
      const base64 = await fileToBase64(file)
      const compressed = await compressImage(base64, 0.8, 400)
      setProfilePhoto(compressed)
    } catch (error) {
      setMessage('Erreur lors du téléchargement de la photo: ' + error.message)
    }
  }

  const handleCoverSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImage(file)
    if (!validation.valid) {
      setMessage('Erreur: ' + validation.error)
      return
    }

    try {
      const base64 = await fileToBase64(file)
      const compressed = await compressImage(base64, 0.8, 1200)
      setCoverPhoto(compressed)
    } catch (error) {
      setMessage('Erreur lors du téléchargement de la couverture: ' + error.message)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setChangingPassword(true)
    setMessage('')

    try {
      if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères')
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas')
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setPasswordData({ newPassword: '', confirmPassword: '' })
      setMessage('Mot de passe modifié avec succès!')
    } catch (error) {
      setMessage('Erreur lors de la modification du mot de passe: ' + (error.message || error))
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      if (!user?.id) {
        throw new Error('Utilisateur non trouvé')
      }

      await updateProfile(user.id, {
        nom: formData.nom,
        telephone: formData.telephone,
        photoProfil: profilePhoto,
        coverPhoto
      })

      const authData = await getCurrentUser()
      if (authData?.user) {
        localStorage.setItem('digicode_immo_auth', JSON.stringify(authData))
        setUser(authData.user)
      }

      setMessage('Informations mises à jour avec succès!')

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      setMessage('Erreur lors de la sauvegarde: ' + error.message)
    } finally {
      setSaving(false)
    }
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
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
                <p className="text-gray-600">Gérez vos informations personnelles</p>
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

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Photo de profil */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Photo de profil
                    </label>
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt="Photo de profil"
                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                            <FiUser className="text-gray-400" size={48} />
                          </div>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="photo-upload"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <FiCamera size={20} />
                          <span>Changer la photo</span>
                        </label>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Photo de couverture
                    </label>
                    <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                      {coverPhoto ? (
                        <img src={coverPhoto} alt="Couverture" className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 flex items-center justify-center text-gray-500">
                          Aucune couverture
                        </div>
                      )}
                      <div className="p-4">
                        <label
                          htmlFor="cover-upload"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <FiCamera size={20} />
                          <span>Changer la couverture</span>
                        </label>
                        <input
                          id="cover-upload"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleCoverSelect}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informations personnelles */}
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          id="nom"
                          name="nom"
                          type="text"
                          value={formData.nom}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Votre nom"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="votre@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          id="telephone"
                          name="telephone"
                          type="tel"
                          value={formData.telephone}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="+221 77 123 45 67"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bouton de sauvegarde */}
                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <FiSave size={20} />
                      {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                </form>

                <form onSubmit={handlePasswordSubmit} className="space-y-6 mt-10 pt-10 border-t border-gray-200">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Modifier le mot de passe</h2>
                    <p className="text-gray-600">Choisissez un nouveau mot de passe.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="******"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le mot de passe
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="******"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? 'Modification...' : 'Modifier le mot de passe'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default ParametresPage

