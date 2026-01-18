// Service pour gérer les likes sur les annonces

const STORAGE_KEY_LIKES = 'senchambres_likes';

// Récupérer tous les likes d'une annonce
export const getListingLikes = (listingId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LIKES);
    const allLikes = stored ? JSON.parse(stored) : [];
    return allLikes.filter(like => like.listingId === listingId);
  } catch (error) {
    console.error('Erreur lors de la récupération des likes:', error);
    return [];
  }
};

// Compter les likes d'une annonce
export const getLikeCount = (listingId) => {
  return getListingLikes(listingId).length;
};

// Vérifier si un utilisateur a liké une annonce
export const hasUserLiked = (userId, listingId) => {
  const likes = getListingLikes(listingId);
  return likes.some(like => like.userId === userId);
};

// Ajouter un like
export const addLike = (userId, listingId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LIKES);
    const likes = stored ? JSON.parse(stored) : [];
    
    // Vérifier si déjà liké
    if (likes.find(l => l.userId === userId && l.listingId === listingId)) {
      return false; // Déjà liké
    }

    likes.push({
      id: generateId(),
      userId,
      listingId,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(likes));
    
    // Envoyer une notification (de manière asynchrone pour éviter les imports circulaires)
    import('./notificationsService.js').then(({ notifyLike }) => {
      import('./listingService.js').then(({ getListingById }) => {
        import('./authService.js').then(({ getCurrentUser }) => {
          const listing = getListingById(listingId);
          const user = getCurrentUser();
          if (listing && listing.userId && user && listing.userId !== userId) {
            notifyLike(listing.userId, listingId, listing.title, user.name, userId);
          }
        });
      });
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du like:', error);
    throw error;
  }
};

// Retirer un like
export const removeLike = (userId, listingId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LIKES);
    const likes = stored ? JSON.parse(stored) : [];
    const filtered = likes.filter(
      l => !(l.userId === userId && l.listingId === listingId)
    );
    localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du like:', error);
    throw error;
  }
};

// Toggle like (ajouter si pas liké, retirer si liké)
export const toggleLike = (userId, listingId) => {
  const hasLiked = hasUserLiked(userId, listingId);
  if (hasLiked) {
    return removeLike(userId, listingId);
  } else {
    return addLike(userId, listingId);
  }
};

// Récupérer les annonces les plus likées
export const getMostLikedListings = (limit = 10) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LIKES);
    const allLikes = stored ? JSON.parse(stored) : [];
    
    // Compter les likes par annonce
    const likesCount = {};
    allLikes.forEach(like => {
      likesCount[like.listingId] = (likesCount[like.listingId] || 0) + 1;
    });

    // Trier par nombre de likes
    const sorted = Object.entries(likesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([listingId]) => listingId);

    return sorted;
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces populaires:', error);
    return [];
  }
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

