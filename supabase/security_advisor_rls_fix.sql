-- Animaldex Security Advisor RLS fix.
-- Run this in the Supabase SQL Editor for project tbprygwksuayakhhtkpq.
--
-- Goals:
-- - Public catalog tables stay readable by the app, but cannot be edited by public clients.
-- - User data is accessible only to the authenticated owner, except social data that is
--   intentionally visible to accepted friends.
-- - Anonymous clients cannot read or write private user tables.

begin;

-- Public read-only catalog tables used by the frontend.
do $$
begin
  if to_regclass('public.animals') is not null then
    execute 'alter table public.animals enable row level security';
    execute 'revoke all on table public.animals from public';
    execute 'revoke insert, update, delete, truncate on table public.animals from anon, authenticated';
    execute 'grant select on table public.animals to anon, authenticated';
    execute 'drop policy if exists "animals_public_read" on public.animals';
    execute 'create policy "animals_public_read" on public.animals for select to anon, authenticated using (true)';
  end if;

  if to_regclass('public.animal_geo') is not null then
    execute 'alter table public.animal_geo enable row level security';
    execute 'revoke all on table public.animal_geo from public';
    execute 'revoke insert, update, delete, truncate on table public.animal_geo from anon, authenticated';
    execute 'grant select on table public.animal_geo to anon, authenticated';
    execute 'drop policy if exists "animal_geo_public_read" on public.animal_geo';
    execute 'create policy "animal_geo_public_read" on public.animal_geo for select to anon, authenticated using (true)';
  end if;

  if to_regclass('public.badges') is not null then
    execute 'alter table public.badges enable row level security';
    execute 'revoke all on table public.badges from public';
    execute 'revoke insert, update, delete, truncate on table public.badges from anon, authenticated';
    execute 'grant select on table public.badges to anon, authenticated';
    execute 'drop policy if exists "badges_public_read" on public.badges';
    execute 'create policy "badges_public_read" on public.badges for select to anon, authenticated using (true)';
  end if;
end $$;

-- Progress persistence: owner-only.
do $$
begin
  if to_regclass('public.user_animals') is not null then
    execute 'alter table public.user_animals enable row level security';
    execute 'revoke all on table public.user_animals from public, anon';
    execute 'grant select, insert, update, delete on table public.user_animals to authenticated';
    execute 'drop policy if exists "user_animals_owner_select" on public.user_animals';
    execute 'drop policy if exists "user_animals_owner_insert" on public.user_animals';
    execute 'drop policy if exists "user_animals_owner_update" on public.user_animals';
    execute 'drop policy if exists "user_animals_owner_delete" on public.user_animals';
    execute 'create policy "user_animals_owner_select" on public.user_animals for select to authenticated using ((select auth.uid()) = user_id)';
    execute 'create policy "user_animals_owner_insert" on public.user_animals for insert to authenticated with check ((select auth.uid()) = user_id)';
    execute 'create policy "user_animals_owner_update" on public.user_animals for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)';
    execute 'create policy "user_animals_owner_delete" on public.user_animals for delete to authenticated using ((select auth.uid()) = user_id)';
  end if;

  if to_regclass('public.user_badges') is not null then
    execute 'alter table public.user_badges enable row level security';
    execute 'revoke all on table public.user_badges from public, anon';
    execute 'grant select, insert, update, delete on table public.user_badges to authenticated';
    execute 'drop policy if exists "user_badges_owner_select" on public.user_badges';
    execute 'drop policy if exists "user_badges_owner_insert" on public.user_badges';
    execute 'drop policy if exists "user_badges_owner_update" on public.user_badges';
    execute 'drop policy if exists "user_badges_owner_delete" on public.user_badges';
    execute 'create policy "user_badges_owner_select" on public.user_badges for select to authenticated using ((select auth.uid()) = user_id)';
    execute 'create policy "user_badges_owner_insert" on public.user_badges for insert to authenticated with check ((select auth.uid()) = user_id)';
    execute 'create policy "user_badges_owner_update" on public.user_badges for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)';
    execute 'create policy "user_badges_owner_delete" on public.user_badges for delete to authenticated using ((select auth.uid()) = user_id)';
  end if;

  if to_regclass('public.user_destinations') is not null then
    execute 'alter table public.user_destinations enable row level security';
    execute 'revoke all on table public.user_destinations from public, anon';
    execute 'grant select, insert, update, delete on table public.user_destinations to authenticated';
    execute 'drop policy if exists "user_destinations_owner_select" on public.user_destinations';
    execute 'drop policy if exists "user_destinations_owner_insert" on public.user_destinations';
    execute 'drop policy if exists "user_destinations_owner_update" on public.user_destinations';
    execute 'drop policy if exists "user_destinations_owner_delete" on public.user_destinations';
    execute 'create policy "user_destinations_owner_select" on public.user_destinations for select to authenticated using ((select auth.uid()) = user_id)';
    execute 'create policy "user_destinations_owner_insert" on public.user_destinations for insert to authenticated with check ((select auth.uid()) = user_id)';
    execute 'create policy "user_destinations_owner_update" on public.user_destinations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)';
    execute 'create policy "user_destinations_owner_delete" on public.user_destinations for delete to authenticated using ((select auth.uid()) = user_id)';
  end if;
