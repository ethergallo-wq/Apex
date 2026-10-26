-- Disposable local database only. Never run this fixture against Supabase.
do $$ begin
  if current_database() <> 'animaldex_review' then
    raise exception 'Use the disposable animaldex_review database';
  end if;
end $$;
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
grant usage on schema auth to anon, authenticated;
create table public.user_profiles (
  user_id uuid primary key references auth.users(id), username text, nickname text,
  avatar_url text, featured_badge_id text, profile_background_image text,
  email text, phone text, date_of_birth date, onboarding_answers jsonb
);
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id), addressee_id uuid not null references auth.users(id),
  status text not null default 'pending' check (status in ('pending','accepted','blocked','declined')),
  accepted_at timestamptz, updated_at timestamptz default now()
);
create table public.user_blocks (
  blocker_id uuid references auth.users(id), blocked_id uuid references auth.users(id), primary key(blocker_id,blocked_id)
);
create table public.user_animals (user_id uuid, animal_id bigint, unlock_status text, documented_at timestamptz, primary key(user_id,animal_id));
create table public.user_badges (user_id uuid, badge_id text, primary key(user_id,badge_id));
create table public.user_destinations (user_id uuid, iso text, primary key(user_id,iso));
create table public.usage_counters (user_id uuid, used_value integer);
create table public.social_event_reactions (user_id uuid);
create table public.social_notifications (actor_id uuid, event_id uuid, friendship_id uuid);
create table public.user_reports (event_id uuid, reported_user_id uuid);
grant all on all tables in schema public to authenticated;
alter table public.user_profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.user_blocks enable row level security;
alter table public.user_animals enable row level security;
alter table public.user_badges enable row level security;
alter table public.user_destinations enable row level security;
create policy user_profiles_select_authenticated_social on public.user_profiles for select to authenticated using (true);
create policy user_profiles_update_own on public.user_profiles for update to authenticated using (auth.uid()=user_id) with check(auth.uid()=user_id);
create policy friendships_select_involved on public.friendships for select to authenticated using (auth.uid()=requester_id or auth.uid()=addressee_id);
create policy user_blocks_select_own on public.user_blocks for select to authenticated using (auth.uid()=blocker_id);
insert into auth.users values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222'),('33333333-3333-4333-8333-333333333333');
insert into public.user_profiles(user_id,username,nickname,email) values
('11111111-1111-4111-8111-111111111111','alice','Alice','private-alice@example.test'),
('22222222-2222-4222-8222-222222222222','bob','Bob','private-bob@example.test'),
('33333333-3333-4333-8333-333333333333','carol','Carol','private-carol@example.test');
insert into public.user_animals values
('11111111-1111-4111-8111-111111111111',1,'seen',null),
('11111111-1111-4111-8111-111111111111',2,'collected',now());
insert into public.user_badges values ('11111111-1111-4111-8111-111111111111','test-badge');
insert into public.user_destinations values ('11111111-1111-4111-8111-111111111111','IT');
