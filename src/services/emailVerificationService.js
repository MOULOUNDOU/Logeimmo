// Service de vérification d'email avec codes de validation
// En production, les codes seraient envoyés par email via un service externe

const STORAGE_KEY_VERIFICATIONS = 'senchambres_email_verifications';
const CODE_EXPIRATION_TIME = 15 * 60 * 1000; // 15 minutes en millisecondes

// Générer un code de vérification (6 chiffres)
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Initialiser les vérifications
const initializeVerifications = () => {
  const existing = localStorage.getItem(STORAGE_KEY_VERIFICATIONS);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY_VERIFICATIONS, JSON.stringify([]));
  }
};

// Envoyer un code de vérification par email (simulé)
export const sendVerificationCode = (email) => {
  try {
    initializeVerifications();
    const verifications = JSON.parse(localStorage.getItem(STORAGE_KEY_VERIFICATIONS) || '[]');
    
    // Supprimer les anciens codes pour cet email
    const filteredVerifications = verifications.filter(v => v.email !== email);
    
    // Générer un nouveau code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRATION_TIME).toISOString();
    
    const verification = {
      email,
      code,
      expiresAt,
      createdAt: new Date().toISOString(),
      verified: false
    };
    
    filteredVerifications.push(verification);
    localStorage.setItem(STORAGE_KEY_VERIFICATIONS, JSON.stringify(filteredVerifications));
    
    // En production, envoyer l'email ici
    // Pour le MVP, on affiche le code dans la console (pour les tests)
    console.log(`Code de vérification pour ${email}: ${code}`);
    console.log('⚠️ En production, ce code serait envoyé par email');
    
    return { success: true, code: code }; // Retourner le code pour les tests (à retirer en production)
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code de vérification:', error);
    throw new Error('Erreur lors de l\'envoi du code de vérification');
  }
};

// Vérifier un code de vérification
export const verifyEmailCode = (email, code) => {
  try {
    initializeVerifications();
    const verifications = JSON.parse(localStorage.getItem(STORAGE_KEY_VERIFICATIONS) || '[]');
    
    const verification = verifications.find(
      v => v.email === email && !v.verified
    );
    
    if (!verification) {
      throw new Error('Aucun code de vérification trouvé pour cet email');
    }
    
    // Vérifier si le code a expiré
    if (new Date(verification.expiresAt) < new Date()) {
      throw new Error('Le code de vérification a expiré. Veuillez en demander un nouveau.');
    }
    
    // Vérifier le code
    if (verification.code !== code) {
      throw new Error('Code de vérification incorrect');
    }
    
    // Marquer comme vérifié
    verification.verified = true;
    verification.verifiedAt = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEY_VERIFICATIONS, JSON.stringify(verifications));
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    throw error;
  }
};

// Vérifier si un email a été vérifié
export const isEmailVerified = (email) => {
  try {
    initializeVerifications();
    const verifications = JSON.parse(localStorage.getItem(STORAGE_KEY_VERIFICATIONS) || '[]');
    
    const verification = verifications.find(
      v => v.email === email && v.verified
    );
    
    return !!verification;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    return false;
  }
};

// Nettoyer les codes expirés (à appeler périodiquement)
export const cleanExpiredCodes = () => {
  try {
    initializeVerifications();
    const verifications = JSON.parse(localStorage.getItem(STORAGE_KEY_VERIFICATIONS) || '[]');
    
    const now = new Date();
    const activeVerifications = verifications.filter(v => {
      return new Date(v.expiresAt) > now || v.verified;
    });
    
    localStorage.setItem(STORAGE_KEY_VERIFICATIONS, JSON.stringify(activeVerifications));
  } catch (error) {
    console.error('Erreur lors du nettoyage des codes:', error);
  }
};

// Initialiser au chargement du module
if (typeof window !== 'undefined') {
  initializeVerifications();
  // Nettoyer les codes expirés au chargement
  cleanExpiredCodes();
}



