-- Agregar constraint UNIQUE en mp_subscription_id para permitir upsert en el webhook
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_mp_subscription_id_key UNIQUE (mp_subscription_id);
