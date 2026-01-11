// Service pour comparer des annonces

const STORAGE_KEY_COMPARISON = 'senchambres_comparison';

// Ajouter une annonce à la comparaison
export const addToComparison = (listingId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_COMPARISON);
    const comparison = stored ? JSON.parse(stored) : [];
    
    // Limiter à 3 annonces maximum
    if (comparison.length >= 3) {
      throw new Error('Vous ne pouvez comparer que 3 annonces maximum');
    }

    // Vérifier si déjà dans la comparaison
    if (comparison.includes(listingId)) {
      return false; // Déjà ajouté
    }

    comparison.push(listingId);
    localStorage.setItem(STORAGE_KEY_COMPARISON, JSON.stringify(comparison));
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout à la comparaison:', error);
    throw error;
  }
};

// Retirer une annonce de la comparaison
export const removeFromComparison = (listingId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_COMPARISON);
    const comparison = stored ? JSON.parse(stored) : [];
    const filtered = comparison.filter(id => id !== listingId);
    localStorage.setItem(STORAGE_KEY_COMPARISON, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la comparaison:', error);
    throw error;
  }
};

// Récupérer les annonces en comparaison
export const getComparison = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_COMPARISON);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération de la comparaison:', error);
    return [];
  }
};

// Vérifier si une annonce est en comparaison
export const isInComparison = (listingId) => {
  const comparison = getComparison();
  return comparison.includes(listingId);
};

// Vider la comparaison
export const clearComparison = () => {
  localStorage.removeItem(STORAGE_KEY_COMPARISON);
  return true;
};



