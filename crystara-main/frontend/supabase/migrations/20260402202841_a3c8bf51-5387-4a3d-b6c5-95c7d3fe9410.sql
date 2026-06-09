ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_tracking_id text UNIQUE;

CREATE OR REPLACE FUNCTION public.generate_order_tracking_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  tracking_id text;
BEGIN
  tracking_id := 'CRY-' || TO_CHAR(NOW(), 'YYMM') || '-' || LPAD(FLOOR(RANDOM() * 999999 + 1)::text, 6, '0');
  NEW.order_tracking_id := tracking_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_tracking_id
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_tracking_id();