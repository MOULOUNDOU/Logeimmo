// Données seed initiales - 10 annonces réalistes au Sénégal
export const seedListings = [
  {
    id: '1',
    title: 'Chambre meublée à Yoff',
    city: 'Dakar',
    district: 'Yoff',
    type: 'chambre',
    price: 45000,
    deposit: 90000,
    description: 'Chambre spacieuse et lumineuse dans une maison calme. Meublée avec lit, armoire, bureau. Proche de la plage et des transports.',
    amenities: ['wifi', 'climatisation', 'eau courante', 'électricité'],
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
    ],
    phone: '+221771234567',
    whatsapp: '+221771234567',
    latitude: 14.7821,
    longitude: -17.4916,
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: '2',
    title: 'Studio indépendant à Almadies',
    city: 'Dakar',
    district: 'Almadies',
    type: 'studio',
    price: 75000,
    deposit: 150000,
    description: 'Studio moderne et indépendant, idéal pour étudiant ou jeune actif. Cuisine équipée, salle de bain privée, terrasse.',
    amenities: ['wifi', 'climatisation', 'cuisine équipée', 'eau courante', 'électricité', 'terrasse'],
    photos: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    phone: '+221775678901',
    whatsapp: '+221775678901',
    latitude: 14.7464,
    longitude: -17.5053,
    createdAt: new Date('2024-01-20').toISOString()
  },
  {
    id: '3',
    title: 'Appartement F2 à Mermoz',
    city: 'Dakar',
    district: 'Mermoz',
    type: 'appartement',
    price: 120000,
    deposit: 240000,
    description: 'Appartement 2 pièces bien aménagé, salon, chambre, cuisine et salle de bain. Au 2ème étage avec ascenseur. Sécurisé.',
    amenities: ['wifi', 'climatisation', 'cuisine équipée', 'eau courante', 'électricité', 'gardien', 'ascenseur'],
    photos: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1560448075-cbc16bb4af80?w=800'
    ],
    phone: '+221772345678',
    whatsapp: '+221772345678',
    latitude: 14.7056,
    longitude: -17.4563,
    createdAt: new Date('2024-01-18').toISOString()
  },
  {
    id: '4',
    title: 'Chambre chez l\'habitant à Thiès Centre',
    city: 'Thiès',
    district: 'Thiès Centre',
    type: 'chambre',
    price: 30000,
    deposit: 60000,
    description: 'Chambre dans maison familiale, calme et sécurisée. Accès cuisine et salle de bain partagés. Idéal pour étudiant.',
    amenities: ['wifi', 'eau courante', 'électricité', 'cuisine partagée'],
    photos: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'
    ],
    phone: '+221776789012',
    whatsapp: '+221776789012',
    latitude: 14.7886,
    longitude: -16.9261,
    createdAt: new Date('2024-01-22').toISOString()
  },
  {
    id: '5',
    title: 'Studio cosy à Saint-Louis',
    city: 'Saint-Louis',
    district: 'Ndar',
    type: 'studio',
    price: 50000,
    deposit: 100000,
    description: 'Studio récent dans le centre historique de Saint-Louis. Vue sur la mer, proche de tous les services.',
    amenities: ['wifi', 'climatisation', 'eau courante', 'électricité', 'vue mer'],
    photos: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800'
    ],
    phone: '+221773456789',
    whatsapp: '+221773456789',
    latitude: 16.0179,
    longitude: -16.4896,
    createdAt: new Date('2024-01-25').toISOString()
  },
  {
    id: '6',
    title: 'Chambre avec balcon à Ouakam',
    city: 'Dakar',
    district: 'Ouakam',
    type: 'chambre',
    price: 55000,
    deposit: 110000,
    description: 'Chambre avec balcon vue mer, dans résidence sécurisée. Proche plage de Ouakam et universités.',
    amenities: ['wifi', 'climatisation', 'eau courante', 'électricité', 'balcon', 'vue mer', 'gardien'],
    photos: [
      'https://images.unsplash.com/photo-1556912173-54e9d8e457e4?w=800'
    ],
    phone: '+221774567890',
    whatsapp: '+221774567890',
    latitude: 14.7167,
    longitude: -17.4677,
    createdAt: new Date('2024-01-12').toISOString()
  },
  {
    id: '7',
    title: 'Appartement T2 à Ziguinchor',
    city: 'Ziguinchor',
    district: 'Centre-ville',
    type: 'appartement',
    price: 80000,
    deposit: 160000,
    description: 'Appartement spacieux 2 pièces, parfait pour couple ou famille. Quartier calme, tous commerces à proximité.',
    amenities: ['wifi', 'climatisation', 'cuisine équipée', 'eau courante', 'électricité', 'parking'],
    photos: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
      'https://images.unsplash.com/photo-1560448204-61dc36dc3d93?w=800'
    ],
    phone: '+221775678901',
    whatsapp: '+221775678901',
    latitude: 12.5831,
    longitude: -16.2719,
    createdAt: new Date('2024-01-28').toISOString()
  },
  {
    id: '8',
    title: 'Studio étudiant à Grand-Yoff',
    city: 'Dakar',
    district: 'Grand-Yoff',
    type: 'studio',
    price: 40000,
    deposit: 80000,
    description: 'Studio économique pour étudiant, proche UCAD et transports. Simple mais fonctionnel.',
    amenities: ['wifi', 'eau courante', 'électricité'],
    photos: [
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800'
    ],
    phone: '+221776789012',
    whatsapp: '+221776789012',
    latitude: 14.7489,
    longitude: -17.4419,
    createdAt: new Date('2024-01-30').toISOString()
  },
  {
    id: '9',
    title: 'Chambre meublée à Point E',
    city: 'Dakar',
    district: 'Point E',
    type: 'chambre',
    price: 60000,
    deposit: 120000,
    description: 'Chambre dans appartement partagé, colocation sympa. Salon commun, cuisine équipée, wifi inclus.',
    amenities: ['wifi', 'climatisation', 'eau courante', 'électricité', 'cuisine équipée', 'salon'],
    photos: [
      'https://images.unsplash.com/photo-1560448075-cbc16bb4af80?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    ],
    phone: '+221777890123',
    whatsapp: '+221777890123',
    latitude: 14.7061,
    longitude: -17.4550,
    createdAt: new Date('2024-01-10').toISOString()
  },
  {
    id: '10',
    title: 'Studio neuf à Liberté 6',
    city: 'Dakar',
    district: 'Liberté 6',
    type: 'studio',
    price: 65000,
    deposit: 130000,
    description: 'Studio neuf, rénové récemment. Climatisation, eau chaude, wifi fibre. Quartier résidentiel calme.',
    amenities: ['wifi', 'climatisation', 'eau courante', 'eau chaude', 'électricité', 'neuf'],
    photos: [
      'https://images.unsplash.com/photo-1560449752-1d3b62fdd7a9?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
    ],
    phone: '+221778901234',
    whatsapp: '+221778901234',
    latitude: 14.7225,
    longitude: -17.4622,
    createdAt: new Date('2024-02-01').toISOString()
  }
];

