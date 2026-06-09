-- Migration 004: Persist customer carts for admin visibility

CREATE TABLE IF NOT EXISTS public.customer_carts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.customer_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access on customer_carts"
  ON public.customer_carts
  FOR ALL
  USING (true)
  WITH CHECK (true);
