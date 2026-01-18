import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, hasRole, USER_ROLES } from '../services/authService';
import { getUserListings } from '../services/listingService';
import { getUserFavorites, getUserSearches } from '../services/favoritesService';
import { getDashboardStats } from '../services/adminService';
import { ListingCard } from '../components/ListingCard';
import { PriceTag } from '../components/PriceTag';
import { DashboardProprietaire } from '../components/dashboards/DashboardProprietaire';
import { DashboardCourtier } from '../components/dashboards/DashboardCourtier';
import { DashboardLocataire } from '../components/dashboards/DashboardLocataire';
import { DashboardAdmin } from '../components/dashboards/DashboardAdmin';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="page dashboard">
        <div className="container">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Afficher le dashboard selon le rôle
  if (hasRole(USER_ROLES.ADMIN)) {
    return <DashboardAdmin user={user} />;
  }

  if (hasRole(USER_ROLES.PROPRIETAIRE)) {
    return <DashboardProprietaire user={user} />;
  }

  if (hasRole(USER_ROLES.COURTIER)) {
    return <DashboardCourtier user={user} />;
  }

  if (hasRole(USER_ROLES.LOCATAIRE)) {
    return <DashboardLocataire user={user} />;
  }

  return (
    <div className="page dashboard">
      <div className="container">
        <h1>Dashboard</h1>
        <p>Type de compte non reconnu</p>
      </div>
    </div>
  );
};






