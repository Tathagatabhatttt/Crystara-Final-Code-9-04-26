-- Migration 002: Create orders table
-- Stores order records after successful Razorpay payments

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  items JSONB NOT NULL,
  shipping_address JSONB,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow the service role full access
CREATE POLICY "Service role has full access on orders" 
  ON public.orders
  FOR ALL
  USING (true)
  WITH CHECK (true);
