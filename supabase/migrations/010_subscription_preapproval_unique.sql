-- Garantizar que un mp_preapproval_id no pueda estar vinculado a más de un usuario.
-- Previene que un webhook con external_reference manipulado active suscripciones cruzadas.
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_mp_preapproval_id_key UNIQUE (mp_preapproval_id);
