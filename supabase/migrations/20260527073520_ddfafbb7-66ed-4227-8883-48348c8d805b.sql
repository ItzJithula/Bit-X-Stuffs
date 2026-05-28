
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.free_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  cookies TEXT,
  account_email TEXT,
  account_password TEXT,
  instructions TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.free_accounts TO authenticated;
GRANT ALL ON public.free_accounts TO service_role;

ALTER TABLE public.free_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view active free accounts"
ON public.free_accounts FOR SELECT TO authenticated
USING (active OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage free accounts"
ON public.free_accounts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_free_accounts_updated_at
BEFORE UPDATE ON public.free_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.user_roles (user_id, role)
VALUES ('28a4181e-b73c-44e5-ac92-5ac7ede419dc', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
