-- Friend social stats: RLS + RPC aggregata per leaderboard Allenatori.
-- Esegui nel SQL Editor di Supabase (idempotente).
-- Risolve XP/progressi amici a 0 quando le policy owner-only sovrascrivono quelle social.

-- 1) Lettura progressi per amici accettati -----------------------------------
do $$
begin
  if to_regclass('public.user_animals') is not null then
    execute 'alter table public.user_animals enable row level security';
    execute 'grant select on public.user_animals to authenticated';
    execute 'drop policy if exists "user_animals_owner_select" on public.user_animals';
    execute 'drop policy if exists "user_animals_select_owner_or_friends" on public.user_animals';
    execute $pol$
      create policy "user_animals_select_owner_or_friends"
      on public.user_animals for select
      to authenticated
      using (
        (select auth.uid()) = user_id
        or exists (
          select 1 from public.friendships f
          where f.status = 'accepted'
            and ((f.requester_id = (select auth.uid()) and f.addressee_id = user_animals.user_id)
              or (f.addressee_id = (select auth.uid()) and f.requester_id = user_animals.user_id))
        )
      )
    $pol$;
  end if;

  if to_regclass('public.user_badges') is not null then
    execute 'alter table public.user_badges enable row level security';
    execute 'grant select on public.user_badges to authenticated';
    execute 'drop policy if exists "user_badges_owner_select" on public.user_badges';
    execute 'drop policy if exists "user_badges_select_owner_or_friends" on public.user_badges';
    execute $pol$
      create policy "user_badges_select_owner_or_friends"
      on public.user_badges for select
      to authenticated
      using (
        (select auth.uid()) = user_id
        or exists (
          select 1 from public.friendships f
          where f.status = 'accepted'
            and ((f.requester_id = (select auth.uid()) and f.addressee_id = user_badges.user_id)
              or (f.addressee_id = (select auth.uid()) and f.requester_id = user_badges.user_id))
        )
      )
    $pol$;
  end if;

  if to_regclass('public.user_destinations') is not null then
    execute 'alter table public.user_destinations enable row level security';
    execute 'grant select on public.user_destinations to authenticated';
    execute 'drop policy if exists "user_destinations_owner_select" on public.user_destinations';
    execute 'drop policy if exists "user_destinations_select_owner_or_friends" on public.user_destinations';
    execute $pol$
      create policy "user_destinations_select_owner_or_friends"
      on public.user_destinations for select
      to authenticated
      using (
        (select auth.uid()) = user_id
        or exists (
          select 1 from public.friendships f
          where f.status = 'accepted'
            and ((f.requester_id = (select auth.uid()) and f.addressee_id = user_destinations.user_id)
              or (f.addressee_id = (select auth.uid()) and f.requester_id = user_destinations.user_id))
        )
      )
    $pol$;
  end if;
end $$;

-- 2) RPC aggregata (security definer, solo per il viewer autenticato) -------
drop function if exists public.get_social_peer_stats(uuid);

create or replace function public.get_social_peer_stats(p_viewer_id uuid)
returns table (
  user_id uuid,
  seen_count integer,
  captured_count integer,
  documented_count integer,
  badge_count integer,
  destination_count integer
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if (select auth.uid()) is distinct from p_viewer_id then
    return;
  end if;

  return query
  with peers as (
    select p_viewer_id as peer_id
    union
    select case
      when f.requester_id = p_viewer_id then f.addressee_id
      else f.requester_id
    end
    from public.friendships f
    where f.status = 'accepted'
      and (f.requester_id = p_viewer_id or f.addressee_id = p_viewer_id)
  )
  select
    p.peer_id as user_id,
    coalesce((
      select count(*)::integer from public.user_animals ua
      where ua.user_id = p.peer_id
        and ua.unlock_status in ('seen', 'collected')
    ), 0) as seen_count,
    coalesce((
      select count(*)::integer from public.user_animals ua
      where ua.user_id = p.peer_id
        and ua.unlock_status = 'collected'
    ), 0) as captured_count,
    coalesce((
      select count(*)::integer from public.user_animals ua
      where ua.user_id = p.peer_id
        and ua.documented_at is not null
    ), 0) as documented_count,
    coalesce((
      select count(*)::integer from public.user_badges ub
      where ub.user_id = p.peer_id
    ), 0) as badge_count,
    coalesce((
      select count(distinct ud.iso)::integer from public.user_destinations ud
      where ud.user_id = p.peer_id
    ), 0) as destination_count
  from peers p;
end;
$$;

grant execute on function public.get_social_peer_stats(uuid) to authenticated;
