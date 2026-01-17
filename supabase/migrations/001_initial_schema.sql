-- Migration initiale pour Digicode Immo
-- Tables pour les utilisateurs, annonces, avis, et likes

-- Table des utilisateurs (complémente Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telephone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'courtier', 'admin')),
  photo_profil TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Créer automatiquement un profil lors de la création d'un user Supabase Auth
-- (indispensable si la confirmation email est activée: pas de session côté client au signUp)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, email, telephone, role, photo_profil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'telephone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Table des annonces
CREATE TABLE IF NOT EXISTS public.annonces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('chambre', 'studio', 'appartement', 'maison')),
  description TEXT NOT NULL,
  prix DECIMAL(10, 2) NOT NULL,
  superficie DECIMAL(10, 2) NOT NULL,
  adresse TEXT NOT NULL,
  ville TEXT NOT NULL,
  quartier TEXT NOT NULL,
  chambres INTEGER DEFAULT 1,
  salles_de_bain INTEGER DEFAULT 1,
  meuble BOOLEAN DEFAULT false,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  photos TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_by_nom TEXT NOT NULL,
  created_by_photo TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des avis
CREATE TABLE IF NOT EXISTS public.avis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_nom TEXT NOT NULL,
  user_photo TEXT,
  annonce_id UUID REFERENCES public.annonces(id) ON DELETE CASCADE NOT NULL,
  courtier_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, annonce_id)
);

-- Table des likes
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  annonce_id UUID REFERENCES public.annonces(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, annonce_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_annonces_created_by ON public.annonces(created_by);
CREATE INDEX IF NOT EXISTS idx_annonces_status ON public.annonces(status);
CREATE INDEX IF NOT EXISTS idx_annonces_ville ON public.annonces(ville);
CREATE INDEX IF NOT EXISTS idx_annonces_type ON public.annonces(type);
CREATE INDEX IF NOT EXISTS idx_avis_annonce_id ON public.avis(annonce_id);
CREATE INDEX IF NOT EXISTS idx_avis_courtier_id ON public.avis(courtier_id);
CREATE INDEX IF NOT EXISTS idx_likes_annonce_id ON public.likes(annonce_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annonces_updated_at BEFORE UPDATE ON public.annonces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Les utilisateurs peuvent voir tous les profils"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Les utilisateurs peuvent créer leur propre profil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies pour annonces
CREATE POLICY "Tout le monde peut voir les annonces actives"
  ON public.annonces FOR SELECT
  USING (status = 'active' OR created_by = auth.uid());

CREATE POLICY "Les courtiers et admins peuvent créer des annonces"
  ON public.annonces FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('courtier', 'admin')
    )
  );

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres annonces"
  ON public.annonces FOR UPDATE
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres annonces"
  ON public.annonces FOR DELETE
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Policies pour avis
CREATE POLICY "Tout le monde peut voir les avis"
  ON public.avis FOR SELECT
  USING (true);

CREATE POLICY "Les clients peuvent créer des avis"
  ON public.avis FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'client'
    )
  );

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres avis"
  ON public.avis FOR DELETE
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Policies pour likes
CREATE POLICY "Tout le monde peut voir les likes"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent créer des likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres likes"
  ON public.likes FOR DELETE
  USING (user_id = auth.uid());
