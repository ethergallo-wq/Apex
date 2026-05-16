-- Apex social layer: friends, friend requests and lightweight challenges.
-- Run this once in Supabase SQL Editor.

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accepted_at timestamptz,
  constraint friendships_not_self check (requester_id <> addressee_id)
);

create unique index if not exists friendships_unique_pair
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

create table if not exists public.friend_challenges (
  id uuid primary key default gen_random_uuid(),
  friendship_id uuid not null references public.friendships(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  challenge_type text not null default 'weekly' check (challenge_type in ('weekly','badge','territory','capture')),
  target_value integer not null default 1,
  progress_requester integer not null default 0,
  progress_addressee integer not null default 0,
  status text not null default 'active' check (status in ('active','completed','archived')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.friendships enable row level security;
alter table public.friend_challenges enable row level security;
alter table public.user_profiles enable row level security;

drop policy if exists "friendships_select_involved" on public.friendships;
create policy "friendships_select_involved"
on public.friendships for select
to authenticated
using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "friendships_insert_own_request" on public.friendships;
create policy "friendships_insert_own_request"
on public.friendships for insert
to authenticated
with check (auth.uid() = requester_id and requester_id <> addressee_id);

drop policy if exists "friendships_update_involved" on public.friendships;
create policy "friendships_update_involved"
on public.friendships for update
to authenticated
using (auth.uid() = requester_id or auth.uid() = addressee_id)
with check (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "friendships_delete_involved" on public.friendships;
create policy "friendships_delete_involved"
on public.friendships for delete
to authenticated
using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "friend_challenges_select_friends" on public.friend_challenges;
create policy "friend_challenges_select_friends"
on public.friend_challenges for select
to authenticated
using (
  exists (
    select 1 from public.friendships f
    where f.id = friendship_id
      and f.status = 'accepted'
      and (f.requester_id = auth.uid() or f.addressee_id = auth.uid())
  )
);

drop policy if exists "friend_challenges_insert_friends" on public.friend_challenges;
create policy "friend_challenges_insert_friends"
on public.friend_challenges for insert
to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.friendships f
    where f.id = friendship_id
      and f.status = 'accepted'
      and (f.requester_id = auth.uid() or f.addressee_id = auth.uid())
  )
);

drop policy if exists "friend_challenges_update_friends" on public.friend_challenges;
create policy "friend_challenges_update_friends"
on public.friend_challenges for update
to authenticated
using (
  exists (
    select 1 from public.friendships f
    where f.id = friendship_id
      and f.status = 'accepted'
      and (f.requester_id = auth.uid() or f.addressee_id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.friendships f
    where f.id = friendship_id
      and f.status = 'accepted'
      and (f.requester_id = auth.uid() or f.addressee_id = auth.uid())
  )
);

drop policy if exists "user_profiles_select_authenticated_social" on public.user_profiles;
create policy "user_profiles_select_authenticated_social"
on public.user_profiles for select
to authenticated
using (true);
