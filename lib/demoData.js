// Données de démonstration pour les annonces

const STORAGE_KEY_ANNONCES = 'digicode_immo_annonces';

// Créer des annonces de démo
export const createDemoAnnonces = () => {
  if (typeof window === 'undefined') return;
  
  // Vider le localStorage des annonces existantes
  localStorage.removeItem(STORAGE_KEY_ANNONCES);

  const demoAnnonces = [
    {
      id: 'demo1',
      titre: 'Chambre meublée à Yoff, près de la plage',
      type: 'chambre',
      description: 'Chambre spacieuse et lumineuse dans une résidence calme. Meublée avec lit double, armoire, bureau et climatisation. Proche de la plage de Yoff, des transports en commun et des commerces. Accès internet Wi-Fi. Locataire respectueux recherché.',
      prix: 45000,
      superficie: 18,
      adresse: 'Rue de Yoff, près de la plage',
      ville: 'Dakar',
      quartier: 'Yoff',
      chambres: 1,
      sallesDeBain: 1,
      meuble: true,
      latitude: 14.7821,
      longitude: -17.4916,
      photos: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
      ],
      createdBy: '2', // ID du courtier par défaut
      createdByNom: 'Mamadou Diallo',
      createdByPhoto: null,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 5 jours
      status: 'active'
    },
    {
      id: 'demo2',
      titre: 'Studio indépendant moderne à Almadies',
      type: 'studio',
      description: 'Studio moderne et indépendant, idéal pour étudiant ou jeune actif. Cuisine équipée (réfrigérateur, plaques de cuisson), salle de bain privée, terrasse avec vue. Climatisation, Wi-Fi inclus. Proche des restaurants, écoles et transports.',
      prix: 75000,
      superficie: 30,
      adresse: 'Avenue des Almadies, immeuble moderne',
      ville: 'Dakar',
      quartier: 'Almadies',
      chambres: 1,
      sallesDeBain: 1,
      meuble: true,
      latitude: 14.7464,
      longitude: -17.5053,
      photos: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
      ],
      createdBy: '2',
      createdByNom: 'Mamadou Diallo',
      createdByPhoto: null,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: 'demo3',
      titre: 'Appartement F2 à Mermoz, quartier calme',
      type: 'appartement',
      description: 'Appartement F2 lumineux dans un immeuble sécurisé. Comprend un salon, une chambre, une cuisine équipée et une salle de bain. Climatisation dans toutes les pièces. Balcon avec vue. Gardiennage 24/7. Proche des écoles, hôpitaux et commerces.',
      prix: 120000,
      superficie: 65,
      adresse: 'Boulevard Général de Gaulle, Mermoz',
      ville: 'Dakar',
      quartier: 'Mermoz',
      chambres: 2,
      sallesDeBain: 1,
      meuble: false,
      latitude: 14.6934,
      longitude: -17.4484,
      photos: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&h=600&fit=crop'
      ],
      createdBy: '2',
      createdByNom: 'Mamadou Diallo',
      createdByPhoto: null,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: 'demo4',
      titre: 'Chambre simple à Plateau, centre-ville',
      type: 'chambre',
      description: 'Chambre simple et cosy dans une maison familiale au cœur du Plateau. Idéale pour étudiant ou jeune professionnel. Partie cuisine commune, salle de bain partagée. Proche de toutes les commodités, universités et administrations.',
      prix: 35000,
      superficie: 15,
      adresse: 'Rue du Plateau, centre-ville',
      ville: 'Dakar',
      quartier: 'Plateau',
      chambres: 1,
      sallesDeBain: 1,
      meuble: true,
      latitude: 14.6937,
      longitude: -17.4441,
      photos: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
      ],
      createdBy: '2',
      createdByNom: 'Mamadou Diallo',
      createdByPhoto: null,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: 'demo5',
      titre: 'Villa F3 à Ouakam, vue sur mer',
      type: 'maison',
      description: 'Belle villa F3 avec vue imprenable sur l\'océan. Grand salon, 2 chambres, cuisine équipée, 2 salles de bain. Terrasse et jardin. Climatisation, eau chaude, électricité. Quartier calme et résidentiel. Parfait pour famille.',
      prix: 250000,
      superficie: 120,
      adresse: 'Avenue de la Corniche, Ouakam',
      ville: 'Dakar',
      quartier: 'Ouakam',
      chambres: 3,
      sallesDeBain: 2,
      meuble: false,
      latitude: 14.7250,
      longitude: -17.5033,
      photos: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&h=600&fit=crop'
      ],
      createdBy: '2',
      createdByNom: 'Mamadou Diallo',
      createdByPhoto: null,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: 'demo6',
      titre: 'Studio meublé à Sacré-Cœur',
      type: 'studio',
      description: 'Studio meublé et fonctionnel dans un quartier calme. Tout équipé pour vivre confortablement : lit, armoire, table, cuisine équipée, salle de bain. Climatisation et Wi-Fi. Proche des universités et des transports.',
      prix: 55000,
      superficie: 25,
      adresse: 'Sacré-Cœur 3, villa',
      ville: 'Dakar',
      quartier: 'Sacré-Cœur',
      chambres: 1,
      sallesDeBain: 1,
      meuble: true,
      latitude: 14.6958,
      longitude: -17.4569,
      photos: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
      ],
      createdBy: '2',
      createdByNom: 'Mamadou Diallo',
      createdByPhoto: null,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    }
  ];

  localStorage.setItem(STORAGE_KEY_ANNONCES, JSON.stringify(demoAnnonces));
  return demoAnnonces;
};

