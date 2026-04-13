-- ============================================
-- EMAIL CONFIRMATION FIELDS
-- ============================================
-- Agregamos control de confirmación de email en nuestra DB,
-- independiente del sistema nativo de Supabase Auth.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_confirmed         boolean   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_confirmation_token text,
  ADD COLUMN IF NOT EXISTS email_confirmation_sent_at timestamptz;

-- Los usuarios existentes ya pasaron por un flujo sin este control;
-- los marcamos como confirmados para no bloquearlos.
UPDATE public.profiles SET email_confirmed = true;

-- Index para búsqueda rápida por token (el confirm route lo usa).
CREATE INDEX IF NOT EXISTS idx_profiles_confirmation_token
  ON public.profiles (email_confirmation_token)
  WHERE email_confirmation_token IS NOT NULL;

-- ============================================
-- ACTUALIZAR TRIGGER handle_new_user
-- ============================================
-- El trigger ya existía. Lo reemplazamos para que:
--   • Usuarios OAuth (Google, etc.) → email_confirmed = true  (proveedor ya verificó el email)
--   • Usuarios email/password       → email_confirmed = false (deben pasar por nuestro flujo)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, email_confirmed)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    -- Si el proveedor NO es 'email', el email viene verificado por el IdP (ej. Google)
    CASE
      WHEN COALESCE(new.raw_app_meta_data->>'provider', 'email') != 'email' THEN true
      ELSE false
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
