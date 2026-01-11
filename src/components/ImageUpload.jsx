import React, { useState, useRef } from 'react';
import { fileToBase64, validateImage, compressImage } from '../utils/imageUtils';

export const ImageUpload = ({ photos = [], onPhotosChange, maxPhotos = 10 }) => {
  const [previews, setPreviews] = useState(photos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Mettre à jour les previews quand photos change
  React.useEffect(() => {
    setPreviews(photos);
  }, [photos]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Vérifier le nombre max
    if (previews.length + files.length > maxPhotos) {
      setError(`Vous ne pouvez ajouter que ${maxPhotos} photos maximum`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const newPhotos = [...previews];

      for (const file of files) {
        // Valider l'image
        const validation = validateImage(file);
        if (!validation.valid) {
          setError(validation.error);
          setUploading(false);
          return;
        }

        // Convertir en base64
        const base64 = await fileToBase64(file);
        
        // Compresser l'image (optionnel mais recommandé pour localStorage)
        try {
          const compressed = await compressImage(base64, 0.8, 1200);
          newPhotos.push(compressed);
        } catch (compressError) {
          // Si la compression échoue, utiliser l'image originale
          console.warn('Erreur de compression, utilisation de l\'image originale:', compressError);
          newPhotos.push(base64);
        }
      }

      setPreviews(newPhotos);
      onPhotosChange(newPhotos);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
      // Réinitialiser l'input pour permettre de sélectionner le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = previews.filter((_, i) => i !== index);
    setPreviews(newPhotos);
    onPhotosChange(newPhotos);
  };

  const handleUrlAdd = () => {
    const url = prompt('Entrez l\'URL de la photo :');
    if (url && url.trim()) {
      if (previews.length >= maxPhotos) {
        setError(`Vous ne pouvez ajouter que ${maxPhotos} photos maximum`);
        return;
      }
      const newPhotos = [...previews, url.trim()];
      setPreviews(newPhotos);
      onPhotosChange(newPhotos);
    }
  };

  return (
    <div className="image-upload">
      <div className="image-upload-actions">
        <label htmlFor="image-upload" className="btn btn-secondary">
          {uploading ? '⏳ Upload...' : '📷 Télécharger depuis l\'appareil'}
        </label>
        <input
          id="image-upload"
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading || previews.length >= maxPhotos}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleUrlAdd}
          disabled={previews.length >= maxPhotos}
        >
          + Ajouter une URL
        </button>
        {previews.length > 0 && (
          <span className="photo-count">
            {previews.length} / {maxPhotos} photos
          </span>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {previews.length > 0 && (
        <div className="image-preview-grid">
          {previews.map((photo, index) => (
            <div key={index} className="image-preview-item">
              <img src={photo} alt={`Preview ${index + 1}`} />
              <button
                type="button"
                className="image-remove-btn"
                onClick={() => handleRemovePhoto(index)}
                aria-label="Supprimer cette photo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length === 0 && (
        <div className="image-upload-hint">
          <p>📸 Ajoutez des photos de votre logement</p>
          <p className="hint-small">Formats acceptés : JPEG, PNG, WebP (max 5MB par image)</p>
        </div>
      )}
    </div>
  );
};



