// Service pour gérer les utilisateurs (pour admin)

const STORAGE_KEY_USERS = 'senchambres_users';

// Récupérer tous les utilisateurs
export const getAllUsers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return [];
  }
};

// Récupérer un utilisateur par ID
export const getUserById = (userId) => {
  const users = getAllUsers();
  return users.find(user => user.id === userId) || null;
};

// Supprimer un utilisateur
export const deleteUser = (userId) => {
  try {
    const users = getAllUsers();
    const filtered = users.filter(user => user.id !== userId);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw error;
  }
};

// Mettre à jour un utilisateur
export const updateUser = (userId, userData) => {
  try {
    const users = getAllUsers();
    const index = users.findIndex(user => user.id === userId);
    
    if (index === -1) {
      throw new Error('Utilisateur introuvable');
    }

    const updatedUser = {
      ...users[index],
      ...userData,
      id: userId // S'assurer que l'ID ne change pas
    };

    users[index] = updatedUser;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    return updatedUser;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
};

