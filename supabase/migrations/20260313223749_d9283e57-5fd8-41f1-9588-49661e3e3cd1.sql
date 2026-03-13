
CREATE TABLE public.commission_rates (
  level INTEGER PRIMARY KEY,
  rate NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view commission rates"
ON public.commission_rates FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage commission rates"
ON public.commission_rates FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.commission_rates (level, rate) VALUES
  (1, 0.01),
  (2, 0.02),
  (3, 0.035),
  (4, 0.05);
