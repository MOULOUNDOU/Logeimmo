'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiX, FiImage } from 'react-icons/fi'
import { fileToBase64, validateImage, compressImage } from '@/utils/imageUtils'

export default function ImageUpload({ photos = [], onPhotosChange, maxPhotos = 10 }) {
  const [previews, setPreviews] = useState(photos)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return

    // Vérifier le nombre max
    if (previews.length + files.length > maxPhotos) {
      setError(`Vous ne pouvez ajouter que ${maxPhotos} photos maximum`)
      return
    }

    setUploading(true)
    setError('')

    try {
      const newPhotos = [...previews]

      for (const file of files) {
        // Valider l'image
        const validation = validateImage(file)
        if (!validation.valid) {
          setError(validation.error)
          setUploading(false)
          return
        }

        // Convertir en base64
        const base64 = await fileToBase64(file)
        
        // Compresser l'image (optionnel mais recommandé pour localStorage)
        try {
          const compressed = await compressImage(base64, 0.8, 1200)
          newPhotos.push(compressed)
        } catch (compressError) {
          // Si la compression échoue, utiliser l'image originale
          console.warn('Erreur de compression, utilisation de l\'image originale:', compressError)
          newPhotos.push(base64)
        }
      }

      setPreviews(newPhotos)
      onPhotosChange(newPhotos)
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'upload de l\'image')
    } finally {
      setUploading(false)
      // Réinitialiser l'input pour permettre de sélectionner le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemovePhoto = (index) => {
    const newPhotos = previews.filter((_, i) => i !== index)
    setPreviews(newPhotos)
    onPhotosChange(newPhotos)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label
          htmlFor="image-upload"
          className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
            uploading || previews.length >= maxPhotos ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FiUpload size={20} />
          <span>{uploading ? 'Téléchargement...' : 'Télécharger depuis l\'appareil'}</span>
        </label>
        <input
          id="image-upload"
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || previews.length >= maxPhotos}
        />
        {previews.length > 0 && (
          <span className="text-sm text-gray-500">
            {previews.length} / {maxPhotos} photos
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((photo, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <FiX size={16} />
              </button>
              {index === 0 && (
                <span className="absolute top-2 left-2 px-2 py-1 bg-primary-500 text-gray-900 text-xs font-medium rounded">
                  Principale
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {previews.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <FiImage className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-2">Aucune photo ajoutée</p>
          <p className="text-sm text-gray-500">Ajoutez jusqu'à {maxPhotos} photos de votre propriété</p>
        </div>
      )}
    </div>
  )
}

