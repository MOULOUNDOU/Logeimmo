import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserListings, deleteListing } from '../services/listingService';
import { getCurrentUser } from '../services/authService';
import { ListingCard } from '../components/ListingCard';

export const MyListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);

  // Récupérer les annonces de l'utilisateur connecté
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const userListings = getUserListings(user.id);
      setListings(userListings);
    }
  }, []);

  const handleDelete = (id, title) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'annonce "${title}" ?`)) {
      try {
        deleteListing(id);
        setListings(prev => prev.filter(listing => listing.id !== id));
      } catch (error) {
        alert(error.message || 'Erreur lors de la suppression. Veuillez réessayer.');
      }
    }
  };

  // Fonction pour recharger les annonces
  const refreshListings = () => {
    const user = getCurrentUser();
    if (user) {
      const userListings = getUserListings(user.id);
      setListings(userListings);
    }
  };

  const handleEdit = (id) => {
    navigate(`/publish?edit=${id}`);
  };

  // Recharger les annonces quand la page redevient active
  useEffect(() => {
    const handleFocus = () => {
      refreshListings();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (listings.length === 0) {
    return (
      <div className="page my-listings">
        <div className="container">
          <h1>Mes annonces</h1>
          <div className="empty-state">
            <p>Vous n'avez pas encore publié d'annonce.</p>
            <button className="btn btn-primary" onClick={() => navigate('/publish')}>
              Publier une annonce
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page my-listings">
      <div className="container">
        <div className="my-listings-header">
          <h1>Mes annonces</h1>
          <button className="btn btn-primary" onClick={() => navigate('/publish')}>
            + Publier une annonce
          </button>
        </div>

        <div className="listings-grid">
          {listings.map(listing => (
            <div key={listing.id} className="my-listing-item">
              <ListingCard listing={listing} />
              <div className="listing-actions">
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => handleEdit(listing.id)}
                >
                  Modifier
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDelete(listing.id, listing.title)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

