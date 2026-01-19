-- Notifications automatiques
-- - Nouvelle annonce -> notifier tous les clients
-- - Nouveau profil -> notifier tous les admins

-- Nouvelle annonce: notifier les clients
CREATE OR REPLACE FUNCTION public.notify_clients_on_new_annonce()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, sender_id, type, title, body, link)
  SELECT
    p.id,
    NEW.created_by,
    'annonce',
    'Nouvelle annonce',
    NEW.titre,
    '/annonces/' || NEW.id
  FROM public.profiles p
  WHERE p.role = 'client';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_annonce_created_notify_clients ON public.annonces;
CREATE TRIGGER on_annonce_created_notify_clients
  AFTER INSERT ON public.annonces
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_clients_on_new_annonce();

-- Nouveau profil: notifier les admins
CREATE OR REPLACE FUNCTION public.notify_admins_on_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, sender_id, type, title, body, link)
  SELECT
    p.id,
    NEW.id,
    'new_user',
    'Nouveau utilisateur',
    COALESCE(NULLIF(NEW.nom, ''), 'Utilisateur') || ' (' || NEW.email || ')',
    '/admin'
  FROM public.profiles p
  WHERE p.role = 'admin';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_notify_admins ON public.profiles;
CREATE TRIGGER on_profile_created_notify_admins
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_on_new_profile();
