// Service pour les fonctionnalités admin

import { getAllListings, deleteListing } from './listingService.js';
import { getAllUsers, deleteUser, updateUser } from './userService.js';

// Récupérer toutes les statistiques
export const getDashboardStats = () => {
  const listings = getAllListings();
  const users = getAllUsers();
  
  // Statistiques par type d'annonce
  const byType = listings.reduce((acc, listing) => {
    acc[listing.type] = (acc[listing.type] || 0) + 1;
    return acc;
  }, {});

  // Statistiques par ville
  const byCity = listings.reduce((acc, listing) => {
    acc[listing.city] = (acc[listing.city] || 0) + 1;
    return acc;
  }, {});

  // Statistiques par rôle
  const byRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  // Prix moyen
  const prices = listings.map(l => l.price).filter(p => p > 0);
  const avgPrice = prices.length > 0 
    ? prices.reduce((a, b) => a + b, 0) / prices.length 
    : 0;

  return {
    totalListings: listings.length,
    totalUsers: users.length,
    activeListings: listings.filter(l => l.userId !== null).length,
    listingsByType: byType,
    listingsByCity: byCity,
    usersByRole: byRole,
    averagePrice: Math.round(avgPrice),
    recentListings: listings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10),
    recentUsers: users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
  };
};

// Supprimer une annonce (admin)
export const adminDeleteListing = (listingId) => {
  return deleteListing(listingId);
};

// Supprimer un utilisateur (admin)
export const adminDeleteUser = (userId) => {
  return deleteUser(userId);
};

// Mettre à jour un utilisateur (admin)
export const adminUpdateUser = (userId, userData) => {
  return updateUser(userId, userData);
};






