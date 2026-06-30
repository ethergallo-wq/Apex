-- Fix user_badges foreign key mismatch with local AWARD_RULES badge ids.
-- Run once in Supabase SQL Editor if you see:
-- insert or update on table "user_badges" violates foreign key constraint "user_badges_badge_id_fkey"

begin;

alter table if exists public.user_badges
  drop constraint if exists user_badges_badge_id_fkey;

-- If public.badges exists, keep catalog in sync with app badge ids (text primary key assumed).
do $$
begin
  if to_regclass('public.badges') is not null then
    execute $seed$
      insert into public.badges (id)
      select distinct ub.badge_id
      from public.user_badges ub
      left join public.badges b on b.id = ub.badge_id
      where b.id is null
      on conflict do nothing
    $seed$;
  end if;
exception
  when undefined_column then
    null;
  when others then
    raise notice 'Badge catalog seed skipped: %', sqlerrm;
end $$;

notify pgrst, 'reload schema';

commit;
