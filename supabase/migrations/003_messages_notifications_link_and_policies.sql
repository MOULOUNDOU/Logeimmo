-- Link notifications to messages + allow delete/update where needed

-- Add optional message_id on notifications
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS message_id UUID;

DO $$ BEGIN
  ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_message_id_fkey
  FOREIGN KEY (message_id)
  REFERENCES public.messages(id)
  ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_message_id ON public.notifications(message_id);

-- Allow recipients to delete their notifications
CREATE POLICY "Users can delete their notifications"
  ON public.notifications FOR DELETE
  USING (recipient_id = auth.uid());

-- Allow senders to update/delete their own messages (edit / retract)
CREATE POLICY "Users can update their messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can delete their messages"
  ON public.messages FOR DELETE
  USING (sender_id = auth.uid());
