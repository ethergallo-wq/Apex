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

alter table public.user_profiles
  add column if not exists featured_badge_id text,
  add column if not exists profile_background_image text,
  add column if not exists avatar_url text;

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

insert into public.user_profiles (user_id, username, nickname)
with missing_auth_users as (
  select
    u.id as user_id,
    u.email,
    u.created_at,
    coalesce(
      nullif(regexp_replace(lower(split_part(coalesce(u.email, ''), '@', 1)), '[^a-z0-9._-]', '', 'g'), ''),
      'explorer_' || left(u.id::text, 8)
    ) as base_username
  from auth.users u
  left join public.user_profiles p on p.user_id = u.id
  where p.user_id is null
),
ranked as (
  select
    *,
    row_number() over (partition by base_username order by created_at, user_id) as username_rank
  from missing_auth_users
)
select
  user_id,
  case
    when username_rank = 1
      and not exists (
        select 1 from public.user_profiles existing
        where lower(existing.username) = ranked.base_username
      )
      then base_username
    else base_username || '_' || left(user_id::text, 8)
  end as username,
  case
    when username_rank = 1
      and not exists (
        select 1 from public.user_profiles existing
        where lower(existing.username) = ranked.base_username
      )
      then base_username
    else base_username || '_' || left(user_id::text, 8)
  end as nickname
from ranked
on conflict (user_id) do nothing;

create schema if not exists private;

create or replace function private.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
begin
  base_username := coalesce(
    nullif(regexp_replace(lower(split_part(coalesce(new.email, ''), '@', 1)), '[^a-z0-9._-]', '', 'g'), ''),
    'explorer_' || left(new.id::text, 8)
  );
  if exists (select 1 from public.user_profiles p where lower(p.username) = base_username) then
    final_username := base_username || '_' || left(new.id::text, 8);
  else
    final_username := base_username;
  end if;

  insert into public.user_profiles (user_id, username, nickname)
  values (new.id, final_username, final_username)
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
    select lower(left(regexp_replace(regexp_replace(trim(coalesce(p_query, '')), '^@+', ''), '[%,()]', '', 'g'), 40)) as q
  ),
  profile_rows as (
    select
      p.user_id,
      nullif(trim(p.username), '') as username,
      nullif(trim(p.nickname), '') as nickname,
      p.avatar_url,
      p.featured_badge_id,
      p.profile_background_image,
      0 as source_priority
    from public.user_profiles p
  ),
  auth_rows as (
    select
      au.id as user_id,
      coalesce(
        nullif(trim(up.username), ''),
        nullif(trim(au.raw_user_meta_data->>'username'), ''),
        nullif(trim(au.raw_user_meta_data->>'preferred_username'), ''),
        nullif(trim(split_part(au.email, '@', 1)), ''),
        'explorer-' || left(au.id::text, 4)
      ) as username,
      coalesce(
        nullif(trim(up.nickname), ''),
        nullif(trim(up.username), ''),
        nullif(trim(au.raw_user_meta_data->>'nickname'), ''),
        nullif(trim(au.raw_user_meta_data->>'name'), ''),
        nullif(trim(au.raw_user_meta_data->>'full_name'), ''),
        nullif(trim(split_part(au.email, '@', 1)), ''),
        'Explorer ' || left(au.id::text, 4)
      ) as nickname,
      up.avatar_url,
      up.featured_badge_id,
      up.profile_background_image,
      1 as source_priority
    from auth.users au
    left join public.user_profiles up on up.user_id = au.id
  ),
  searchable as (
    select * from profile_rows
    union all
    select * from auth_rows
  ),
  matched as (
    select
      s.*,
      row_number() over (partition by s.user_id order by s.source_priority) as dedupe_rank
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
  where m.dedupe_rank = 1
  order by
    case when lower(coalesce(m.username, '')) = clean.q or lower(coalesce(m.nickname, '')) = clean.q then 0 else 1 end,
    case when lower(coalesce(m.username, '')) like clean.q || '%' or lower(coalesce(m.nickname, '')) like clean.q || '%' then 0 else 1 end,
    lower(coalesce(m.username, m.nickname, ''))
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