end $$;

-- Profiles and social graph.
do $$
begin
  if to_regclass('public.user_profiles') is not null then
    execute 'alter table public.user_profiles enable row level security';
    execute 'revoke all on table public.user_profiles from public, anon';
    execute 'grant select, insert, update on table public.user_profiles to authenticated';
    execute 'drop policy if exists "user_profiles_select_authenticated_social" on public.user_profiles';
    execute 'drop policy if exists "user_profiles_insert_own_social" on public.user_profiles';
    execute 'drop policy if exists "user_profiles_update_own_social" on public.user_profiles';
    execute $policy$
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
      )
    $policy$;
    execute 'create policy "user_profiles_insert_own_social" on public.user_profiles for insert to authenticated with check ((select auth.uid()) = user_id)';
    execute 'create policy "user_profiles_update_own_social" on public.user_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)';
  end if;

  if to_regclass('public.friendships') is not null then
    execute 'alter table public.friendships enable row level security';
    execute 'revoke all on table public.friendships from public, anon';
    execute 'grant select, insert, update, delete on table public.friendships to authenticated';
    execute 'drop policy if exists "friendships_select_involved" on public.friendships';
    execute 'drop policy if exists "friendships_insert_own_request" on public.friendships';
    execute 'drop policy if exists "friendships_update_addressee_accepts" on public.friendships';
    execute 'drop policy if exists "friendships_delete_involved" on public.friendships';
    execute 'create policy "friendships_select_involved" on public.friendships for select to authenticated using ((select auth.uid()) = requester_id or (select auth.uid()) = addressee_id)';
    execute $policy$
      create policy "friendships_insert_own_request"
      on public.friendships for insert
      to authenticated
      with check (
        (select auth.uid()) = requester_id
        and requester_id <> addressee_id
        and not exists (
          select 1 from public.user_blocks b
          where (b.blocker_id = requester_id and b.blocked_id = addressee_id)
             or (b.blocker_id = addressee_id and b.blocked_id = requester_id)
        )
      )
    $policy$;
    execute 'create policy "friendships_update_addressee_accepts" on public.friendships for update to authenticated using ((select auth.uid()) = addressee_id and status = ''pending'') with check ((select auth.uid()) = addressee_id and status = ''accepted'')';
    execute 'create policy "friendships_delete_involved" on public.friendships for delete to authenticated using ((select auth.uid()) = requester_id or (select auth.uid()) = addressee_id)';
  end if;

  if to_regclass('public.user_blocks') is not null then
    execute 'alter table public.user_blocks enable row level security';
    execute 'revoke all on table public.user_blocks from public, anon';
    execute 'grant select, insert, delete on table public.user_blocks to authenticated';
    execute 'drop policy if exists "user_blocks_select_own" on public.user_blocks';
    execute 'drop policy if exists "user_blocks_insert_own" on public.user_blocks';
    execute 'drop policy if exists "user_blocks_delete_own" on public.user_blocks';
    execute 'create policy "user_blocks_select_own" on public.user_blocks for select to authenticated using ((select auth.uid()) = blocker_id)';
    execute 'create policy "user_blocks_insert_own" on public.user_blocks for insert to authenticated with check ((select auth.uid()) = blocker_id and blocker_id <> blocked_id)';
    execute 'create policy "user_blocks_delete_own" on public.user_blocks for delete to authenticated using ((select auth.uid()) = blocker_id)';
  end if;
