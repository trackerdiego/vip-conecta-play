CREATE POLICY "Drivers can accept pending deliveries"
ON public.deliveries
FOR UPDATE TO authenticated
USING (status = 'pending')
WITH CHECK (true);