import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    // Rediriger vers login avec l'URL d'origine pour y revenir après connexion
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};



