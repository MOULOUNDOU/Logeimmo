// Service d'authentification avec localStorage pour Next.js
// Architecture prête pour brancher un backend plus tard

const STORAGE_KEY_AUTH = 'digicode_immo_auth';
const STORAGE_KEY_USERS = 'digicode_immo_users';
const STORAGE_KEY_ANNONCES = 'digicode_immo_annonces';

// Types de compte
import { USER_ROLES } from './supabase/auth'
export { USER_ROLES }

// Générer un token simple
const generateToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Initialiser les utilisateurs par défaut si nécessaire
const initializeUsers = () => {
  if (typeof window === 'undefined') return;
  
  const existingUsers = localStorage.getItem(STORAGE_KEY_USERS);
  if (!existingUsers) {
    const defaultUsers = [
      {
        id: '1',
        nom: 'Admin',
        email: 'admin@digicode.immo',
        password: 'admin123',
        role: USER_ROLES.ADMIN,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        nom: 'Mamadou Diallo',
        email: 'courtier@digicode.immo',
        password: 'courtier123',
        role: USER_ROLES.COURTIER,
        telephone: '+221 77 123 45 67',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        nom: 'Client Test',
        email: 'client@digicode.immo',
        password: 'client123',
        role: USER_ROLES.CLIENT,
        telephone: '+221 77 987 65 43',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(defaultUsers));
  }
};

// Inscription
export const register = (userData) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Ce code doit être exécuté côté client');
    }

    initializeUsers();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');

    // Vérifier si l'email existe déjà
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Créer le nouvel utilisateur
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      role: userData.role || USER_ROLES.CLIENT,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

    // Connecter automatiquement après l'inscription
    const { password, ...userWithoutPassword } = newUser;
    const authData = {
      user: userWithoutPassword,
      token: generateToken(),
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authData));
    return authData;
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
};

// Connexion
export const login = (email, password) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Ce code doit être exécuté côté client');
    }

    initializeUsers();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');

    const user = users.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Stocker la session (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user;
    const authData = {
      user: userWithoutPassword,
      token: generateToken(),
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authData));
    return authData;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

// Déconnexion
export const logout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_AUTH);
};

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  const authData = localStorage.getItem(STORAGE_KEY_AUTH);
  return !!authData;
};

// Obtenir l'utilisateur actuel
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const authData = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!authData) return null;
    return JSON.parse(authData);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
};

// Vérifier si l'utilisateur a un rôle spécifique
export const hasRole = (role) => {
  const authData = getCurrentUser();
  if (!authData || !authData.user) return false;
  return authData.user.role === role;
};

// Vérifier si l'utilisateur peut publier des annonces (courtier ou admin)
export const canPublishAnnonces = () => {
  const authData = getCurrentUser();
  if (!authData || !authData.user) return false;
  return authData.user.role === USER_ROLES.COURTIER || authData.user.role === USER_ROLES.ADMIN;
};

// Gestion des annonces
export const getAnnonces = () => {
  if (typeof window === 'undefined') return [];
  try {
    const annonces = localStorage.getItem(STORAGE_KEY_ANNONCES);
    return annonces ? JSON.parse(annonces) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
    return [];
  }
};

export const createAnnonce = (annonceData) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Ce code doit être exécuté côté client');
    }

    const authData = getCurrentUser();
    if (!authData || !canPublishAnnonces()) {
      throw new Error('Vous n\'avez pas la permission de publier des annonces');
    }

    const annonces = getAnnonces();
    const newAnnonce = {
      id: Date.now().toString(),
      ...annonceData,
      createdBy: authData.user.id,
      createdByNom: authData.user.nom,
      createdByPhoto: authData.user.photoProfil || null,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    annonces.push(newAnnonce);
    localStorage.setItem(STORAGE_KEY_ANNONCES, JSON.stringify(annonces));
    return newAnnonce;
  } catch (error) {
    console.error('Erreur lors de la création de l\'annonce:', error);
    throw error;
  }
};

export const updateAnnonce = (id, updates) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Ce code doit être exécuté côté client');
    }

    const annonces = getAnnonces();
    const index = annonces.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error('Annonce non trouvée');
    }

    const authData = getCurrentUser();
    const annonce = annonces[index];
    
    // Seul le créateur ou un admin peut modifier
    if (annonce.createdBy !== authData?.user?.id && authData?.user?.role !== USER_ROLES.ADMIN) {
      throw new Error('Vous n\'avez pas la permission de modifier cette annonce');
    }

    // Mettre à jour la photo du courtier si l'utilisateur a changé sa photo
    const updatedAnnonce = {
      ...annonce,
      ...updates,
      updatedAt: new Date().toISOString(),
      createdByPhoto: authData?.user?.photoProfil || annonce.createdByPhoto || null,
      createdByNom: authData?.user?.nom || annonce.createdByNom
    };
    
    annonces[index] = updatedAnnonce;

    localStorage.setItem(STORAGE_KEY_ANNONCES, JSON.stringify(annonces));
    return annonces[index];
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'annonce:', error);
    throw error;
  }
};

export const deleteAnnonce = (id) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Ce code doit être exécuté côté client');
    }

    const annonces = getAnnonces();
    const annonce = annonces.find(a => a.id === id);
    
    if (!annonce) {
      throw new Error('Annonce non trouvée');
    }

    const authData = getCurrentUser();
    
    // Seul le créateur ou un admin peut supprimer
    if (annonce.createdBy !== authData?.user?.id && authData?.user?.role !== USER_ROLES.ADMIN) {
      throw new Error('Vous n\'avez pas la permission de supprimer cette annonce');
    }

    const filteredAnnonces = annonces.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY_ANNONCES, JSON.stringify(filteredAnnonces));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'annonce:', error);
    throw error;
  }
};

// Gestion des utilisateurs (pour admin)
export const getAllUsers = () => {
  if (typeof window === 'undefined') return [];
  try {
    const users = localStorage.getItem(STORAGE_KEY_USERS);
    if (!users) return [];
    const allUsers = JSON.parse(users);
    // Retirer les mots de passe
    return allUsers.map(({ password, ...user }) => user);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return [];
  }
};

