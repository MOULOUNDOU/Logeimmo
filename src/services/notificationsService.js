// Service pour gérer les notifications

const STORAGE_KEY_NOTIFICATIONS = 'senchambres_notifications';

// Types de notifications
export const NOTIFICATION_TYPES = {
  COMMENT: 'comment',
  LIKE: 'like',
  FAVORITE: 'favorite',
  REPORT: 'report',
  NEW_LISTING: 'new_listing'
};

// Créer une notification
export const createNotification = (notificationData) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    const notifications = stored ? JSON.parse(stored) : [];

    const newNotification = {
      id: generateId(),
      ...notificationData,
      read: false,
      createdAt: new Date().toISOString()
    };

    notifications.unshift(newNotification); // Ajouter au début
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    return newNotification;
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    throw error;
  }
};

// Récupérer les notifications d'un utilisateur
export const getUserNotifications = (userId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    const allNotifications = stored ? JSON.parse(stored) : [];
    return allNotifications.filter(notif => notif.userId === userId);
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return [];
  }
};

// Compter les notifications non lues
export const getUnreadCount = (userId) => {
  const notifications = getUserNotifications(userId);
  return notifications.filter(notif => !notif.read).length;
};

// Marquer une notification comme lue
export const markAsRead = (notificationId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    const notifications = stored ? JSON.parse(stored) : [];
    const index = notifications.findIndex(notif => notif.id === notificationId);
    
    if (index !== -1) {
      notifications[index].read = true;
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    throw error;
  }
};

// Marquer toutes les notifications comme lues
export const markAllAsRead = (userId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    const notifications = stored ? JSON.parse(stored) : [];
    
    const updated = notifications.map(notif => {
      if (notif.userId === userId && !notif.read) {
        return { ...notif, read: true };
      }
      return notif;
    });

    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    throw error;
  }
};

// Supprimer une notification
export const deleteNotification = (notificationId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    const notifications = stored ? JSON.parse(stored) : [];
    const filtered = notifications.filter(notif => notif.id !== notificationId);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    throw error;
  }
};

// Supprimer toutes les notifications
export const deleteAllNotifications = (userId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    const allNotifications = stored ? JSON.parse(stored) : [];
    const filtered = allNotifications.filter(notif => notif.userId !== userId);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression des notifications:', error);
    throw error;
  }
};

// Notifier un commentaire
export const notifyComment = (listingOwnerId, listingId, listingTitle, commenterName, commenterId) => {
  if (!listingOwnerId) return null; // Pas de notification si l'annonce n'a pas de propriétaire (seed data)
  
  return createNotification({
    userId: listingOwnerId,
    type: NOTIFICATION_TYPES.COMMENT,
    title: 'Nouveau commentaire',
    message: `${commenterName} a commenté votre annonce "${listingTitle}"`,
    listingId,
    relatedUserId: commenterId,
    link: `/listing/${listingId}`
  });
};

// Notifier un like
export const notifyLike = (listingOwnerId, listingId, listingTitle, likerName, likerId) => {
  if (!listingOwnerId) return null;
  
  return createNotification({
    userId: listingOwnerId,
    type: NOTIFICATION_TYPES.LIKE,
    title: 'Nouveau like',
    message: `${likerName} a liké votre annonce "${listingTitle}"`,
    listingId,
    relatedUserId: likerId,
    link: `/listing/${listingId}`
  });
};

// Notifier un ajout en favoris
export const notifyFavorite = (listingOwnerId, listingId, listingTitle, favoriterName, favoriterId) => {
  if (!listingOwnerId) return null;
  
  return createNotification({
    userId: listingOwnerId,
    type: NOTIFICATION_TYPES.FAVORITE,
    title: 'Ajouté aux favoris',
    message: `${favoriterName} a ajouté votre annonce "${listingTitle}" à ses favoris`,
    listingId,
    relatedUserId: favoriterId,
    link: `/listing/${listingId}`
  });
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};



