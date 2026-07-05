-- Richieste di aggiunta specie (da riconoscimento foto)
create table if not exists public.animal_add_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  common_name text not null,
  scientific_name text,
  photo_url text,
  photo_storage_path text,
  ai_summary text,
  ai_probability numeric,
  lat double precision,
  lng double precision,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists animal_add_requests_created_at_idx on public.animal_add_requests (created_at desc);
create index if not exists animal_add_requests_status_idx on public.animal_add_requests (status);

alter table public.animal_add_requests enable row level security;

drop policy if exists "animal_add_requests_owner_insert" on public.animal_add_requests;
create policy "animal_add_requests_owner_insert"
  on public.animal_add_requests for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "animal_add_requests_owner_select" on public.animal_add_requests;
create policy "animal_add_requests_owner_select"
  on public.animal_add_requests for select to authenticated
  using ((select auth.uid()) = user_id);
