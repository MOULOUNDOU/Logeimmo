-- Follows (abonnements) + notifications ciblées sur les abonnés

-- Table follows: follower -> followed
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  followed_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (follower_id, followed_id),
  CONSTRAINT follows_no_self_follow CHECK (follower_id <> followed_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_followed_id ON public.follows(followed_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);

-- RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Lecture publique (permet d'afficher les compteurs)
CREATE POLICY "Anyone can read follows"
  ON public.follows FOR SELECT
  USING (true);

-- Un utilisateur peut s'abonner (follow) en son nom
CREATE POLICY "Users can follow"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Un utilisateur peut se désabonner (unfollow) en son nom
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);


-- Remplacer la notification nouvelle annonce: uniquement vers les abonnés du courtier
DROP TRIGGER IF EXISTS on_annonce_created_notify_clients ON public.annonces;
DROP FUNCTION IF EXISTS public.notify_clients_on_new_annonce();

CREATE OR REPLACE FUNCTION public.notify_followers_on_new_annonce()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, sender_id, type, title, body, link)
  SELECT
    f.follower_id,
    NEW.created_by,
    'annonce',
    'Nouvelle annonce de ' || COALESCE(NULLIF(NEW.created_by_nom, ''), 'un courtier'),
    NEW.titre,
    '/annonces/' || NEW.id
  FROM public.follows f
  WHERE f.followed_id = NEW.created_by;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_annonce_created_notify_followers ON public.annonces;
CREATE TRIGGER on_annonce_created_notify_followers
  AFTER INSERT ON public.annonces
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_followers_on_new_annonce();
