<<<<<<< HEAD
# Senchambre
=======
# SenChambres

Application web pour la recherche et la publication d'annonces de chambres et logements au Sénégal.

## 🎨 Design

L'application utilise un thème **rouge et noir** avec :
- Rouge (#dc2626) comme couleur primaire
- Noir/gris foncé (#1e293b) comme couleur secondaire
- Interface simple, responsive et moderne

## 🔐 Authentification

L'application inclut un système d'authentification complet avec 4 types de comptes :
- **Propriétaire** : Publier ses propres logements
- **Courtier** : Publier des logements pour des clients
- **Locataire** : Recevoir des annonces, sauvegarder des favoris et recherches
- **Admin** : Gérer tous les utilisateurs et annonces

**Inscription** : Création de compte avec choix du rôle
**Connexion** : Accès sécurisé avec email et mot de passe

**Comptes de démonstration** :
- Propriétaire : `proprietaire@example.com` / `123456`
- Courtier : `courtier@example.com` / `123456`
- Locataire : `locataire@example.com` / `123456`
- Admin : `admin@senchambres.com` / `admin123`

**Important** : 
- Vous devez être connecté pour publier une annonce (Propriétaire/Courtier uniquement)
- Les utilisateurs ne peuvent modifier/supprimer que leurs propres annonces
- Les locataires peuvent ajouter des annonces en favoris et sauvegarder leurs recherches

## 🚀 Fonctionnalités

### Côté locataire (recherche/consultation)
- ✅ Liste des annonces avec cartes visuelles
- ✅ Recherche texte (titre, quartier, ville)
- ✅ Filtres : ville, type (chambre/studio/appartement), fourchette de prix
- ✅ Tri : prix croissant/décroissant, plus récent
- ✅ Pagination simple
- ✅ Détail annonce : photos carousel, prix, caution, description, équipements, localisation
- ✅ Contact propriétaire : WhatsApp (wa.me) et appel direct (tel:)
- ✅ Signaler une annonce (formulaire modal)

### Côté propriétaire/courtier (publication/gestion)
- ✅ **Inscription obligatoire** : Créer un compte (Propriétaire ou Courtier)
- ✅ **Dashboard personnalisé** : Statistiques de vos annonces (nombre, prix moyen, vues, etc.)
- ✅ Publier une annonce (formulaire complet avec validation)
- ✅ **Upload de photos** : Télécharger des photos depuis l'appareil (base64 pour MVP) + URLs
- ✅ Mes annonces : affichage uniquement des annonces créées par l'utilisateur connecté
- ✅ Modifier une annonce (uniquement ses propres annonces)
- ✅ Supprimer une annonce (uniquement ses propres annonces)
- ✅ Menu utilisateur : profil, rôle, déconnexion

### Côté locataire (recherche avancée)
- ✅ **Dashboard personnalisé** : Favoris, recherches sauvegardées
- ✅ Ajouter des annonces en favoris
- ✅ Sauvegarder automatiquement les recherches
- ✅ Relancer des recherches sauvegardées
- ✅ Gérer ses favoris et recherches

### Côté admin (gestion globale)
- ✅ **Dashboard admin complet** : Vue d'ensemble de la plateforme
- ✅ Statistiques globales (annonces, utilisateurs, prix moyen, etc.)
- ✅ Répartition par type, ville, rôle
- ✅ Gestion des annonces (voir, supprimer)
- ✅ Gestion des utilisateurs (voir, supprimer)
- ✅ Tableaux de bord détaillés

## 📋 Technologies utilisées

- **React 18** - Bibliothèque UI
- **Vite** - Build tool et dev server
- **React Router DOM 6** - Routing
- **localStorage** - Persistance des données (MVP)
- **CSS3** - Styles responsive (mobile-first)

## 🏗️ Structure du projet

```
senchambres/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Header.jsx       # Header avec menu utilisateur
│   │   ├── Footer.jsx
│   │   ├── ProtectedRoute.jsx  # Route protégée (authentification requise)
│   │   ├── ListingCard.jsx
│   │   ├── Filters.jsx
│   │   ├── PriceTag.jsx
│   │   ├── Gallery.jsx
│   │   └── Modal.jsx
│   ├── pages/               # Pages de l'application
│   │   ├── Home.jsx         # Accueil / Liste annonces
│   │   ├── Details.jsx      # Détail d'une annonce
│   │   ├── Login.jsx        # Connexion
│   │   ├── Register.jsx     # Inscription (Tous rôles)
│   │   ├── Publish.jsx      # Publier/Éditer annonce
│   │   ├── MyListings.jsx   # Mes annonces
│   │   ├── Dashboard.jsx    # Dashboard personnalisé
│   │   └── NotFound.jsx     # Page 404
│   ├── services/            # Services (couche d'abstraction)
│   │   ├── listingService.js  # CRUD + localStorage
│   │   ├── authService.js     # Authentification (localStorage)
│   │   ├── favoritesService.js # Favoris et recherches (locataires)
│   │   ├── userService.js     # Gestion utilisateurs (admin)
│   │   └── adminService.js    # Fonctionnalités admin
│   ├── utils/               # Utilitaires
│   │   └── imageUtils.js    # Gestion des images (upload, compression)
│   ├── data/                # Données seed
│   │   └── seedListings.js  # 10 annonces fictives
│   ├── App.jsx              # Composant racine + routing
│   ├── main.jsx             # Point d'entrée
│   └── styles.css           # Styles globaux
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Installation et lancement

### Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install
```

### Lancer l'application en développement

```bash
npm run dev
```

L'application sera accessible à l'adresse `http://localhost:5173` (ou un autre port si 5173 est occupé).

### Build pour production

```bash
npm run build
```

Les fichiers compilés seront dans le dossier `dist/`.

### Prévisualiser le build de production

```bash
npm run preview
```

## 📱 Pages et routes

| Route | Description | Authentification |
|-------|-------------|------------------|
| `/` | Accueil - Liste des annonces avec filtres et tri | Publique |
| `/listing/:id` | Détail d'une annonce | Publique |
| `/login` | Connexion | Publique |
| `/register` | Inscription (Propriétaire/Courtier) | Publique |
| `/publish` | Publier une nouvelle annonce | **Requise** (Propriétaire/Courtier) |
| `/publish?edit=:id` | Modifier une annonce | **Requise** (propriétaire uniquement) |
| `/my-listings` | Mes annonces | **Requise** (Propriétaire/Courtier) |
| `/dashboard` | Dashboard personnalisé | **Requise** (Tous rôles) |
| `*` | Page 404 | Publique |

## 💾 Gestion des données

### MVP - localStorage

Le MVP utilise `localStorage` pour persister les données :
- **Clé** : `senchambres_listings` pour les annonces (avec `userId`)
- **Clé** : `senchambres_reports` pour les signalements
- **Clé** : `senchambres_auth` pour la session utilisateur
- **Clé** : `senchambres_users` pour les comptes utilisateurs
- **Seed data** : Initialisation automatique avec 10 annonces fictives au premier chargement

**Important** : Les annonces sont associées à un `userId`. Les annonces seed ont `userId: null` (publiques). Les annonces créées par les utilisateurs sont associées à leur ID.

### Service layer

Le service `listingService.js` expose une API simple :
- `getAllListings()` - Récupérer toutes les annonces
- `getListingById(id)` - Récupérer une annonce par ID
- `createListing(data)` - Créer une annonce
- `updateListing(id, data)` - Mettre à jour une annonce
- `deleteListing(id)` - Supprimer une annonce
- `reportListing(listingId, reason, message)` - Signaler une annonce

Cette architecture permet de remplacer facilement localStorage par un backend.

## 🔌 Intégrer un backend (Firebase/Express)

### Option 1 : Firebase (Firestore)

1. Installer Firebase :
```bash
npm install firebase
```

2. Créer un fichier `src/config/firebase.js` :
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Votre configuration Firebase
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

3. Modifier `listingService.js` :
```javascript
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

export const getAllListings = async () => {
  const snapshot = await getDocs(collection(db, 'listings'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getListingById = async (id) => {
  const docRef = doc(db, 'listings', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createListing = async (listingData) => {
  const docRef = await addDoc(collection(db, 'listings'), listingData);
  return { id: docRef.id, ...listingData };
};

export const updateListing = async (id, listingData) => {
  const docRef = doc(db, 'listings', id);
  await updateDoc(docRef, listingData);
  return { id, ...listingData };
};

export const deleteListing = async (id) => {
  await deleteDoc(doc(db, 'listings', id));
  return true;
};
```

### Option 2 : API REST (Express/Node.js)

1. Modifier `listingService.js` :
```javascript
const API_URL = 'http://localhost:3000/api';

export const getAllListings = async () => {
  const response = await fetch(`${API_URL}/listings`);
  return response.json();
};

export const getListingById = async (id) => {
  const response = await fetch(`${API_URL}/listings/${id}`);
  return response.json();
};

export const createListing = async (listingData) => {
  const response = await fetch(`${API_URL}/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listingData)
  });
  return response.json();
};

