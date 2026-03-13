
-- Table to track each sale attributed to an influencer
CREATE TABLE public.referral_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.profiles(id),
  referral_code TEXT NOT NULL,
  external_order_id TEXT NOT NULL,
  order_total NUMERIC NOT NULL DEFAULT 0,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  commission_rate NUMERIC NOT NULL DEFAULT 0.10,
  credited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint to avoid double-crediting same order
CREATE UNIQUE INDEX idx_referral_sales_order ON public.referral_sales(external_order_id);

-- RLS
ALTER TABLE public.referral_sales ENABLE ROW LEVEL SECURITY;

-- Influencers can view their own sales
CREATE POLICY "Users can view own referral sales"
  ON public.referral_sales FOR SELECT TO authenticated
  USING (influencer_id = auth.uid());

-- Enable realtime for instant notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_sales;

-- Function to credit commission to influencer wallet (called from edge function)
CREATE OR REPLACE FUNCTION public.credit_referral_commission(
  _influencer_id UUID,
  _referral_code TEXT,
  _external_order_id TEXT,
  _order_total NUMERIC,
  _commission_rate NUMERIC DEFAULT 0.10
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _commission NUMERIC;
  _sale_id UUID;
  _wallet_id UUID;
BEGIN
  _commission := _order_total * _commission_rate;

  -- Insert referral sale (skip if duplicate)
  INSERT INTO public.referral_sales (influencer_id, referral_code, external_order_id, order_total, commission_amount, commission_rate, credited)
  VALUES (_influencer_id, _referral_code, _external_order_id, _order_total, _commission, _commission_rate, true)
  ON CONFLICT (external_order_id) DO NOTHING
  RETURNING id INTO _sale_id;

  -- If already existed, skip
  IF _sale_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get wallet
  SELECT id INTO _wallet_id FROM public.wallets WHERE user_id = _influencer_id;

  -- Credit wallet
  UPDATE public.wallets
  SET balance = balance + _commission,
      total_earned = total_earned + _commission,
      updated_at = now()
  WHERE id = _wallet_id;

  -- Record transaction
  INSERT INTO public.transactions (wallet_id, type, amount, description, order_reference, status)
  VALUES (_wallet_id, 'commission', _commission, 'Comissão de venda via link', _external_order_id, 'completed');

  RETURN _sale_id;
END;
$$;
