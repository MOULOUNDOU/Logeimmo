// Configuration de l'API
// Remplacez par l'URL de votre backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Authentification
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  PROFILE: `${API_BASE_URL}/auth/profile`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  
  // Utilisateurs
  USERS: `${API_BASE_URL}/users`,
  
  // Autres endpoints à ajouter selon vos besoins
};

// Fonction utilitaire pour les appels API
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token'); // Stocker le token JWT ici
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  // Convertir le body en JSON si c'est un objet
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
    ...(body && { body }),
  };

  try {
    const response = await fetch(endpoint, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new Error(errorData.message || `Erreur ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

export default API_BASE_URL;

