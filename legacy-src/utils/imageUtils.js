// Utilitaires pour la gestion des images
// Conversion en base64 pour localStorage (MVP)
// Plus tard, on pourra uploader vers un backend

/**
 * Convertit un fichier image en base64
 * @param {File} file - Fichier image
 * @returns {Promise<string>} - URL base64 de l'image
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Aucun fichier fourni'));
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier doit être une image'));
      return;
    }

    // Vérifier la taille (max 5MB pour localStorage)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      reject(new Error('L\'image est trop volumineuse (max 5MB)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Valide une image
 * @param {File} file - Fichier image
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateImage = (file) => {
  if (!file) {
    return { valid: false, error: 'Aucun fichier sélectionné' };
  }

  // Vérifier le type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Format non supporté (JPEG, PNG, WebP uniquement)' };
  }

  // Vérifier la taille (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'Image trop volumineuse (max 5MB)' };
  }

  return { valid: true };
};

/**
 * Compresse une image (réduction simple de qualité)
 * @param {string} base64 - Image en base64
 * @param {number} quality - Qualité (0.1 à 1.0)
 * @param {number} maxWidth - Largeur maximale
 * @returns {Promise<string>} - Image compressée en base64
 */
export const compressImage = (base64, quality = 0.8, maxWidth = 1200) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Redimensionner si nécessaire
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
    img.src = base64;
  });
};






