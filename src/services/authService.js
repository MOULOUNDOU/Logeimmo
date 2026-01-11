// Service d'authentification avec localStorage
// Architecture prête pour brancher un backend plus tard

const STORAGE_KEY_AUTH = 'senchambres_auth';
const STORAGE_KEY_USERS = 'senchambres_users';

// Types de compte
export const USER_ROLES = {
  PROPRIETAIRE: 'proprietaire',
  COURTIER: 'courtier',
  LOCATAIRE: 'locataire',
  ADMIN: 'admin'
};

// Initialiser les utilisateurs de test si nécessaire
const initializeUsers = () => {
  const existing = localStorage.getItem(STORAGE_KEY_USERS);
  const defaultUsers = [
    {
      id: '1',
      email: 'proprietaire@example.com',
      password: '123456', // En production, toujours hasher les mots de passe
      name: 'Jean Diallo',
      role: USER_ROLES.PROPRIETAIRE,
      phone: '+221771234567',
      profilePhoto: null,
      createdAt: new Date('2024-01-01').toISOString()
    },
    {
      id: '2',
      email: 'courtier@example.com',
      password: '123456',
      name: 'Marie Ndiaye',
      role: USER_ROLES.COURTIER,
      phone: '+221775678901',
      profilePhoto: null,
      createdAt: new Date('2024-01-02').toISOString()
    },
    {
      id: '3',
      email: 'locataire@example.com',
      password: '123456',
      name: 'Amadou Ba',
      role: USER_ROLES.LOCATAIRE,
      phone: '+221779876543',
      profilePhoto: null,
      createdAt: new Date('2024-01-03').toISOString()
    },
    {
      id: 'admin',
      email: 'digicode242@gmail.com',
      password: 'mavie242',
      name: 'Administrateur',
      role: USER_ROLES.ADMIN,
      phone: '+221771111111',
      profilePhoto: null,
      createdAt: new Date('2024-01-01').toISOString()
    }
  ];

  if (!existing) {
    // Aucun utilisateur existant, créer les utilisateurs par défaut
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(defaultUsers));
  } else {
    // Des utilisateurs existent déjà, mettre à jour l'admin si nécessaire
    try {
      const users = JSON.parse(existing);
      const adminIndex = users.findIndex(u => u.id === 'admin');
      const adminData = defaultUsers.find(u => u.id === 'admin');
      
      if (adminIndex !== -1 && adminData) {
        // Mettre à jour l'admin existant
        users[adminIndex] = adminData;
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      } else if (adminIndex === -1 && adminData) {
        // Admin n'existe pas, l'ajouter
        users.push(adminData);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'admin:', error);
      // En cas d'erreur, recréer les utilisateurs par défaut
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(defaultUsers));
    }
  }
};

// Inscription
export const register = (userData) => {
  try {
    initializeUsers();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    
    // Vérifier si l'email existe déjà
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Cet email est déjà utilisé');
    }

    const newUser = {
      id: generateId(),
      email: userData.email,
      password: userData.password, // ⚠️ En production, hasher avec bcrypt
      name: userData.name,
      role: userData.role,
      phone: userData.phone || '',
      profilePhoto: userData.profilePhoto || null,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    
    // Connecter automatiquement après inscription
    return login(userData.email, userData.password);
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
};

// Connexion
export const login = (email, password) => {
  try {
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
  localStorage.removeItem(STORAGE_KEY_AUTH);
};

// Récupérer l'utilisateur connecté
export const getCurrentUser = () => {
  try {
    const authData = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!authData) return null;
    return JSON.parse(authData).user;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
};

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

// Vérifier le rôle de l'utilisateur
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

// Mettre à jour le profil utilisateur (pour l'utilisateur connecté)
export const updateProfile = (userData) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }

    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const index = users.findIndex(u => u.id === currentUser.id);
    
    if (index === -1) {
      throw new Error('Utilisateur introuvable');
    }

    // Ne pas permettre de changer l'email (utilisé comme identifiant)
    const updatedUser = {
      ...users[index],
      ...userData,
      id: currentUser.id,
      email: users[index].email, // Conserver l'email original
      password: users[index].password, // Conserver le mot de passe (géré séparément)
      role: users[index].role // Conserver le rôle
    };

    users[index] = updatedUser;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

    // Mettre à jour la session
    const { password: _, ...userWithoutPassword } = updatedUser;
    const authData = {
      user: userWithoutPassword,
      token: generateToken(),
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authData));

    return userWithoutPassword;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
};

// Changer le mot de passe
export const changePassword = (currentPassword, newPassword) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }

    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const index = users.findIndex(u => u.id === currentUser.id);
    
    if (index === -1) {
      throw new Error('Utilisateur introuvable');
    }

    // Vérifier le mot de passe actuel
    if (users[index].password !== currentPassword) {
      throw new Error('Mot de passe actuel incorrect');
    }

    if (newPassword.length < 6) {
      throw new Error('Le nouveau mot de passe doit contenir au moins 6 caractères');
    }

    users[index].password = newPassword;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

    return true;
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    throw error;
  }
};

// Générer un ID unique
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Générer un token simple (en production, utiliser JWT)
const generateToken = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
};

// Initialiser au chargement du module
if (typeof window !== 'undefined') {
  initializeUsers();
}

