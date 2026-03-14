-- Fix addresses for existing deliveries using stored order data
UPDATE public.deliveries SET delivery_address = 
  COALESCE(
    NULLIF(
      CONCAT_WS(' - ',
        NULLIF(CONCAT_WS(', ', 
          NULLIF(multipedidos_order_data->>'address', ''),
          NULLIF(multipedidos_order_data->>'street_number', '')
        ), ''),
        NULLIF(multipedidos_order_data->>'complemento', ''),
        NULLIF(multipedidos_order_data->>'bairro', ''),
        NULLIF(multipedidos_order_data->>'city', '')
      ), ''
    ),
    'Endereço não informado'
  )
WHERE delivery_address = ',  - , ';

-- Delete remaining duplicates
DELETE FROM public.deliveries a
USING public.deliveries b
WHERE a.external_order_id = b.external_order_id
  AND a.id <> b.id
  AND a.created_at > b.created_at;