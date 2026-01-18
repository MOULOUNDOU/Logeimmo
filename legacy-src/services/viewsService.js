// Service pour gérer les statistiques de vues des annonces

const STORAGE_KEY_VIEWS = 'senchambres_views';

// Enregistrer une vue (compte chaque clic sur l'annonce)
export const recordView = (listingId, userId = null) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_VIEWS);
    const views = stored ? JSON.parse(stored) : [];
    
    // Vérifier si l'utilisateur a déjà vu cette annonce récemment (dans les 5 dernières minutes)
    // pour éviter le spam, mais permettre plusieurs vues
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentViews = views.filter(v => 
      v.listingId === listingId && 
      v.userId === userId &&
      v.timestamp > fiveMinutesAgo
    );

    // Si l'utilisateur a déjà vu récemment, on compte quand même (mais on pourrait limiter)
    // Pour un vrai système, on enregistrerait chaque vue
    
    views.push({
      id: generateId(),
      listingId,
      userId,
      timestamp: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEY_VIEWS, JSON.stringify(views));
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la vue:', error);
  }
};

// Compter les vues d'une annonce
export const getViewCount = (listingId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_VIEWS);
    const views = stored ? JSON.parse(stored) : [];
    return views.filter(v => v.listingId === listingId).length;
  } catch (error) {
    console.error('Erreur lors du comptage des vues:', error);
    return 0;
  }
};

// Récupérer les annonces les plus vues
export const getMostViewedListings = (limit = 10) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_VIEWS);
    const views = stored ? JSON.parse(stored) : [];
    
    // Compter les vues par annonce
    const viewCount = {};
    views.forEach(view => {
      viewCount[view.listingId] = (viewCount[view.listingId] || 0) + 1;
    });

    // Trier par nombre de vues
    const sorted = Object.entries(viewCount)
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

