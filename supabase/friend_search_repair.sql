-- Animaldex friend search repair.
-- Run this in Supabase SQL Editor if the app shows "Nessun profilo trovato"
-- even though users exist and login/profile sync works.

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text,
  nickname text,
  avatar_url text,
  featured_badge_id text,
  profile_background_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles
  add column if not exists username text,
  add column if not exists nickname text,
  add column if not exists avatar_url text,
  add column if not exists featured_badge_id text,
  add column if not exists profile_background_image text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists user_profiles_username_search_idx
  on public.user_profiles (lower(username));
create index if not exists user_profiles_nickname_search_idx
  on public.user_profiles (lower(nickname));

create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_blocks_not_self check (blocker_id <> blocked_id),
  constraint user_blocks_unique unique (blocker_id, blocked_id)
);

alter table public.user_profiles enable row level security;
alter table public.user_blocks enable row level security;
grant select, insert, update on public.user_profiles to authenticated;
grant select, insert, delete on public.user_blocks to authenticated;

drop policy if exists "user_blocks_select_own" on public.user_blocks;
create policy "user_blocks_select_own"
on public.user_blocks for select
to authenticated
using ((select auth.uid()) = blocker_id);

drop policy if exists "user_blocks_insert_own" on public.user_blocks;
create policy "user_blocks_insert_own"
on public.user_blocks for insert
to authenticated
with check ((select auth.uid()) = blocker_id and blocker_id <> blocked_id);

drop policy if exists "user_blocks_delete_own" on public.user_blocks;
create policy "user_blocks_delete_own"
on public.user_blocks for delete
to authenticated
using ((select auth.uid()) = blocker_id);

drop policy if exists "user_profiles_select_authenticated_social" on public.user_profiles;
create policy "user_profiles_select_authenticated_social"
on public.user_profiles for select
to authenticated
using (
  (select auth.uid()) = user_id
  or not exists (
    select 1 from public.user_blocks b
    where (b.blocker_id = (select auth.uid()) and b.blocked_id = user_id)
       or (b.blocked_id = (select auth.uid()) and b.blocker_id = user_id)
  )
);

drop policy if exists "user_profiles_insert_own_social" on public.user_profiles;
create policy "user_profiles_insert_own_social"
on public.user_profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "user_profiles_update_own_social" on public.user_profiles;
create policy "user_profiles_update_own_social"
on public.user_profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

insert into public.user_profiles (user_id, username, nickname)
select
  au.id,
  coalesce(
    nullif(trim(au.raw_user_meta_data->>'username'), ''),
    nullif(trim(au.raw_user_meta_data->>'preferred_username'), ''),
    nullif(regexp_replace(lower(split_part(coalesce(au.email, ''), '@', 1)), '[^a-z0-9._-]', '', 'g'), ''),
    'explorer_' || left(au.id::text, 8)
  ) as username,
  coalesce(
    nullif(trim(au.raw_user_meta_data->>'nickname'), ''),
    nullif(trim(au.raw_user_meta_data->>'name'), ''),
    nullif(trim(au.raw_user_meta_data->>'full_name'), ''),
    nullif(regexp_replace(split_part(coalesce(au.email, ''), '@', 1), '[^a-zA-Z0-9._ -]', '', 'g'), ''),
    'Explorer ' || left(au.id::text, 4)
  ) as nickname
from auth.users au
left join public.user_profiles up on up.user_id = au.id
where up.user_id is null;

update public.user_profiles up
set
  username = coalesce(
    nullif(trim(up.username), ''),
    nullif(trim(au.raw_user_meta_data->>'username'), ''),
    nullif(trim(au.raw_user_meta_data->>'preferred_username'), ''),
    nullif(regexp_replace(lower(split_part(coalesce(au.email, ''), '@', 1)), '[^a-z0-9._-]', '', 'g'), ''),
    'explorer_' || left(au.id::text, 8)
  ),
  nickname = coalesce(
    nullif(trim(up.nickname), ''),
    nullif(trim(up.username), ''),
    nullif(trim(au.raw_user_meta_data->>'nickname'), ''),
    nullif(trim(au.raw_user_meta_data->>'name'), ''),
    nullif(trim(au.raw_user_meta_data->>'full_name'), ''),
    nullif(regexp_replace(split_part(coalesce(au.email, ''), '@', 1), '[^a-zA-Z0-9._ -]', '', 'g'), ''),
    'Explorer ' || left(au.id::text, 4)
  ),
  updated_at = now()
