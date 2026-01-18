import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllListings } from '../../services/listingService';
import { getAllUsers } from '../../services/userService';
import { getDashboardStats, adminDeleteListing, adminDeleteUser } from '../../services/adminService';
import { ListingCard } from '../ListingCard';
import { PriceTag } from '../PriceTag';

export const DashboardAdmin = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, listings, users

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const dashboardStats = getDashboardStats();
    setStats(dashboardStats);
    setListings(getAllListings());
    setUsers(getAllUsers());
  };

  const handleDeleteListing = (listingId, title) => {
    if (window.confirm(`Supprimer l'annonce "${title}" ?`)) {
      try {
        adminDeleteListing(listingId);
        setListings(prev => prev.filter(l => l.id !== listingId));
        loadData(); // Recharger les stats
        alert('Annonce supprimée avec succès');
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteUser = (userId, userName) => {
    if (userId === user.id) {
      alert('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    if (window.confirm(`Supprimer l'utilisateur "${userName}" ? Cette action est irréversible.`)) {
      try {
        adminDeleteUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        loadData();
        alert('Utilisateur supprimé avec succès');
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const roleLabels = {
    proprietaire: 'Propriétaire',
    courtier: 'Courtier',
    locataire: 'Locataire',
    admin: 'Administrateur'
  };

  if (!stats) {
    return (
      <div className="page dashboard">
        <div className="container">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page dashboard dashboard-admin">
      <div className="container">
        <div className="dashboard-header">
          <div className="dashboard-header-user">
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} className="dashboard-user-photo" />
            ) : (
              <div className="dashboard-user-photo dashboard-user-photo-placeholder">
                {user.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
            <div>
              <h1>Dashboard Administrateur</h1>
              <p className="dashboard-subtitle">Bienvenue, {user.name} !</p>
            </div>
          </div>
        </div>

        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Vue d'ensemble
          </button>
          <button 
            className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            📋 Annonces ({stats.totalListings})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Utilisateurs ({stats.totalUsers})
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.totalListings}</div>
                  <div className="stat-label">Total annonces</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.activeListings}</div>
                  <div className="stat-label">Annonces actives</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.totalUsers}</div>
                  <div className="stat-label">Total utilisateurs</div>
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

            <div className="dashboard-section">
              <h2>Répartition par type d'annonce</h2>
              <div className="type-stats">
                {Object.entries(stats.listingsByType || {}).map(([type, count]) => (
                  <div key={type} className="type-stat-item">
                    <span className="type-name">{type}</span>
                    <span className="type-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-section">
              <h2>Répartition par ville</h2>
              <div className="city-stats">
                {Object.entries(stats.listingsByCity || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([city, count]) => (
                    <div key={city} className="city-stat-item">
                      <span className="city-name">📍 {city}</span>
                      <span className="city-count">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="dashboard-section">
              <h2>Répartition par rôle</h2>
              <div className="role-stats">
                {Object.entries(stats.usersByRole || {}).map(([role, count]) => (
                  <div key={role} className="role-stat-item">
                    <span className="role-name">{roleLabels[role] || role}</span>
                    <span className="role-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-section">
              <h2>Annonces récentes</h2>
              <div className="listings-grid">
                {stats.recentListings.slice(0, 6).map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'listings' && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Toutes les annonces ({listings.length})</h2>
            </div>
            {listings.length > 0 ? (
              <div className="admin-listings">
                {listings.map(listing => (
                  <div key={listing.id} className="admin-listing-item">
                    <div className="admin-listing-card-wrapper">
                      <Link to={`/listing/${listing.id}`} className="admin-listing-link">
                        <ListingCard listing={listing} disableLink={true} />
                      </Link>
                    </div>
                    <div className="admin-actions">
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteListing(listing.id, listing.title)}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Aucune annonce</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Tous les utilisateurs ({users.length})</h2>
            </div>
            {users.length > 0 ? (
              <div className="admin-users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Téléphone</th>
                      <th>Date d'inscription</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(userItem => (
                      <tr key={userItem.id}>
                        <td>{userItem.name}</td>
                        <td>{userItem.email}</td>
                        <td>
                          <span className={`role-badge role-${userItem.role}`}>
                            {roleLabels[userItem.role] || userItem.role}
                          </span>
                        </td>
                        <td>{userItem.phone || '-'}</td>
                        <td>{new Date(userItem.createdAt).toLocaleDateString('fr-FR')}</td>
                        <td>
                          {userItem.id !== user.id && (
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => handleDeleteUser(userItem.id, userItem.name)}
                            >
                              Supprimer
                            </button>
                          )}
                          {userItem.id === user.id && (
                            <span className="text-muted">Vous</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>Aucun utilisateur</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

