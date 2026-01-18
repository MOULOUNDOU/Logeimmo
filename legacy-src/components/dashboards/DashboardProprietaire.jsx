import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserListings } from '../../services/listingService';
import { ListingCard } from '../ListingCard';
import { PriceTag } from '../PriceTag';

export const DashboardProprietaire = ({ user }) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalViews: 0, // Placeholder pour futures vues
    averagePrice: 0
  });

  useEffect(() => {
    const userListings = getUserListings(user.id);
    setListings(userListings);

    // Calculer les statistiques
    const total = userListings.length;
    const active = userListings.length; // Toutes actives par défaut
    const prices = userListings.map(l => l.price).filter(p => p > 0);
    const avgPrice = prices.length > 0 
      ? prices.reduce((a, b) => a + b, 0) / prices.length 
      : 0;

    setStats({
      total,
      active,
      totalViews: 0, // À implémenter avec analytics
      averagePrice: Math.round(avgPrice)
    });
  }, [user.id]);

  const recentListings = listings
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="page dashboard dashboard-proprietaire">
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
              <h1>Dashboard Propriétaire</h1>
              <p className="dashboard-subtitle">Bienvenue, {user.name} !</p>
            </div>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Annonces publiées</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Annonces actives</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👁️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalViews}</div>
              <div className="stat-label">Vues totales</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">
                {stats.averagePrice > 0 ? (
                  <PriceTag price={stats.averagePrice} />
                ) : (
                  '-'
                )}
              </div>
              <div className="stat-label">Prix moyen</div>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/publish')}
          >
            + Publier une nouvelle annonce
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/my-listings')}
          >
            Voir toutes mes annonces
          </button>
        </div>

        {recentListings.length > 0 ? (
          <div className="dashboard-section">
            <h2>Annonces récentes</h2>
            <div className="listings-grid">
              {recentListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        ) : (
          <div className="dashboard-section empty-state">
            <h2>Vous n'avez pas encore publié d'annonce</h2>
            <p>Commencez par publier votre première annonce !</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/publish')}
            >
              Publier une annonce
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

