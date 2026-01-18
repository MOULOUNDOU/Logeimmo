import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserListings } from '../../services/listingService';
import { ListingCard } from '../ListingCard';
import { PriceTag } from '../PriceTag';

export const DashboardCourtier = ({ user }) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalViews: 0,
    averagePrice: 0,
    byType: {}
  });

  useEffect(() => {
    const userListings = getUserListings(user.id);
    setListings(userListings);

    // Calculer les statistiques
    const total = userListings.length;
    const active = userListings.length;
    const prices = userListings.map(l => l.price).filter(p => p > 0);
    const avgPrice = prices.length > 0 
      ? prices.reduce((a, b) => a + b, 0) / prices.length 
      : 0;

    // Statistiques par type
    const byType = userListings.reduce((acc, listing) => {
      acc[listing.type] = (acc[listing.type] || 0) + 1;
      return acc;
    }, {});

    setStats({
      total,
      active,
      totalViews: 0,
      averagePrice: Math.round(avgPrice),
      byType
    });
  }, [user.id]);

  const recentListings = listings
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="page dashboard dashboard-courtier">
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
              <h1>Dashboard Courtier</h1>
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

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{Object.keys(stats.byType).length}</div>
              <div className="stat-label">Types de logements</div>
            </div>
          </div>
        </div>

        {Object.keys(stats.byType).length > 0 && (
          <div className="dashboard-section">
            <h3>Répartition par type</h3>
            <div className="type-stats">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="type-stat-item">
                  <span className="type-name">{type}</span>
                  <span className="type-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
            <p>Commencez par publier votre première annonce pour vos clients !</p>
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