from auth.users au
where up.user_id = au.id
  and (
    nullif(trim(coalesce(up.username, '')), '') is null
    or nullif(trim(coalesce(up.nickname, '')), '') is null
  );

create schema if not exists private;

create or replace function private.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
begin
  base_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    nullif(trim(new.raw_user_meta_data->>'preferred_username'), ''),
    nullif(regexp_replace(lower(split_part(coalesce(new.email, ''), '@', 1)), '[^a-z0-9._-]', '', 'g'), ''),
    'explorer_' || left(new.id::text, 8)
  );

  insert into public.user_profiles (user_id, username, nickname)
  values (
    new.id,
    base_username,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'nickname'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      base_username
    )
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function private.handle_new_auth_user_profile();

create or replace function private.search_social_profiles_impl(p_query text, p_limit integer default 12)
returns table (
  user_id uuid,
  username text,
  nickname text,
  avatar_url text,
  featured_badge_id text,
  profile_background_image text
)
language sql
stable
security definer
set search_path = public
as $$
  with clean as (
    select lower(left(regexp_replace(regexp_replace(trim(coalesce(p_query, '')), '^@+', ''), '[%_,()]', '', 'g'), 40)) as q
  ),
  searchable as (
    select
      au.id as user_id,
      coalesce(
        nullif(trim(up.username), ''),
        nullif(trim(au.raw_user_meta_data->>'username'), ''),
        nullif(trim(au.raw_user_meta_data->>'preferred_username'), ''),
        nullif(regexp_replace(lower(split_part(coalesce(au.email, ''), '@', 1)), '[^a-z0-9._-]', '', 'g'), ''),
        'explorer_' || left(au.id::text, 8)
      ) as username,
      coalesce(
        nullif(trim(up.nickname), ''),
        nullif(trim(up.username), ''),
        nullif(trim(au.raw_user_meta_data->>'nickname'), ''),
        nullif(trim(au.raw_user_meta_data->>'name'), ''),
        nullif(trim(au.raw_user_meta_data->>'full_name'), ''),
        nullif(regexp_replace(split_part(coalesce(au.email, ''), '@', 1), '[^a-zA-Z0-9._ -]', '', 'g'), ''),
        'Explorer ' || left(au.id::text, 4)
      ) as nickname,
      up.avatar_url,
      up.featured_badge_id,
      up.profile_background_image
    from auth.users au
    left join public.user_profiles up on up.user_id = au.id
  )
  select
    s.user_id,
    s.username,
    s.nickname,
    s.avatar_url,
    s.featured_badge_id,
    s.profile_background_image
  from searchable s
  cross join clean
  where clean.q <> ''
    and length(clean.q) >= 3
    and ((select auth.uid()) is null or s.user_id <> (select auth.uid()))
    and (
      lower(coalesce(s.username, '')) like '%' || clean.q || '%'
      or lower(coalesce(s.nickname, '')) like '%' || clean.q || '%'
    )
    and not exists (
      select 1 from public.user_blocks b
      where (b.blocker_id = (select auth.uid()) and b.blocked_id = s.user_id)
         or (b.blocked_id = (select auth.uid()) and b.blocker_id = s.user_id)
    )
  order by
    case when lower(coalesce(s.username, '')) = clean.q or lower(coalesce(s.nickname, '')) = clean.q then 0 else 1 end,
    case when lower(coalesce(s.username, '')) like clean.q || '%' or lower(coalesce(s.nickname, '')) like clean.q || '%' then 0 else 1 end,
    lower(coalesce(s.username, s.nickname, ''))
  limit greatest(1, least(coalesce(p_limit, 12), 25));
$$;

revoke all on function private.search_social_profiles_impl(text, integer) from public;
revoke all on function private.search_social_profiles_impl(text, integer) from anon;
grant usage on schema private to authenticated;
grant execute on function private.search_social_profiles_impl(text, integer) to authenticated;

create or replace function public.search_social_profiles(p_query text, p_limit integer default 12)
returns table (
  user_id uuid,
  username text,
  nickname text,
  avatar_url text,
  featured_badge_id text,
  profile_background_image text
)
language sql
stable
security invoker
set search_path = public
as $$
  select * from private.search_social_profiles_impl(p_query, p_limit);
$$;

grant execute on function public.search_social_profiles(text, integer) to authenticated;
notify pgrst, 'reload schema';