end $$;

-- Social feed, notifications and moderation.
do $$
begin
  if to_regclass('public.social_events') is not null then
    execute 'alter table public.social_events enable row level security';
    execute 'revoke all on table public.social_events from public, anon';
    execute 'grant select, insert on table public.social_events to authenticated';
    execute 'drop policy if exists "social_events_select_owner_or_friends" on public.social_events';
    execute 'drop policy if exists "social_events_insert_own" on public.social_events';
    execute $policy$
      create policy "social_events_select_owner_or_friends"
      on public.social_events for select
      to authenticated
      using (
        (select auth.uid()) = user_id
        or exists (
          select 1 from public.friendships f
          where f.status = 'accepted'
            and ((f.requester_id = (select auth.uid()) and f.addressee_id = social_events.user_id)
              or (f.addressee_id = (select auth.uid()) and f.requester_id = social_events.user_id))
        )
      )
    $policy$;
    execute 'create policy "social_events_insert_own" on public.social_events for insert to authenticated with check ((select auth.uid()) = user_id)';
  end if;

  if to_regclass('public.social_event_reactions') is not null then
    execute 'alter table public.social_event_reactions enable row level security';
    execute 'revoke all on table public.social_event_reactions from public, anon';
    execute 'grant select, insert, delete on table public.social_event_reactions to authenticated';
    execute 'drop policy if exists "social_event_reactions_select_visible_events" on public.social_event_reactions';
    execute 'drop policy if exists "social_event_reactions_insert_friends_only" on public.social_event_reactions';
    execute 'drop policy if exists "social_event_reactions_delete_own" on public.social_event_reactions';
    execute $policy$
      create policy "social_event_reactions_select_visible_events"
      on public.social_event_reactions for select
      to authenticated
      using (
        exists (
          select 1 from public.social_events e
          where e.id = event_id
            and (
              e.user_id = (select auth.uid())
              or exists (
                select 1 from public.friendships f
                where f.status = 'accepted'
                  and ((f.requester_id = (select auth.uid()) and f.addressee_id = e.user_id)
                    or (f.addressee_id = (select auth.uid()) and f.requester_id = e.user_id))
              )
            )
        )
      )
    $policy$;
    execute $policy$
      create policy "social_event_reactions_insert_friends_only"
      on public.social_event_reactions for insert
      to authenticated
      with check (
        (select auth.uid()) = user_id
        and exists (
          select 1 from public.social_events e
          join public.friendships f
            on f.status = 'accepted'
           and ((f.requester_id = social_event_reactions.user_id and f.addressee_id = e.user_id)
             or (f.addressee_id = social_event_reactions.user_id and f.requester_id = e.user_id))
          where e.id = event_id
            and e.user_id <> social_event_reactions.user_id
        )
      )
    $policy$;
    execute 'create policy "social_event_reactions_delete_own" on public.social_event_reactions for delete to authenticated using ((select auth.uid()) = user_id)';
  end if;

  if to_regclass('public.social_notifications') is not null then
    execute 'alter table public.social_notifications enable row level security';
    execute 'revoke all on table public.social_notifications from public, anon';
    execute 'grant select, insert, update on table public.social_notifications to authenticated';
    execute 'drop policy if exists "social_notifications_select_own" on public.social_notifications';
    execute 'drop policy if exists "social_notifications_insert_involved" on public.social_notifications';
    execute 'drop policy if exists "social_notifications_update_read_own" on public.social_notifications';
    execute 'create policy "social_notifications_select_own" on public.social_notifications for select to authenticated using ((select auth.uid()) = user_id)';
    execute $policy$
      create policy "social_notifications_insert_involved"
      on public.social_notifications for insert
      to authenticated
      with check (
        (select auth.uid()) = actor_id
        and user_id <> actor_id
        and (
          (
            notification_type = 'friend_request'
            and exists (
              select 1 from public.friendships f
              where f.id = friendship_id
                and f.status = 'pending'
                and f.requester_id = actor_id
                and f.addressee_id = user_id
            )
          )
          or (
            notification_type = 'friend_accepted'
            and exists (
              select 1 from public.friendships f
              where f.id = friendship_id
                and f.status = 'accepted'
                and f.addressee_id = actor_id
                and f.requester_id = user_id
            )
          )
          or (
            notification_type = 'reaction'
            and exists (select 1 from public.social_events e where e.id = event_id and e.user_id = user_id)
            and exists (
              select 1 from public.social_event_reactions r
              where r.event_id = event_id
                and r.user_id = actor_id
                and r.reaction_key = social_notifications.reaction_key
            )
          )
          or (
            notification_type in ('rare_capture','legendary_capture','badge_earned')
            and exists (
              select 1 from public.social_events e
              join public.friendships f
                on f.status = 'accepted'
               and ((f.requester_id = actor_id and f.addressee_id = user_id)
                 or (f.addressee_id = actor_id and f.requester_id = user_id))
              where e.id = event_id
                and e.user_id = actor_id
            )
          )
        )
      )
    $policy$;
    execute 'create policy "social_notifications_update_read_own" on public.social_notifications for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)';
  end if;

  if to_regclass('public.user_reports') is not null then
    execute 'alter table public.user_reports enable row level security';
    execute 'revoke all on table public.user_reports from public, anon';
    execute 'grant insert, select on table public.user_reports to authenticated';
    execute 'drop policy if exists "user_reports_insert_own" on public.user_reports';
    execute 'drop policy if exists "user_reports_select_own" on public.user_reports';
    execute 'create policy "user_reports_insert_own" on public.user_reports for insert to authenticated with check ((select auth.uid()) = reporter_id)';
    execute 'create policy "user_reports_select_own" on public.user_reports for select to authenticated using ((select auth.uid()) = reporter_id)';
  end if;
