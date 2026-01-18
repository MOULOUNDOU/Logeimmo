import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, USER_ROLES } from '../services/authService';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.PROPRIETAIRE,
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setErrorMessage('');
  };

  // Validation du numéro de téléphone sénégalais
  const validateSenegalPhone = (phone) => {
    // Format: +221 suivi de 9 chiffres (commençant généralement par 70, 76, 77, 78)
    const senegalPhoneRegex = /^\+221[7][0-8]\d{7}$/;
    return senegalPhoneRegex.test(phone);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (!validateSenegalPhone(formData.phone.trim())) {
      newErrors.phone = 'Le numéro de téléphone doit être au format sénégalais (+221XXXXXXXXX, ex: +221771234567)';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer le mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.role) {
      newErrors.role = 'Veuillez sélectionner un type de compte';
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
    setErrorMessage('');

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        phone: formData.phone.trim()
      });
      navigate('/my-listings');
    } catch (error) {
      setErrorMessage(error.message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <h1>Créer un compte</h1>
            <p className="auth-subtitle">Rejoignez SenChambres comme propriétaire ou courtier</p>

            {errorMessage && (
              <div className="alert alert-error">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">Nom complet *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jean Diallo"
                  required
                />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  required
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Téléphone (Sénégal) *</label>
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
                <p className="form-hint">Format: +221XXXXXXXXX (ex: +221771234567)</p>
              </div>

              <div className="form-group">
                <label htmlFor="role">Type de compte *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value={USER_ROLES.PROPRIETAIRE}>Propriétaire</option>
                  <option value={USER_ROLES.COURTIER}>Courtier</option>
                  <option value={USER_ROLES.LOCATAIRE}>Locataire</option>
                </select>
                {errors.role && <span className="error">{errors.role}</span>}
                <p className="form-hint">
                  {formData.role === USER_ROLES.PROPRIETAIRE 
                    ? 'Propriétaire : publiez vos propres logements'
                    : formData.role === USER_ROLES.COURTIER
                    ? 'Courtier : publiez des logements pour vos clients'
                    : 'Locataire : recevez des annonces, sauvegardez vos favoris et recherches'}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="password">Mot de passe *</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                {errors.password && <span className="error">{errors.password}</span>}
                <p className="form-hint">Minimum 6 caractères</p>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Déjà un compte ?{' '}
                <Link to="/login" className="auth-link">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

