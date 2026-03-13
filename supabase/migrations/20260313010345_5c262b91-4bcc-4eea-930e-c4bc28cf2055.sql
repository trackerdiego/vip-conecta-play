
CREATE TABLE public.traccar_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  traccar_device_id integer NOT NULL,
  unique_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.traccar_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own traccar device"
  ON public.traccar_devices FOR SELECT TO authenticated
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can insert own traccar device"
  ON public.traccar_devices FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Admins can view all traccar devices"
  ON public.traccar_devices FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
