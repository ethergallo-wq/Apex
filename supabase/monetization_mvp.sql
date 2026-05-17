-- Animaldex monetization MVP.
-- Run in Supabase SQL Editor after the base Animaldex schema exists.
-- Goal: fast monetization learning with simple event tracking, onboarding segmentation,
-- entitlements, usage counters and paywall/conversion events.

alter table if exists public.user_profiles
  add column if not exists acquisition_source text,
  add column if not exists acquisition_source_other text,
  add column if not exists water_activity_interests text[] not null default '{}'::text[],
  add column if not exists monetization_segment text,
  add column if not exists premium_score numeric not null default 0;

alter table if exists public.animal_photos
  add column if not exists storage_path text,
  add column if not exists public_url text,
  add column if not exists photo_source text,
  add column if not exists recognition_status text,
  add column if not exists ai_model text,
  add column if not exists ai_latency_ms integer,
  add column if not exists user_corrected_ai boolean not null default false,
  add column if not exists location_accuracy numeric,
  add column if not exists is_sensitive_location boolean not null default false;

create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null,
  source_screen text,
  session_id text,
  app_version text,
  plan text not null default 'free',
  animal_id bigint,
  previous_status text,
  next_status text,
  rarity text,
  country_iso text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_events_user_created_idx
  on public.user_events (user_id, created_at desc);
create index if not exists user_events_event_created_idx
  on public.user_events (event_name, created_at desc);
create index if not exists user_events_payload_gin_idx
  on public.user_events using gin (payload);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'manual',
  provider_customer_id text,
  provider_subscription_id text,
  plan_key text not null default 'free',
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_subscriptions_status_check check (status in ('trialing','active','past_due','cancelled','expired','free'))
);

create index if not exists user_subscriptions_user_status_idx
  on public.user_subscriptions (user_id, status, current_period_end desc);

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_key text not null,
  limit_value integer,
  used_value integer not null default 0,
  resets_at timestamptz,
  source text not null default 'plan',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_entitlements_unique unique (user_id, entitlement_key)
);

create table if not exists public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  counter_key text not null,
  period_start date not null,
  period_end date not null,
  used_value integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint usage_counters_unique unique (user_id, counter_key, period_start, period_end)
);

create table if not exists public.paywall_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null,
  feature_key text not null,
  source_screen text,
  plan_key text,
  price_key text,
  converted boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists paywall_events_user_created_idx
  on public.paywall_events (user_id, created_at desc);
create index if not exists paywall_events_feature_created_idx
  on public.paywall_events (feature_key, created_at desc);

alter table public.user_events enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.user_entitlements enable row level security;
alter table public.usage_counters enable row level security;
alter table public.paywall_events enable row level security;

grant select, insert on public.user_events to authenticated;
grant select on public.user_subscriptions to authenticated;
grant select on public.user_entitlements to authenticated;
grant select, insert, update on public.usage_counters to authenticated;
grant select, insert on public.paywall_events to authenticated;

drop policy if exists "user_events_select_own" on public.user_events;
create policy "user_events_select_own"
on public.user_events for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user_events_insert_own" on public.user_events;
create policy "user_events_insert_own"
on public.user_events for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "user_subscriptions_select_own" on public.user_subscriptions;
create policy "user_subscriptions_select_own"
on public.user_subscriptions for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user_entitlements_select_own" on public.user_entitlements;
create policy "user_entitlements_select_own"
on public.user_entitlements for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "usage_counters_select_own" on public.usage_counters;
create policy "usage_counters_select_own"
on public.usage_counters for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "usage_counters_insert_own" on public.usage_counters;
create policy "usage_counters_insert_own"
on public.usage_counters for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "usage_counters_update_own" on public.usage_counters;
create policy "usage_counters_update_own"
on public.usage_counters for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "paywall_events_select_own" on public.paywall_events;
create policy "paywall_events_select_own"
on public.paywall_events for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "paywall_events_insert_own" on public.paywall_events;
create policy "paywall_events_insert_own"
on public.paywall_events for insert
to authenticated
with check ((select auth.uid()) = user_id);

