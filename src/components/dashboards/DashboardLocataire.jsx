import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllListings } from '../../services/listingService';
import { getUserFavorites, getUserSearches, deleteSearch } from '../../services/favoritesService';
import { ListingCard } from '../ListingCard';
import { PriceTag } from '../PriceTag';

export const DashboardLocataire = ({ user }) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [favoriteListings, setFavoriteListings] = useState([]);

  useEffect(() => {
    // Charger les favoris
    const userFavorites = getUserFavorites(user.id);
    setFavorites(userFavorites);

    // Charger les annonces favorites
    const allListings = getAllListings();
    const favListings = allListings.filter(listing => 
      userFavorites.some(fav => fav.listingId === listing.id)
    );
    setFavoriteListings(favListings);

    // Charger les recherches sauvegardées
    const searches = getUserSearches(user.id);
    setSavedSearches(searches);
  }, [user.id]);

  const handleDeleteSearch = (searchId) => {
    if (window.confirm('Supprimer cette recherche sauvegardée ?')) {
      try {
        deleteSearch(searchId);
        setSavedSearches(prev => prev.filter(s => s.id !== searchId));
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleSearch = (searchParams) => {
    const params = new URLSearchParams();
    if (searchParams.city) params.append('city', searchParams.city);
    if (searchParams.type) params.append('type', searchParams.type);
    if (searchParams.priceMin) params.append('priceMin', searchParams.priceMin);
    if (searchParams.priceMax) params.append('priceMax', searchParams.priceMax);
    if (searchParams.search) params.append('search', searchParams.search);
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="page dashboard dashboard-locataire">
      <div className="container">
        <div className="dashboard-header">
          <div className="dashboard-header-user">
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} className="dashboard-user-photo" />
            ) : (
              <div className="dashboard-user-photo dashboard-user-photo-placeholder">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h1>Dashboard Locataire</h1>
              <p className="dashboard-subtitle">Bienvenue, {user.name} !</p>
            </div>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <div className="stat-value">{favorites.length}</div>
              <div className="stat-label">Annonces favorites</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-content">
              <div className="stat-value">{savedSearches.length}</div>
              <div className="stat-label">Recherches sauvegardées</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <div className="stat-value">{favoriteListings.length}</div>
              <div className="stat-label">Favoris actifs</div>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            🔍 Rechercher des logements
          </button>
        </div>

        {favoriteListings.length > 0 ? (
          <div className="dashboard-section">
            <h2>Mes annonces favorites</h2>
            <div className="listings-grid">
              {favoriteListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        ) : (
          <div className="dashboard-section empty-state">
            <h2>Vous n'avez pas encore de favoris</h2>
            <p>Explorez les annonces et ajoutez celles qui vous intéressent en favoris !</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Parcourir les annonces
            </button>
          </div>
        )}

        {savedSearches.length > 0 && (
          <div className="dashboard-section">
            <h2>Recherches sauvegardées</h2>
            <div className="saved-searches">
              {savedSearches.map(search => (
                <div key={search.id} className="saved-search-item">
                  <div className="search-info">
                    <h3>
                      {search.search || search.city || 'Recherche'}
                    </h3>
                    <p className="search-details">
                      {search.city && <span>📍 {search.city}</span>}
                      {search.type && <span>🏠 {search.type}</span>}
                      {search.priceMin && <span>💰 Min: {search.priceMin.toLocaleString()} FCFA</span>}
                      {search.priceMax && <span>💰 Max: {search.priceMax.toLocaleString()} FCFA</span>}
                    </p>
                    <small className="search-date">
                      {new Date(search.createdAt).toLocaleDateString('fr-FR')}
                    </small>
                  </div>
                  <div className="search-actions">
                    <button 
                      className="btn btn-secondary btn-small"
                      onClick={() => handleSearch(search)}
                    >
                      🔍 Relancer
                    </button>
                    <button 
                      className="btn btn-danger btn-small"
                      onClick={() => handleDeleteSearch(search.id)}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

