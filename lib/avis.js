// Service pour gérer les avis sur les annonces

const STORAGE_KEY_AVIS = 'digicode_immo_avis';

// Récupérer tous les avis d'une annonce
export const getAnnonceAvis = (annonceId) => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_AVIS);
    const allAvis = stored ? JSON.parse(stored) : [];
    return allAvis
      .filter(avis => avis.annonceId === annonceId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Plus récents en premier
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    return [];
  }
};

// Récupérer tous les avis d'un courtier
export const getCourtierAvis = (courtierId) => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_AVIS);
    const allAvis = stored ? JSON.parse(stored) : [];
    return allAvis
      .filter(avis => avis.courtierId === courtierId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    return [];
  }
};

// Calculer la note moyenne d'une annonce
export const getNoteMoyenne = (annonceId) => {
  const avis = getAnnonceAvis(annonceId);
  if (avis.length === 0) return 0;
  const somme = avis.reduce((acc, avis) => acc + avis.note, 0);
  return (somme / avis.length).toFixed(1);
};

// Calculer la note moyenne d'un courtier
export const getCourtierNoteMoyenne = (courtierId) => {
  const avis = getCourtierAvis(courtierId);
  if (avis.length === 0) return 0;
  const somme = avis.reduce((acc, avis) => acc + avis.note, 0);
  return (somme / avis.length).toFixed(1);
};

// Vérifier si un utilisateur a déjà donné un avis sur une annonce
export const hasUserAvis = (userId, annonceId) => {
  const avis = getAnnonceAvis(annonceId);
  return avis.some(a => a.userId === userId);
};

// Ajouter un avis
export const addAvis = (userId, userName, userPhoto, annonceId, courtierId, note, commentaire) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Ce code doit être exécuté côté client');
    }

    if (!note || note < 1 || note > 5) {
      throw new Error('La note doit être entre 1 et 5');
    }

    if (!commentaire || !commentaire.trim()) {
      throw new Error('Le commentaire est requis');
    }

    const stored = localStorage.getItem(STORAGE_KEY_AVIS);
    const allAvis = stored ? JSON.parse(stored) : [];

    // Vérifier si l'utilisateur a déjà donné un avis
    const existingAvis = allAvis.find(a => a.userId === userId && a.annonceId === annonceId);
    if (existingAvis) {
      throw new Error('Vous avez déjà donné un avis pour cette annonce');
    }

    const newAvis = {
      id: Date.now().toString(),
      userId,
      userName,
      userPhoto: userPhoto || null,
      annonceId,
      courtierId,
      note: parseInt(note),
      commentaire: commentaire.trim(),
      createdAt: new Date().toISOString()
    };

    allAvis.push(newAvis);
    localStorage.setItem(STORAGE_KEY_AVIS, JSON.stringify(allAvis));
    return newAvis;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'avis:', error);
    throw error;
  }
};

// Supprimer un avis
export const deleteAvis = (avisId, userId) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Ce code doit être exécuté côté client');
    }

    const stored = localStorage.getItem(STORAGE_KEY_AVIS);
    const allAvis = stored ? JSON.parse(stored) : [];
    const avis = allAvis.find(a => a.id === avisId);

    if (!avis) {
      throw new Error('Avis non trouvé');
    }

    // Seul l'auteur ou un admin peut supprimer
    const { getCurrentUser } = require('@/lib/auth');
    const authData = getCurrentUser();
    if (avis.userId !== userId && authData?.user?.role !== 'admin') {
      throw new Error('Vous n\'avez pas la permission de supprimer cet avis');
    }

    const filtered = allAvis.filter(a => a.id !== avisId);
    localStorage.setItem(STORAGE_KEY_AVIS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    throw error;
  }
};
