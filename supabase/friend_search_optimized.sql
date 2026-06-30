-- Optimized friend search for Animaldex (project tbprygwksuayakhhtkpq).
-- Run in Supabase SQL Editor if profile search is still slow.
-- Replaces auth.users full scan with indexed user_profiles lookup.

begin;

create extension if not exists pg_trgm with schema extensions;

create index if not exists user_profiles_username_search_idx
  on public.user_profiles (lower(username) text_pattern_ops);
create index if not exists user_profiles_nickname_search_idx
  on public.user_profiles (lower(nickname) text_pattern_ops);
create index if not exists user_profiles_username_trgm_idx
  on public.user_profiles using gin (lower(username) gin_trgm_ops);
create index if not exists user_profiles_nickname_trgm_idx
  on public.user_profiles using gin (lower(nickname) gin_trgm_ops);

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
as $search_impl$
  with clean as (
    select lower(left(regexp_replace(regexp_replace(trim(coalesce(p_query, '')), '^@+', ''), '[%,()]', '', 'g'), 40)) as q
  ),
  matched as (
    select
      p.user_id,
      nullif(trim(p.username), '') as username,
      nullif(trim(p.nickname), '') as nickname,
      p.avatar_url,
      p.featured_badge_id,
      p.profile_background_image
    from public.user_profiles p
    cross join clean
    where clean.q <> ''
      and length(clean.q) >= 3
      and ((select auth.uid()) is null or p.user_id <> (select auth.uid()))
      and (
        lower(coalesce(p.username, '')) like clean.q || '%'
        or lower(coalesce(p.nickname, '')) like clean.q || '%'
        or lower(coalesce(p.username, '')) like '%' || clean.q || '%'
        or lower(coalesce(p.nickname, '')) like '%' || clean.q || '%'
      )
      and not exists (
        select 1 from public.user_blocks b
        where (b.blocker_id = (select auth.uid()) and b.blocked_id = p.user_id)
           or (b.blocked_id = (select auth.uid()) and b.blocker_id = p.user_id)
      )
  )
  select
    m.user_id,
    m.username,
    m.nickname,
    m.avatar_url,
    m.featured_badge_id,
    m.profile_background_image
  from matched m
  cross join clean
  order by
    case when lower(coalesce(m.username, '')) = clean.q or lower(coalesce(m.nickname, '')) = clean.q then 0 else 1 end,
    case when lower(coalesce(m.username, '')) like clean.q || '%' or lower(coalesce(m.nickname, '')) like clean.q || '%' then 0 else 1 end,
    lower(coalesce(m.username, m.nickname, ''))
  limit greatest(1, least(coalesce(p_limit, 12), 25));
$search_impl$;

revoke all on function private.search_social_profiles_impl(text, integer) from public, anon;
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
set search_path = public, private
as $search_public$
  select * from private.search_social_profiles_impl(p_query, p_limit);
$search_public$;

revoke all on function public.search_social_profiles(text, integer) from public, anon;
grant execute on function public.search_social_profiles(text, integer) to authenticated;

notify pgrst, 'reload schema';

commit;
