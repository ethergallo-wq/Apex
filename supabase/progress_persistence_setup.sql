-- Animaldex progress persistence
-- Run this in Supabase SQL editor once per project.

create table if not exists public.user_animals (
  user_id uuid not null references auth.users(id) on delete cascade,
  animal_id bigint not null,
  unlock_status text not null default 'locked'
    check (unlock_status in ('locked', 'unlocked', 'seen', 'collected')),
  unlocked_at timestamptz,
  seen_at timestamptz,
  collected_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, animal_id)
);

create table if not exists public.user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table if not exists public.user_destinations (
  user_id uuid not null references auth.users(id) on delete cascade,
  iso text not null,
  trip_tags text[] not null default '{}',
  visited_at date not null default current_date,
  created_at timestamptz not null default now(),
  primary key (user_id, iso)
);

create index if not exists user_animals_user_status_idx
  on public.user_animals (user_id, unlock_status, updated_at desc);

create unique index if not exists user_animals_user_animal_uidx
  on public.user_animals (user_id, animal_id);

create index if not exists user_badges_user_earned_idx
  on public.user_badges (user_id, earned_at desc);

create unique index if not exists user_badges_user_badge_uidx
  on public.user_badges (user_id, badge_id);

create index if not exists user_destinations_user_created_idx
  on public.user_destinations (user_id, created_at desc);

create unique index if not exists user_destinations_user_iso_uidx
  on public.user_destinations (user_id, iso);

alter table public.user_animals enable row level security;
alter table public.user_badges enable row level security;
alter table public.user_destinations enable row level security;

grant select, insert, update, delete on public.user_animals to authenticated;
grant select, insert, update, delete on public.user_badges to authenticated;
grant select, insert, update, delete on public.user_destinations to authenticated;

drop policy if exists "user_animals_owner_select" on public.user_animals;
create policy "user_animals_owner_select"
on public.user_animals for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user_animals_owner_insert" on public.user_animals;
create policy "user_animals_owner_insert"
on public.user_animals for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "user_animals_owner_update" on public.user_animals;
create policy "user_animals_owner_update"
on public.user_animals for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "user_animals_owner_delete" on public.user_animals;
create policy "user_animals_owner_delete"
on public.user_animals for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user_badges_owner_select" on public.user_badges;
create policy "user_badges_owner_select"
on public.user_badges for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user_badges_owner_insert" on public.user_badges;
create policy "user_badges_owner_insert"
on public.user_badges for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "user_badges_owner_update" on public.user_badges;
create policy "user_badges_owner_update"
on public.user_badges for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "user_badges_owner_delete" on public.user_badges;
create policy "user_badges_owner_delete"
on public.user_badges for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user_destinations_owner_select" on public.user_destinations;
create policy "user_destinations_owner_select"
on public.user_destinations for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user_destinations_owner_insert" on public.user_destinations;
create policy "user_destinations_owner_insert"
on public.user_destinations for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "user_destinations_owner_update" on public.user_destinations;
create policy "user_destinations_owner_update"
on public.user_destinations for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "user_destinations_owner_delete" on public.user_destinations;
create policy "user_destinations_owner_delete"
on public.user_destinations for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.unlock_animals_for_destination(
  p_user_id uuid,
  p_iso text,
  p_trip_tags text[] default '{}'
)
returns integer
language sql
security invoker
set search_path = public
as $$
  select case
    when (select auth.uid()) = p_user_id and nullif(trim(p_iso), '') is not null then 0
    else 0
  end;
$$;

grant execute on function public.unlock_animals_for_destination(uuid, text, text[]) to authenticated;
