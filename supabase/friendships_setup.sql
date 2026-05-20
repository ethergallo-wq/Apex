-- Animaldex social layer: safe friendships, activity events, preset reactions and notifications.
-- Run in Supabase SQL Editor after the base Animaldex schema exists.

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accepted_at timestamptz,
  constraint friendships_not_self check (requester_id <> addressee_id)
);

create unique index if not exists friendships_unique_pair
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists friendships_requester_idx on public.friendships (requester_id, status);
create index if not exists friendships_addressee_idx on public.friendships (addressee_id, status);

create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_blocks_not_self check (blocker_id <> blocked_id),
  constraint user_blocks_unique unique (blocker_id, blocked_id)
);

create table if not exists public.social_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('rare_capture','legendary_capture','badge_earned','milestone')),
  animal_id bigint,
  animal_name text,
  rarity text,
  badge_id text,
  badge_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists social_events_user_created_idx on public.social_events (user_id, created_at desc);
create unique index if not exists social_events_unique_capture
  on public.social_events (user_id, event_type, animal_id);
create unique index if not exists social_events_unique_badge
  on public.social_events (user_id, event_type, badge_id);

create table if not exists public.social_event_reactions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.social_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_key text not null check (reaction_key in ('wow','trophy','spark','tracks','roar','gem')),
  created_at timestamptz not null default now(),
  constraint social_event_reactions_unique unique (event_id, user_id, reaction_key)
);

create index if not exists social_event_reactions_event_idx on public.social_event_reactions (event_id, created_at desc);

create table if not exists public.social_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  notification_type text not null check (notification_type in ('friend_request','friend_accepted','reaction','rare_capture','legendary_capture','badge_earned')),
  event_id uuid references public.social_events(id) on delete cascade,
  friendship_id uuid references public.friendships(id) on delete cascade,
  reaction_key text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists social_notifications_user_created_idx on public.social_notifications (user_id, read_at, created_at desc);

create table if not exists public.user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_user_id uuid references auth.users(id) on delete set null,
  event_id uuid references public.social_events(id) on delete set null,
  reason text not null check (reason in ('inappropriate_profile','suspicious_activity','underage_safety','other')),
  status text not null default 'open' check (status in ('open','reviewing','closed')),
  created_at timestamptz not null default now()
);

create index if not exists user_reports_reporter_idx on public.user_reports (reporter_id, created_at desc);
create index if not exists user_profiles_username_search_idx on public.user_profiles (lower(username));
create index if not exists user_profiles_nickname_search_idx on public.user_profiles (lower(nickname));

alter table public.friendships enable row level security;
alter table public.user_blocks enable row level security;
alter table public.social_events enable row level security;
alter table public.social_event_reactions enable row level security;
alter table public.social_notifications enable row level security;
alter table public.user_reports enable row level security;
alter table public.user_profiles enable row level security;

grant select, insert, update, delete on public.friendships to authenticated;
grant select, insert, delete on public.user_blocks to authenticated;
grant select, insert on public.social_events to authenticated;
grant select, insert, delete on public.social_event_reactions to authenticated;
grant select, insert, update on public.social_notifications to authenticated;
grant insert, select on public.user_reports to authenticated;
grant select, insert, update on public.user_profiles to authenticated;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'email'
  ) then
    update public.user_profiles
    set
      username = coalesce(nullif(trim(username), ''), nullif(split_part(email, '@', 1), ''), 'explorer_' || left(user_id::text, 8)),
      nickname = coalesce(nullif(trim(nickname), ''), nullif(trim(username), ''), nullif(split_part(email, '@', 1), ''), 'Explorer ' || left(user_id::text, 4)),
      updated_at = coalesce(updated_at, now())
    where nullif(trim(coalesce(username, '')), '') is null
       or nullif(trim(coalesce(nickname, '')), '') is null;
  else
    update public.user_profiles
    set
      username = coalesce(nullif(trim(username), ''), 'explorer_' || left(user_id::text, 8)),
      nickname = coalesce(nullif(trim(nickname), ''), nullif(trim(username), ''), 'Explorer ' || left(user_id::text, 4)),
      updated_at = coalesce(updated_at, now())
    where nullif(trim(coalesce(username, '')), '') is null
       or nullif(trim(coalesce(nickname, '')), '') is null;
  end if;
end $$;

drop policy if exists "friendships_select_involved" on public.friendships;
create policy "friendships_select_involved"
on public.friendships for select
to authenticated
using ((select auth.uid()) = requester_id or (select auth.uid()) = addressee_id);

drop policy if exists "friendships_insert_own_request" on public.friendships;
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
);

drop policy if exists "friendships_update_addressee_accepts" on public.friendships;
create policy "friendships_update_addressee_accepts"
on public.friendships for update
to authenticated
using ((select auth.uid()) = addressee_id and status = 'pending')
with check ((select auth.uid()) = addressee_id and status = 'accepted');

drop policy if exists "friendships_delete_involved" on public.friendships;
create policy "friendships_delete_involved"
on public.friendships for delete
to authenticated
using ((select auth.uid()) = requester_id or (select auth.uid()) = addressee_id);

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

drop policy if exists "social_events_select_owner_or_friends" on public.social_events;
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
);

drop policy if exists "social_events_insert_own" on public.social_events;
create policy "social_events_insert_own"
on public.social_events for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "social_event_reactions_select_visible_events" on public.social_event_reactions;
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
);

drop policy if exists "social_event_reactions_insert_friends_only" on public.social_event_reactions;
create policy "social_event_reactions_insert_friends_only"
on public.social_event_reactions for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.social_events e
    join public.friendships f
      on f.status = 'accepted'
     and ((f.requester_id = user_id and f.addressee_id = e.user_id)
       or (f.addressee_id = user_id and f.requester_id = e.user_id))
    where e.id = event_id
      and e.user_id <> user_id
  )
);

drop policy if exists "social_event_reactions_delete_own" on public.social_event_reactions;
create policy "social_event_reactions_delete_own"
on public.social_event_reactions for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "social_notifications_select_own" on public.social_notifications;
create policy "social_notifications_select_own"
on public.social_notifications for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "social_notifications_insert_involved" on public.social_notifications;
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
      and exists (
        select 1 from public.social_events e
        where e.id = event_id
          and e.user_id = user_id
      )
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
);

drop policy if exists "social_notifications_update_read_own" on public.social_notifications;
create policy "social_notifications_update_read_own"
on public.social_notifications for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "user_reports_insert_own" on public.user_reports;
create policy "user_reports_insert_own"
on public.user_reports for insert
to authenticated
with check ((select auth.uid()) = reporter_id);

drop policy if exists "user_reports_select_own" on public.user_reports;
create policy "user_reports_select_own"
on public.user_reports for select
to authenticated
using ((select auth.uid()) = reporter_id);

do $$
begin
  if to_regclass('public.user_animals') is not null then
    execute 'alter table public.user_animals enable row level security';
    execute 'grant select on public.user_animals to authenticated';
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
end $$;
