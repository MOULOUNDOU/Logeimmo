import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateProfile, changePassword } from '../services/authService';
import { fileToBase64, compressImage } from '../utils/imageUtils';

export const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // profile, password
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Données du profil
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    profilePhoto: null
  });

  // Données pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setProfileData({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
      profilePhoto: currentUser.profilePhoto || null
    });
    setLoading(false);
  }, [navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSuccess('');
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Valider l'image
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePhoto: 'Le fichier doit être une image' }));
        return;
      }

      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, profilePhoto: 'L\'image est trop volumineuse (max 2MB)' }));
        return;
      }

      // Convertir et compresser
      const base64 = await fileToBase64(file);
      const compressed = await compressImage(base64, 0.8, 400); // 400px max pour profil
      setProfileData(prev => ({ ...prev, profilePhoto: compressed }));
      setErrors(prev => ({ ...prev, profilePhoto: '' }));
    } catch (error) {
      console.error('Erreur lors de l\'upload de la photo:', error);
      setErrors(prev => ({ ...prev, profilePhoto: 'Erreur lors de l\'upload de la photo' }));
    }
  };

  const handleRemovePhoto = () => {
    setProfileData(prev => ({ ...prev, profilePhoto: null }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    try {
      const updated = updateProfile({
        name: profileData.name.trim(),
        phone: profileData.phone.trim(),
        profilePhoto: profileData.profilePhoto
      });
      
      setUser(updated);
      setSuccess('Profil mis à jour avec succès !');
      
      // Recharger la page après un délai pour mettre à jour le header
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setErrors({ submit: error.message || 'Erreur lors de la mise à jour du profil' });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSuccess('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    // Validation
    const newErrors = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Mot de passe changé avec succès !');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setErrors({ submit: error.message || 'Erreur lors du changement de mot de passe' });
    }
  };

  if (loading) {
    return (
      <div className="page settings">
        <div className="container">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page settings">
      <div className="container">
        <h1>Paramètres du compte</h1>

        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profil
          </button>
          <button
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            🔒 Mot de passe
          </button>
        </div>

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {errors.submit && (
          <div className="alert alert-error">
            {errors.submit}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="settings-section">
            <h2>Informations du profil</h2>

            <form onSubmit={handleProfileSubmit} className="settings-form">
              <div className="profile-photo-section">
                <div className="profile-photo-preview">
                  {profileData.profilePhoto ? (
                    <img src={profileData.profilePhoto} alt="Photo de profil" />
                  ) : (
                    <div className="profile-photo-placeholder">
                      <span className="profile-initials">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="profile-photo-actions">
                  <label htmlFor="profile-photo" className="btn btn-secondary">
                    📷 Changer la photo
                  </label>
                  <input
                    id="profile-photo"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                  {profileData.profilePhoto && (
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={handleRemovePhoto}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                {errors.profilePhoto && (
                  <span className="error">{errors.profilePhoto}</span>
                )}
                <p className="form-hint">Formats acceptés : JPEG, PNG, WebP (max 2MB)</p>
              </div>

              <div className="form-group">
                <label htmlFor="name">Nom complet *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  required
                />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="input-disabled"
                />
                <p className="form-hint">L'email ne peut pas être modifié</p>
              </div>

              <div className="form-group">
                <label htmlFor="role">Type de compte</label>
                <input
                  id="role"
                  type="text"
                  value={user.role === 'proprietaire' ? 'Propriétaire' : 
                        user.role === 'courtier' ? 'Courtier' :
                        user.role === 'locataire' ? 'Locataire' : 'Admin'}
                  disabled
                  className="input-disabled"
                />
                <p className="form-hint">Le type de compte ne peut pas être modifié</p>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Téléphone</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="+221771234567"
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Enregistrer les modifications
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="settings-section">
            <h2>Changer le mot de passe</h2>

            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Mot de passe actuel *</label>
                <input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                {errors.currentPassword && (
                  <span className="error">{errors.currentPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nouveau mot de passe *</label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
                {errors.newPassword && (
                  <span className="error">{errors.newPassword}</span>
                )}
                <p className="form-hint">Minimum 6 caractères</p>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe *</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
                {errors.confirmPassword && (
                  <span className="error">{errors.confirmPassword}</span>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Changer le mot de passe
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setErrors({});
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};






