-- Add cover photo to profiles

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cover_photo TEXT;
