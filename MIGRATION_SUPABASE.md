# Guide de Migration vers Supabase

Ce guide explique comment migrer votre application Digicode Immo de localStorage vers Supabase.

## 📋 Prérequis

1. Créer un compte Supabase : https://supabase.com
2. Créer un nouveau projet Supabase
3. Récupérer vos clés d'API depuis le dashboard Supabase

## 🔧 Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec vos clés Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

**Où trouver ces valeurs :**
- Allez sur https://app.supabase.com
- Sélectionnez votre projet
- Allez dans **Settings** > **API**
- Copiez :
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Créer la base de données

1. Dans le dashboard Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Copiez le contenu du fichier `supabase/migrations/001_initial_schema.sql`
4. Exécutez la requête

Cette migration créera :
- Table `profiles` (profils utilisateurs)
- Table `annonces` (annonces immobilières)
- Table `avis` (avis sur les annonces)
- Table `likes` (likes sur les annonces)
- Index pour les performances
- Row Level Security (RLS) policies

## 📦 Installation

Les dépendances sont déjà installées :
```bash
npm install
```

## 🔄 Migration des données

### Étape 1 : Migrer les utilisateurs

Les utilisateurs seront migrés automatiquement lors de leur première connexion avec Supabase Auth.

**Comptes de test à créer :**
1. Allez dans **Authentication** > **Users** dans Supabase
2. Créez manuellement les utilisateurs de test, ou
3. Utilisez l'interface d'inscription de l'application

### Étape 2 : Migrer les annonces de démo

Les annonces de démo sont déjà incluses dans le code et seront créées automatiquement.

### Étape 3 : Migrer les données existantes (optionnel)

Si vous avez des données existantes dans localStorage que vous voulez migrer, vous pouvez utiliser le script de migration (à créer).

## 🚀 Utilisation

### Services disponibles

Tous les services sont dans le dossier `lib/supabase/` :

- **`lib/supabase.js`** : Client Supabase
- **`lib/supabase/auth.js`** : Authentification
- **`lib/supabase/annonces.js`** : Gestion des annonces
- **`lib/supabase/avis.js`** : Gestion des avis
- **`lib/supabase/likes.js`** : Gestion des likes

### Exemple d'utilisation

```javascript
// Authentification
import { login, register, logout, getCurrentUser } from '@/lib/supabase/auth'

// Annonces
import { getAnnonces, createAnnonce, updateAnnonce, deleteAnnonce } from '@/lib/supabase/annonces'

// Avis
import { getAnnonceAvis, addAvis } from '@/lib/supabase/avis'

// Likes
import { toggleLike, getLikeCount } from '@/lib/supabase/likes'
```

## ⚠️ Notes importantes

1. **Row Level Security (RLS)** : Toutes les tables ont RLS activé. Les policies sont définies dans la migration SQL.

2. **Authentification** : Supabase Auth gère automatiquement les sessions. Plus besoin de gérer localStorage manuellement.

3. **Stockage des fichiers** : Les photos peuvent être stockées dans Supabase Storage (non implémenté dans cette migration de base).

4. **Ancien code** : Les anciens fichiers dans `lib/auth.js` sont toujours présents pour compatibilité. Vous pouvez les supprimer une fois la migration complète.

## 🐛 Dépannage

### Erreur "Missing Supabase environment variables"
- Vérifiez que le fichier `.env.local` existe
- Vérifiez que les variables sont correctement nommées
- Redémarrez le serveur de développement

### Erreur de permissions
- Vérifiez que les RLS policies sont bien créées
- Vérifiez que l'utilisateur est bien connecté
- Vérifiez les logs dans le dashboard Supabase

### Les données ne s'affichent pas
- Vérifiez les logs de la console navigateur
- Vérifiez les logs dans le dashboard Supabase > Logs
- Vérifiez que les tables sont bien créées dans Database > Tables

## 📚 Documentation Supabase

- Documentation : https://supabase.com/docs
- JavaScript Client : https://supabase.com/docs/reference/javascript
- Auth : https://supabase.com/docs/guides/auth
- Database : https://supabase.com/docs/guides/database
