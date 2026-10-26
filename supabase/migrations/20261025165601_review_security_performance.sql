-- Reviewed against Apex production metadata on 2026-10-25.
-- Deploy the matching frontend with this migration. No photo tables/buckets.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

create schema if not exists private;
grant usage on schema private to authenticated;

-- Check both directions without being limited by user_blocks' owner-only RLS.
create or replace function private.is_blocked_peer(p_peer_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is null or exists (
    select 1 from public.user_blocks b
    where (b.blocker_id = (select auth.uid()) and b.blocked_id = p_peer_id)
       or (b.blocked_id = (select auth.uid()) and b.blocker_id = p_peer_id)
  );
$$;
revoke all on function private.is_blocked_peer(uuid) from public, anon, authenticated;
grant execute on function private.is_blocked_peer(uuid) to authenticated;

-- Private account fields (email, phone, birth date, questionnaire) stay private.
drop policy if exists user_profiles_select_authenticated_social on public.user_profiles;
drop policy if exists user_profiles_select_own on public.user_profiles;
create policy user_profiles_select_own on public.user_profiles for select to authenticated
using ((select auth.uid()) = user_id);

create or replace function private.get_social_profiles_impl(p_user_ids uuid[])
returns table (user_id uuid, username text, nickname text, avatar_url text,
               featured_badge_id text, profile_background_image text)
language sql stable security definer set search_path = ''
as $$
  select p.user_id, p.username, p.nickname, p.avatar_url,
         p.featured_badge_id, p.profile_background_image
  from public.user_profiles p
  where (select auth.uid()) is not null
    and p.user_id = any(p_user_ids[1:200])
    and not private.is_blocked_peer(p.user_id)
  order by p.user_id;
$$;
revoke all on function private.get_social_profiles_impl(uuid[]) from public, anon, authenticated;
grant execute on function private.get_social_profiles_impl(uuid[]) to authenticated;

create or replace function public.get_social_profiles(p_user_ids uuid[])
returns table (user_id uuid, username text, nickname text, avatar_url text,
               featured_badge_id text, profile_background_image text)
language sql stable security invoker set search_path = ''
as $$ select * from private.get_social_profiles_impl(p_user_ids); $$;
revoke all on function public.get_social_profiles(uuid[]) from public, anon, authenticated;
grant execute on function public.get_social_profiles(uuid[]) to authenticated;

-- A caller can request friendship, never grant it to themselves.
drop policy if exists friendships_insert_own_request on public.friendships;
create policy friendships_insert_own_request on public.friendships for insert to authenticated
with check (
  (select auth.uid()) = requester_id
  and requester_id <> addressee_id
  and status = 'pending'
  and accepted_at is null
  and not private.is_blocked_peer(addressee_id)
);
-- RLS cannot compare OLD and NEW identifiers. Column grants keep them immutable.
revoke update on public.friendships from public, anon, authenticated;
grant update (status, accepted_at, updated_at) on public.friendships to authenticated;
drop policy if exists friendships_update_addressee_accepts on public.friendships;
create policy friendships_update_addressee_accepts on public.friendships for update to authenticated
using ((select auth.uid()) = addressee_id and status = 'pending')
with check ((select auth.uid()) = addressee_id and status = 'accepted'
            and not private.is_blocked_peer(requester_id));

-- Accepted friendships do not override a subsequent block.
do $$
declare target text;
begin
  foreach target in array array['user_animals','user_badges','user_destinations'] loop
    execute format('drop policy if exists %I on public.%I', target || '_select_owner_or_friends', target);
    execute format($policy$
      create policy %I on public.%I for select to authenticated using (
        (select auth.uid()) = user_id or (
          not private.is_blocked_peer(user_id) and exists (
            select 1 from public.friendships f where f.status = 'accepted'
              and ((f.requester_id = (select auth.uid()) and f.addressee_id = %I.user_id)
                or (f.addressee_id = (select auth.uid()) and f.requester_id = %I.user_id))
          )
        )
      )
    $policy$, target || '_select_owner_or_friends', target, target, target);
  end loop;
end $$;

-- Aggregate through RLS; no elevated public function or anonymous execution.
create or replace function public.get_social_peer_stats(p_viewer_id uuid)
returns table (user_id uuid, seen_count integer, captured_count integer,
               documented_count integer, badge_count integer, destination_count integer)
language sql stable security invoker set search_path = ''
as $$
  with peers as (
    select p_viewer_id as peer_id where p_viewer_id = (select auth.uid())
    union
    select case when f.requester_id = p_viewer_id then f.addressee_id else f.requester_id end
    from public.friendships f
    where p_viewer_id = (select auth.uid()) and f.status = 'accepted'
      and (f.requester_id = p_viewer_id or f.addressee_id = p_viewer_id)
  )
  select p.peer_id, a.seen, a.captured, a.documented, b.badges, d.destinations
  from peers p
  cross join lateral (
    select count(*) filter (where unlock_status in ('seen','collected'))::integer as seen,
           count(*) filter (where unlock_status = 'collected')::integer as captured,
           count(*) filter (where documented_at is not null)::integer as documented
    from public.user_animals ua where ua.user_id = p.peer_id
  ) a
  cross join lateral (select count(*)::integer as badges from public.user_badges ub where ub.user_id = p.peer_id) b
  cross join lateral (select count(distinct iso)::integer as destinations from public.user_destinations ud where ud.user_id = p.peer_id) d
  where not private.is_blocked_peer(p.peer_id);
$$;
revoke all on function public.get_social_peer_stats(uuid) from public, anon, authenticated;
grant execute on function public.get_social_peer_stats(uuid) to authenticated;

-- RLS does not protect TRUNCATE; browser roles do not need DDL privileges.
revoke truncate, references, trigger on all tables in schema public from public, anon, authenticated;
-- These counters are not used by the current frontend. Future quotas must be server-owned.
revoke insert, update, delete on public.usage_counters from public, anon, authenticated;

-- Cover the nine foreign keys reported by the production advisor.
create index if not exists social_event_reactions_user_id_idx on public.social_event_reactions(user_id);
create index if not exists social_notifications_actor_id_idx on public.social_notifications(actor_id);
create index if not exists social_notifications_event_id_idx on public.social_notifications(event_id);
create index if not exists social_notifications_friendship_id_idx on public.social_notifications(friendship_id);
create index if not exists user_animals_animal_id_idx on public.user_animals(animal_id);
create index if not exists user_badges_badge_id_idx on public.user_badges(badge_id);
create index if not exists user_blocks_blocked_id_idx on public.user_blocks(blocked_id);
create index if not exists user_reports_event_id_idx on public.user_reports(event_id);
create index if not exists user_reports_reported_user_id_idx on public.user_reports(reported_user_id);

notify pgrst, 'reload schema';
commit;