end $$;

-- Monetization, analytics and photo metadata.
do $$
begin
  if to_regclass('public.user_events') is not null then
    execute 'alter table public.user_events enable row level security';
    execute 'revoke all on table public.user_events from public, anon';
    execute 'grant select, insert on table public.user_events to authenticated';
    execute 'drop policy if exists "user_events_select_own" on public.user_events';
    execute 'drop policy if exists "user_events_insert_own" on public.user_events';
    execute 'create policy "user_events_select_own" on public.user_events for select to authenticated using ((select auth.uid()) = user_id)';
    execute 'create policy "user_events_insert_own" on public.user_events for insert to authenticated with check ((select auth.uid()) = user_id)';
  end if;

  if to_regclass('public.user_subscriptions') is not null then
    execute 'alter table public.user_subscriptions enable row level security';
    execute 'revoke all on table public.user_subscriptions from public, anon, authenticated';
    execute 'grant select on table public.user_subscriptions to authenticated';
    execute 'drop policy if exists "user_subscriptions_select_own" on public.user_subscriptions';
    execute 'create policy "user_subscriptions_select_own" on public.user_subscriptions for select to authenticated using ((select auth.uid()) = user_id)';
  end if;

  if to_regclass('public.user_entitlements') is not null then
    execute 'alter table public.user_entitlements enable row level security';
    execute 'revoke all on table public.user_entitlements from public, anon, authenticated';
    execute 'grant select on table public.user_entitlements to authenticated';
    execute 'drop policy if exists "user_entitlements_select_own" on public.user_entitlements';
    execute 'create policy "user_entitlements_select_own" on public.user_entitlements for select to authenticated using ((select auth.uid()) = user_id)';
  end if;

  if to_regclass('public.usage_counters') is not null then
    execute 'alter table public.usage_counters enable row level security';
    execute 'revoke all on table public.usage_counters from public, anon';
    execute 'grant select, insert, update on table public.usage_counters to authenticated';
    execute 'drop policy if exists "usage_counters_select_own" on public.usage_counters';
    execute 'drop policy if exists "usage_counters_insert_own" on public.usage_counters';
    execute 'drop policy if exists "usage_counters_update_own" on public.usage_counters';
    execute 'create policy "usage_counters_select_own" on public.usage_counters for select to authenticated using ((select auth.uid()) = user_id)';
    execute 'create policy "usage_counters_insert_own" on public.usage_counters for insert to authenticated with check ((select auth.uid()) = user_id)';
    execute 'create policy "usage_counters_update_own" on public.usage_counters for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)';
  end if;

  if to_regclass('public.paywall_events') is not null then
    execute 'alter table public.paywall_events enable row level security';
    execute 'revoke all on table public.paywall_events from public, anon';
    execute 'grant select, insert on table public.paywall_events to authenticated';
    execute 'drop policy if exists "paywall_events_select_own" on public.paywall_events';
    execute 'drop policy if exists "paywall_events_insert_own" on public.paywall_events';
    execute 'create policy "paywall_events_select_own" on public.paywall_events for select to authenticated using ((select auth.uid()) = user_id)';
    execute 'create policy "paywall_events_insert_own" on public.paywall_events for insert to authenticated with check ((select auth.uid()) = user_id)';
  end if;

  if to_regclass('public.animal_photos') is not null then
    execute 'alter table public.animal_photos enable row level security';
    execute 'revoke all on table public.animal_photos from public, anon';
    execute 'grant select, insert, update, delete on table public.animal_photos to authenticated';
    execute 'drop policy if exists "animal_photos_owner_select" on public.animal_photos';
    execute 'drop policy if exists "animal_photos_owner_insert" on public.animal_photos';
    execute 'drop policy if exists "animal_photos_owner_update" on public.animal_photos';
    execute 'drop policy if exists "animal_photos_owner_delete" on public.animal_photos';
    execute 'create policy "animal_photos_owner_select" on public.animal_photos for select to authenticated using ((select auth.uid()) = user_id)';
    execute 'create policy "animal_photos_owner_insert" on public.animal_photos for insert to authenticated with check ((select auth.uid()) = user_id)';
    execute 'create policy "animal_photos_owner_update" on public.animal_photos for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)';
    execute 'create policy "animal_photos_owner_delete" on public.animal_photos for delete to authenticated using ((select auth.uid()) = user_id)';
  end if;
end $$;

-- Onboarding RPC: callable only by signed-in users and without SECURITY DEFINER privileges.
do $$
begin
  if to_regprocedure('public.complete_user_onboarding(uuid,text,text[],integer[],text[])') is not null then
    execute 'alter function public.complete_user_onboarding(uuid,text,text[],integer[],text[]) security invoker';
    execute 'revoke all on function public.complete_user_onboarding(uuid,text,text[],integer[],text[]) from public, anon, authenticated';
    execute 'grant execute on function public.complete_user_onboarding(uuid,text,text[],integer[],text[]) to authenticated';
  end if;
end $$;

notify pgrst, 'reload schema';

commit;
