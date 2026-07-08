-- ============================================================
-- Apex / Animaldex — Migrazione "Atlante + Spedizioni a ondate"
-- Da eseguire nel SQL Editor di Supabase (idempotente, si può rilanciare).
--
-- Contenuto:
--   1. user_animals.documented_at → layer parallelo "Documentato" (Atlante).
--      NON è un nuovo valore di unlock_status: la piramide
--      locked/unlocked/seen/collected resta intatta.
--   2. Indice per le letture del layer documentato.
--   3. user_expeditions → stato Spedizioni/ondate per paese, sync cross-device.
--   4. (Nota) Crediti mensili e quota AI restano client-side per ora;
--      per enforcement server-side usare usage_counters (monetization_mvp.sql).
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

-- 3) Spedizioni a ondate ----------------------------------------------------
-- revealed_waves: 0 = in attesa di credito, 1..n = ondate rivelate,
-- 99 = interamente rivelato (valore EXPEDITION_ALL_WAVES lato client).
create table if not exists public.user_expeditions (
  user_id uuid not null references auth.users(id) on delete cascade,
  country_iso text not null,
  revealed_waves int not null default 1,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, country_iso)
);

create index if not exists user_expeditions_user_updated_idx
  on public.user_expeditions (user_id, updated_at desc);

alter table public.user_expeditions enable row level security;

grant select, insert, update, delete on public.user_expeditions to authenticated;

drop policy if exists "user_expeditions_owner_select" on public.user_expeditions;
create policy "user_expeditions_owner_select"
on public.user_expeditions for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user_expeditions_owner_insert" on public.user_expeditions;
create policy "user_expeditions_owner_insert"
on public.user_expeditions for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "user_expeditions_owner_update" on public.user_expeditions;
create policy "user_expeditions_owner_update"
on public.user_expeditions for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "user_expeditions_owner_delete" on public.user_expeditions;
create policy "user_expeditions_owner_delete"
on public.user_expeditions for delete
to authenticated
using ((select auth.uid()) = user_id);

-- 4) Note operative ----------------------------------------------------------
-- Crediti Spedizione (1/mese, stack 3) e quota AI (5/mese + Regalo di
-- Spedizione) vivono in localStorage. Quando servirà enforcement server-side
-- usare public.usage_counters con counter_key:
--   'expedition_credit_YYYY-MM'  e  'ai_recognition_YYYY-MM'.
