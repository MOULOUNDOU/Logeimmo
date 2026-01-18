// Service pour gérer les favoris des locataires

const STORAGE_KEY_FAVORITES = 'senchambres_favorites';
const STORAGE_KEY_SEARCHES = 'senchambres_searches';

// Récupérer les favoris d'un utilisateur
export const getUserFavorites = (userId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FAVORITES);
    const allFavorites = stored ? JSON.parse(stored) : [];
    return allFavorites.filter(fav => fav.userId === userId);
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return [];
  }
};

// Ajouter un favori
export const addFavorite = (userId, listingId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FAVORITES);
    const favorites = stored ? JSON.parse(stored) : [];
    
    // Vérifier si déjà en favori
    if (favorites.find(f => f.userId === userId && f.listingId === listingId)) {
      return false;
    }

    favorites.push({
      id: generateId(),
      userId,
      listingId,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
    
    // Envoyer une notification (de manière asynchrone)
    import('./notificationsService.js').then(({ notifyFavorite }) => {
      import('./listingService.js').then(({ getListingById }) => {
        import('./authService.js').then(({ getCurrentUser }) => {
          const listing = getListingById(listingId);
          const user = getCurrentUser();
          if (listing && listing.userId && user && listing.userId !== userId) {
            notifyFavorite(listing.userId, listingId, listing.title, user.name, userId);
          }
        });
      });
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du favori:', error);
    throw error;
  }
};

// Retirer un favori
export const removeFavorite = (userId, listingId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FAVORITES);
    const favorites = stored ? JSON.parse(stored) : [];
    const filtered = favorites.filter(
      f => !(f.userId === userId && f.listingId === listingId)
    );
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error);
    throw error;
  }
};

// Vérifier si une annonce est en favori
export const isFavorite = (userId, listingId) => {
  const favorites = getUserFavorites(userId);
  return favorites.some(f => f.listingId === listingId);
};

// Sauvegarder une recherche
export const saveSearch = (userId, searchParams) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SEARCHES);
    const searches = stored ? JSON.parse(stored) : [];
    
    searches.push({
      id: generateId(),
      userId,
      ...searchParams,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEY_SEARCHES, JSON.stringify(searches));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la recherche:', error);
    throw error;
  }
};

// Récupérer les recherches sauvegardées d'un utilisateur
export const getUserSearches = (userId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SEARCHES);
    const allSearches = stored ? JSON.parse(stored) : [];
    return allSearches
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10); // Limiter à 10 recherches récentes
  } catch (error) {
    console.error('Erreur lors de la récupération des recherches:', error);
    return [];
  }
};

// Supprimer une recherche sauvegardée
export const deleteSearch = (searchId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SEARCHES);
    const searches = stored ? JSON.parse(stored) : [];
    const filtered = searches.filter(s => s.id !== searchId);
    localStorage.setItem(STORAGE_KEY_SEARCHES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la recherche:', error);
    throw error;
  }
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

