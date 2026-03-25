CREATE TABLE public.saved_outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'إطلالتي',
  pieces jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_image text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own outfits"
  ON public.saved_outfits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfits"
  ON public.saved_outfits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfits"
  ON public.saved_outfits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);