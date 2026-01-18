// Service pour gérer les annonces (CRUD + localStorage)
// Architecture prête pour brancher un backend plus tard

import { seedListings } from '../data/seedListings.js';
import { getCurrentUser } from './authService.js';

const STORAGE_KEY = 'senchambres_listings';
const STORAGE_KEY_REPORTS = 'senchambres_reports';

// Initialiser avec les données seed si localStorage est vide
const initializeStorage = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    // Ajouter userId: null pour les annonces seed (publiques)
    const seedWithUserId = seedListings.map(listing => ({
      ...listing,
      userId: null // Annonces publiques/exemples
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedWithUserId));
  }
};

// Récupérer toutes les annonces
export const getAllListings = () => {
  try {
    initializeStorage();
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : seedListings;
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
    return seedListings;
  }
};

// Récupérer une annonce par ID
export const getListingById = (id) => {
  const listings = getAllListings();
  return listings.find(listing => listing.id === id) || null;
};

// Créer une nouvelle annonce
export const createListing = (listingData) => {
  const listings = getAllListings();
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    throw new Error('Vous devez être connecté pour publier une annonce');
  }

  const newListing = {
    ...listingData,
    id: generateId(),
    userId: currentUser.id, // Associer l'annonce à l'utilisateur connecté
    createdAt: new Date().toISOString()
  };
  const updatedListings = [...listings, newListing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedListings));
  return newListing;
};

// Mettre à jour une annonce
export const updateListing = (id, listingData) => {
  const listings = getAllListings();
  const currentUser = getCurrentUser();
  const index = listings.findIndex(listing => listing.id === id);
  
  if (index === -1) {
    throw new Error('Annonce introuvable');
  }

  const listing = listings[index];
  
  // Vérifier que l'utilisateur est le propriétaire de l'annonce
  if (currentUser && listing.userId !== currentUser.id) {
    throw new Error('Vous n\'êtes pas autorisé à modifier cette annonce');
  }

  const updatedListing = {
    ...listing,
    ...listingData,
    id, // S'assurer que l'ID ne change pas
    userId: listing.userId // Conserver le userId original
  };
  const updatedListings = [...listings];
  updatedListings[index] = updatedListing;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedListings));
  return updatedListing;
};

// Supprimer une annonce
export const deleteListing = (id) => {
  const listings = getAllListings();
  const currentUser = getCurrentUser();
  const listing = listings.find(l => l.id === id);
  
  if (!listing) {
    throw new Error('Annonce introuvable');
  }

  // Vérifier que l'utilisateur est le propriétaire de l'annonce
  if (currentUser && listing.userId !== currentUser.id) {
    throw new Error('Vous n\'êtes pas autorisé à supprimer cette annonce');
  }

  const filteredListings = listings.filter(listing => listing.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredListings));
  return true;
};

// Récupérer les annonces d'un utilisateur
export const getUserListings = (userId) => {
  const listings = getAllListings();
  return listings.filter(listing => listing.userId === userId);
};

// Signaler une annonce
export const reportListing = (listingId, reason, message) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REPORTS);
    const reports = stored ? JSON.parse(stored) : [];
    const newReport = {
      id: generateId(),
      listingId,
      reason,
      message,
      createdAt: new Date().toISOString()
    };
    reports.push(newReport);
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    return newReport;
  } catch (error) {
    console.error('Erreur lors du signalement:', error);
    throw error;
  }
};

// Générer un ID unique
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Initialiser au chargement du module
if (typeof window !== 'undefined') {
  initializeStorage();
}

// Pour un futur backend, on pourrait remplacer ces fonctions par des appels API :
/*
export const getAllListings = async () => {
  const response = await fetch('/api/listings');
  return response.json();
};

export const getListingById = async (id) => {
  const response = await fetch(`/api/listings/${id}`);
  return response.json();
};

export const createListing = async (listingData) => {
  const response = await fetch('/api/listings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listingData)
  });
  return response.json();
};

export const updateListing = async (id, listingData) => {
  const response = await fetch(`/api/listings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listingData)
  });
  return response.json();
};

export const deleteListing = async (id) => {
  const response = await fetch(`/api/listings/${id}`, {
    method: 'DELETE'
  });
  return response.ok;
};
*/

