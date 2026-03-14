CREATE OR REPLACE FUNCTION public.credit_driver_delivery(_delivery_id uuid, _driver_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _fare NUMERIC;
  _wallet_id UUID;
BEGIN
  SELECT fare INTO _fare
  FROM public.deliveries
  WHERE id = _delivery_id
    AND driver_id = _driver_id
    AND status IN ('accepted', 'picked_up')
  FOR UPDATE;

  IF _fare IS NULL THEN
    RAISE EXCEPTION 'Delivery not found, not assigned to this driver, or already completed';
  END IF;

  UPDATE public.deliveries
  SET status = 'delivered', delivered_at = now()
  WHERE id = _delivery_id;

  SELECT id INTO _wallet_id
  FROM public.wallets WHERE user_id = _driver_id;

  IF _wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for driver';
  END IF;

  UPDATE public.wallets
  SET balance = balance + _fare, total_earned = total_earned + _fare, updated_at = now()
  WHERE id = _wallet_id;

  INSERT INTO public.transactions (wallet_id, type, amount, description, order_reference, status)
  VALUES (_wallet_id, 'delivery_earning', _fare, 'Ganho de entrega', _delivery_id::text, 'completed');

  RETURN _fare;
END;
$function$;