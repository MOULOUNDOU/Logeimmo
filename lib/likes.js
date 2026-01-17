// Service pour gérer les likes sur les annonces

const STORAGE_KEY_LIKES = 'digicode_immo_likes';

// Récupérer tous les likes d'une annonce
export const getAnnonceLikes = (annonceId) => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LIKES);
    const allLikes = stored ? JSON.parse(stored) : [];
    return allLikes.filter(like => like.annonceId === annonceId);
  } catch (error) {
    console.error('Erreur lors de la récupération des likes:', error);
    return [];
  }
};

// Compter les likes d'une annonce
export const getLikeCount = (annonceId) => {
  return getAnnonceLikes(annonceId).length;
};

// Vérifier si un utilisateur a liké une annonce
export const hasUserLiked = (userId, annonceId) => {
  if (!userId) return false;
  const likes = getAnnonceLikes(annonceId);
  return likes.some(like => like.userId === userId);
};

// Ajouter un like
export const addLike = (userId, annonceId) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Ce code doit être exécuté côté client');
    }

    const stored = localStorage.getItem(STORAGE_KEY_LIKES);
    const likes = stored ? JSON.parse(stored) : [];
    
    // Vérifier si déjà liké
    if (likes.find(l => l.userId === userId && l.annonceId === annonceId)) {
      return false; // Déjà liké
    }

    likes.push({
      id: Date.now().toString(),
      userId,
      annonceId,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(likes));
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du like:', error);
    throw error;
  }
};

// Retirer un like
export const removeLike = (userId, annonceId) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Ce code doit être exécuté côté client');
    }

    const stored = localStorage.getItem(STORAGE_KEY_LIKES);
    const likes = stored ? JSON.parse(stored) : [];
    const filtered = likes.filter(
      l => !(l.userId === userId && l.annonceId === annonceId)
    );
    localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du like:', error);
    throw error;
  }
};

// Toggle like (ajouter si pas liké, retirer si liké)
export const toggleLike = (userId, annonceId) => {
  const hasLiked = hasUserLiked(userId, annonceId);
  if (hasLiked) {
    return removeLike(userId, annonceId);
  } else {
    return addLike(userId, annonceId);
  }
};

// Récupérer les annonces les plus likées
export const getMostLikedAnnonces = (limit = 10) => {
  if (typeof window === 'undefined') return [];
  try {
    const { getAnnonces } = require('@/lib/auth');
    const annonces = getAnnonces();
    const stored = localStorage.getItem(STORAGE_KEY_LIKES);
    const allLikes = stored ? JSON.parse(stored) : [];
    
    // Compter les likes par annonce
    const likesCount = {};
    allLikes.forEach(like => {
      likesCount[like.annonceId] = (likesCount[like.annonceId] || 0) + 1;
    });
    
    // Trier les annonces par nombre de likes
    return annonces
      .filter(a => likesCount[a.id] > 0)
      .sort((a, b) => (likesCount[b.id] || 0) - (likesCount[a.id] || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces les plus likées:', error);
    return [];
  }
};
