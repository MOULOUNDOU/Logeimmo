// Service pour gérer les commentaires sur les annonces

const STORAGE_KEY_COMMENTS = 'senchambres_comments';

// Récupérer tous les commentaires d'une annonce
export const getListingComments = (listingId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_COMMENTS);
    const allComments = stored ? JSON.parse(stored) : [];
    return allComments
      .filter(comment => comment.listingId === listingId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Plus récents en premier
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return [];
  }
};

// Compter les commentaires d'une annonce
export const getCommentCount = (listingId) => {
  return getListingComments(listingId).length;
};

// Ajouter un commentaire
export const addComment = (userId, userName, listingId, text) => {
  try {
    if (!text || !text.trim()) {
      throw new Error('Le commentaire ne peut pas être vide');
    }

    const stored = localStorage.getItem(STORAGE_KEY_COMMENTS);
    const comments = stored ? JSON.parse(stored) : [];

    const newComment = {
      id: generateId(),
      userId,
      userName,
      listingId,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    comments.push(newComment);
    localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(comments));
    
    // Importer et envoyer la notification de manière asynchrone pour éviter les imports circulaires
    import('./notificationsService.js').then(({ notifyComment }) => {
      // Récupérer les infos de l'annonce pour la notification
      import('./listingService.js').then(({ getListingById }) => {
        const listing = getListingById(listingId);
        if (listing && listing.userId) {
          notifyComment(listing.userId, listingId, listing.title, userName, userId);
        }
      });
    });

    return newComment;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    throw error;
  }
};

// Supprimer un commentaire
export const deleteComment = (commentId, userId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_COMMENTS);
    const comments = stored ? JSON.parse(stored) : [];
    const comment = comments.find(c => c.id === commentId);
    
    if (!comment) {
      throw new Error('Commentaire introuvable');
    }

    // Vérifier que l'utilisateur est le propriétaire du commentaire
    if (comment.userId !== userId) {
      throw new Error('Vous n\'êtes pas autorisé à supprimer ce commentaire');
    }

    const filtered = comments.filter(c => c.id !== commentId);
    localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    throw error;
  }
};

// Modifier un commentaire
export const updateComment = (commentId, userId, newText) => {
  try {
    if (!newText || !newText.trim()) {
      throw new Error('Le commentaire ne peut pas être vide');
    }

    const stored = localStorage.getItem(STORAGE_KEY_COMMENTS);
    const comments = stored ? JSON.parse(stored) : [];
    const index = comments.findIndex(c => c.id === commentId);
    
    if (index === -1) {
      throw new Error('Commentaire introuvable');
    }

    const comment = comments[index];
    
    // Vérifier que l'utilisateur est le propriétaire du commentaire
    if (comment.userId !== userId) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce commentaire');
    }

    comments[index] = {
      ...comment,
      text: newText.trim(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(comments));
    return comments[index];
  } catch (error) {
    console.error('Erreur lors de la modification du commentaire:', error);
    throw error;
  }
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

