
-- Create prizes table
CREATE TABLE public.prizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🎁',
  category TEXT NOT NULL DEFAULT 'coupons',
  description TEXT,
  target INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_prizes table
CREATE TABLE public.user_prizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prize_id UUID NOT NULL REFERENCES public.prizes(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  claimed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, prize_id)
);

-- RLS on prizes
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active prizes"
  ON public.prizes FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage prizes"
  ON public.prizes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS on user_prizes
ALTER TABLE public.user_prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prize progress"
  ON public.user_prizes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prize progress"
  ON public.user_prizes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prize progress"
  ON public.user_prizes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Admin policies for missions (currently no INSERT/UPDATE/DELETE)
CREATE POLICY "Admins can insert missions"
  ON public.missions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update missions"
  ON public.missions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete missions"
  ON public.missions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view ALL missions (including inactive)
CREATE POLICY "Admins can view all missions"
  ON public.missions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for withdrawal_requests, referral_sales (read all)
CREATE POLICY "Admins can view all withdrawals"
  ON public.withdrawal_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update withdrawals"
  ON public.withdrawal_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all referral sales"
  ON public.referral_sales FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