export const updateListing = async (id, listingData) => {
  const response = await fetch(`${API_URL}/listings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listingData)
  });
  return response.json();
};

export const deleteListing = async (id) => {
  const response = await fetch(`${API_URL}/listings/${id}`, {
    method: 'DELETE'
  });
  return response.ok;
};
```

2. Adapter les composants pour gérer l'asynchrone :
```javascript
// Dans Home.jsx par exemple
const [listings, setListings] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  getAllListings().then(data => {
    setListings(data);
    setLoading(false);
  });
}, []);
```

## 🎨 Personnalisation

### Variables CSS

Modifiez les variables CSS dans `src/styles.css` pour personnaliser les couleurs :

```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --danger-color: #dc2626;
  /* ... */
}
```

## 📝 Format des données

### Structure d'une annonce

```javascript
{
  id: string,              // ID unique
  title: string,           // Titre de l'annonce
  city: string,            // Ville (ex: "Dakar")
  district: string,        // Quartier (ex: "Yoff")
  type: string,            // "chambre" | "studio" | "appartement"
  price: number,           // Prix mensuel en FCFA
  deposit: number | null,  // Caution en FCFA (optionnel)
  description: string,     // Description détaillée
  amenities: string[],     // Liste des équipements
  photos: string[],        // URLs des photos
  phone: string,           // Numéro de téléphone
  whatsapp: string,        // Numéro WhatsApp
  createdAt: string        // Date de création (ISO string)
}
```

## ✅ Validation du formulaire

Le formulaire de publication valide :
- ✅ Champs requis (titre, ville, quartier, prix, description, téléphone, WhatsApp)
- ✅ Prix numérique et positif
- ✅ Téléphone avec au moins 8 chiffres
- ✅ URLs de photos valides

## 🌍 Accessibilité

- Labels explicites pour tous les champs de formulaire
- Boutons avec aria-label où nécessaire
- Navigation au clavier
- Contraste suffisant des couleurs

## 📱 Responsive

L'application est responsive et suit une approche mobile-first :
- **Mobile** : < 768px (une colonne)
- **Tablet** : 768px - 1024px (adaptation des grilles)
- **Desktop** : > 1024px (layout complet)

## 🔒 Notes de sécurité (pour production)

- ✅ Validation côté client (ajouter validation côté serveur)
- ✅ Sanitisation des entrées utilisateur
- ✅ Authentification des utilisateurs
- ✅ Autorisation (qui peut modifier/supprimer)
- ✅ Protection CSRF
- ✅ Rate limiting pour les formulaires

## 🐛 Dépannage

### Les données ne persistent pas

Vérifiez que le localStorage n'est pas bloqué par votre navigateur en mode privé.

### Erreur "Cannot find module"

Exécutez `npm install` pour installer toutes les dépendances.

### Port déjà utilisé

Vite utilisera automatiquement un autre port. Consultez le terminal pour voir le nouveau port.

## 📄 Licence

MIT

## 👤 Auteur

SenChambres - MVP pour annonces de logements au Sénégal

>>>>>>> 5c61581 (first version)
