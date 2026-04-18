-- Tabla para idempotencia de webhooks de MercadoPago.
-- Cada evento se registra con su ID único de MP; si ya existe se descarta.
create table public.webhook_events (
  id            uuid        default uuid_generate_v4() primary key,
  mp_event_id   text        not null,
  event_type    text        not null,
  processed_at  timestamptz default now(),
  constraint webhook_events_mp_event_id_key unique (mp_event_id)
);

-- Solo el service role puede escribir en esta tabla (los webhooks usan adminClient)
alter table public.webhook_events enable row level security;
