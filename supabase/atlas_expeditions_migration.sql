-- ============================================================
-- Apex / Animaldex — Migrazione "Atlante + Spedizioni a ondate"
-- Da eseguire nel SQL Editor di Supabase.
--
-- Contenuto:
--   1. user_animals.documented_at  → layer parallelo "Documentato" (Atlante).
--      NON è un nuovo valore di unlock_status: la piramide
--      locked/unlocked/seen/collected resta intatta.
--   2. Indice per le letture del layer documentato.
--   3. (Nota) Lo stato Spedizioni/ondate e i contatori AI vivono per ora
--      lato client (localStorage). Quando si vorrà la sincronizzazione
--      cross-device, decommentare la sezione 3.
-- ============================================================

-- 1) Layer Documentato -----------------------------------------------------
alter table public.user_animals
  add column if not exists documented_at timestamptz;

comment on column public.user_animals.documented_at is
  'Specie documentata nell''Atlante (asse Naturalista). Parallelo a unlock_status, non lo sostituisce.';

-- 2) Indice per fetch del layer documentato --------------------------------
create index if not exists user_animals_documented_idx
  on public.user_animals (user_id)
  where documented_at is not null;

-- 3) (Opzionale, per sync cross-device futura) ------------------------------
-- create table if not exists public.user_expeditions (
--   user_id uuid not null references auth.users(id) on delete cascade,
--   country_iso text not null,
--   revealed_waves int not null default 1,
--   activated_at timestamptz,
--   created_at timestamptz not null default now(),
--   updated_at timestamptz not null default now(),
--   primary key (user_id, country_iso)
-- );
-- alter table public.user_expeditions enable row level security;
-- create policy "own expeditions" on public.user_expeditions
--   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
--
-- Per la quota AI server-side usare la tabella usage_counters già creata da
-- monetization_mvp.sql (counter_key = 'ai_recognition_YYYY-MM').
