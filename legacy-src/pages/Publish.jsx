import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createListing, getListingById, updateListing } from '../services/listingService';
import { getCurrentUser } from '../services/authService';
import { ImageUpload } from '../components/ImageUpload';

const AMENITIES_OPTIONS = [
  { id: 'wifi', label: 'WiFi' },
  { id: 'climatisation', label: 'Climatisation' },
  { id: 'eau courante', label: 'Eau courante' },
  { id: 'eau chaude', label: 'Eau chaude' },
  { id: 'électricité', label: 'Électricité' },
  { id: 'cuisine équipée', label: 'Cuisine équipée' },
  { id: 'terrasse', label: 'Terrasse' },
  { id: 'balcon', label: 'Balcon' },
  { id: 'gardien', label: 'Gardien' },
  { id: 'ascenseur', label: 'Ascenseur' },
  { id: 'parking', label: 'Parking' },
  { id: 'vue mer', label: 'Vue mer' }
];

export const Publish = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  
  const [formData, setFormData] = useState({
    title: '',
    city: '',
    district: '',
    type: 'chambre',
    price: '',
    deposit: '',
    description: '',
    amenities: [],
    phone: '',
    whatsapp: '',
    photos: [],
    latitude: '',
    longitude: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données de l'annonce si on est en mode édition
  // Sinon pré-remplir avec les infos de l'utilisateur connecté
  useEffect(() => {
    const user = getCurrentUser();
    
    if (isEditMode && editId) {
      setIsLoading(true);
      const listing = getListingById(editId);
      if (listing) {
        // Vérifier que l'utilisateur est propriétaire de l'annonce
        if (user && listing.userId !== user.id) {
          alert('Vous n\'êtes pas autorisé à modifier cette annonce');
          navigate('/my-listings');
          return;
        }
        setFormData({
          title: listing.title || '',
          city: listing.city || '',
          district: listing.district || '',
          type: listing.type || 'chambre',
          price: listing.price?.toString() || '',
          deposit: listing.deposit?.toString() || '',
          description: listing.description || '',
          amenities: listing.amenities || [],
          phone: listing.phone || '',
          whatsapp: listing.whatsapp || '',
          photos: listing.photos && listing.photos.length > 0 ? listing.photos : []
        });
      } else {
        alert('Annonce introuvable');
        navigate('/my-listings');
      }
      setIsLoading(false);
    } else if (user && !isEditMode) {
      // Pré-remplir avec les infos de l'utilisateur pour nouvelle annonce
      setFormData(prev => ({
        ...prev,
        phone: user.phone || prev.phone,
        whatsapp: user.phone || prev.whatsapp
      }));
    }
  }, [isEditMode, editId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.city.trim()) newErrors.city = 'La ville est requise';
    if (!formData.district.trim()) newErrors.district = 'Le quartier est requis';
    if (!formData.price) {
      newErrors.price = 'Le prix est requis';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Le prix doit être un nombre valide';
    }
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (formData.phone.replace(/[^0-9+]/g, '').length < 8) {
      newErrors.phone = 'Le numéro de téléphone doit contenir au moins 8 chiffres';
    }
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Le numéro WhatsApp est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const listingData = {
        title: formData.title.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        type: formData.type,
        price: parseFloat(formData.price),
        deposit: formData.deposit ? parseFloat(formData.deposit) : null,
        description: formData.description.trim(),
        amenities: formData.amenities,
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim(),
        photos: formData.photos.filter(url => url.trim() !== ''),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      if (isEditMode && editId) {
        updateListing(editId, listingData);
        navigate(`/listing/${editId}`);
      } else {
        const newListing = createListing(listingData);
        navigate(`/listing/${newListing.id}`);
      }
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      alert('Erreur lors de la publication. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page publish">
        <div className="container">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page publish">
      <div className="container">
        <h1>{isEditMode ? 'Modifier une annonce' : 'Publier une annonce'}</h1>

        <form onSubmit={handleSubmit} className="publish-form">
          <div className="form-section">
            <h2>Informations générales</h2>

            <div className="form-group">
              <label htmlFor="title">Titre de l'annonce *</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Chambre meublée à Yoff"
                required
              />
              {errors.title && <span className="error">{errors.title}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Ville *</label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Ex: Dakar"
                  required
                />
                {errors.city && <span className="error">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="district">Quartier *</label>
                <input
                  id="district"
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Ex: Yoff"
                  required
                />
                {errors.district && <span className="error">{errors.district}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="type">Type de logement *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="chambre">Chambre</option>
                <option value="studio">Studio</option>
                <option value="appartement">Appartement</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>Tarifs</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Prix mensuel (FCFA) *</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="45000"
                  min="0"
                  step="1000"
                  required
                />
                {errors.price && <span className="error">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="deposit">Caution (FCFA) - Optionnel</label>
                <input
                  id="deposit"
                  type="number"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleChange}
                  placeholder="90000"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Description</h2>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Décrivez votre logement..."
                required
              />
              {errors.description && <span className="error">{errors.description}</span>}
            </div>
          </div>

          <div className="form-section">
            <h2>Équipements</h2>
            <div className="amenities-grid">
              {AMENITIES_OPTIONS.map(amenity => (
                <label key={amenity.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity.id)}
                    onChange={() => handleAmenityToggle(amenity.id)}
                  />
                  <span>{amenity.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Photos</h2>
            <p className="form-hint">
              Téléchargez des photos depuis votre appareil ou ajoutez des URLs
            </p>
            <ImageUpload
              photos={formData.photos}
              onPhotosChange={(newPhotos) => setFormData(prev => ({ ...prev, photos: newPhotos }))}
              maxPhotos={10}
            />
          </div>

          <div className="form-section">
            <h2>Localisation GPS (optionnel)</h2>
            <p className="form-hint">
              Ajoutez les coordonnées GPS pour afficher la localisation sur une carte. 
              Vous pouvez utiliser la géolocalisation automatique ou saisir manuellement.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>
                <input
                  id="latitude"
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Ex: 14.7167"
                  step="any"
                />
                {errors.latitude && <span className="error">{errors.latitude}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>
                <input
                  id="longitude"
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="Ex: -17.4677"
                  step="any"
                />
                {errors.longitude && <span className="error">{errors.longitude}</span>}
              </div>
            </div>

            <div className="form-group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setFormData(prev => ({
                          ...prev,
                          latitude: position.coords.latitude.toFixed(6),
                          longitude: position.coords.longitude.toFixed(6)
                        }));
                      },
                      (error) => {
                        alert('Erreur de géolocalisation : ' + error.message);
                      }
                    );
                  } else {
                    alert('La géolocalisation n\'est pas supportée par votre navigateur');
                  }
                }}
              >
                📍 Obtenir ma position
              </button>
              <p className="form-hint">
                Cliquez sur le bouton pour obtenir automatiquement votre position actuelle
              </p>
            </div>
          </div>

          <div className="form-section">
            <h2>Contact</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Téléphone *</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+221771234567"
                  required
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="whatsapp">WhatsApp *</label>
                <input
                  id="whatsapp"
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="+221771234567"
                  required
                />
                {errors.whatsapp && <span className="error">{errors.whatsapp}</span>}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isEditMode ? 'Enregistrement...' : 'Publication...') 
                : (isEditMode ? 'Enregistrer les modifications' : 'Publier l\'annonce')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

