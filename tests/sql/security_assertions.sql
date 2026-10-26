-- Run after the migration, on the disposable fixture. All assertions roll back.
begin;
do $$ begin
  if current_database() <> 'animaldex_review' then raise exception 'Use animaldex_review'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
  assert (select count(*) from public.user_profiles) = 1, 'Private profiles leaked';
  assert (select email from public.user_profiles) = 'private-alice@example.test', 'Owner cannot read own profile';
  assert (select count(*) from public.get_social_profiles(array['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222']::uuid[]))=2, 'Safe profiles missing';
  assert not (select to_jsonb(p) ? 'email' from public.get_social_profiles(array['22222222-2222-4222-8222-222222222222']::uuid[]) p), 'Email returned by RPC';
  begin
    insert into public.friendships(requester_id,addressee_id,status) values(auth.uid(),'22222222-2222-4222-8222-222222222222','accepted');
    raise exception 'Forged acceptance allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.usage_counters values(auth.uid(),0);
    raise exception 'Client can reset usage counter';
  exception when insufficient_privilege then null; end;
  assert not has_table_privilege(current_user,'public.friendships','TRUNCATE'), 'TRUNCATE still granted';
end $$;
insert into public.friendships(id,requester_id,addressee_id) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',auth.uid(),'22222222-2222-4222-8222-222222222222');
update public.friendships set status='accepted' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
do $$ begin assert (select status from public.friendships where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')='pending', 'Requester accepted own request'; end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
  begin
    update public.friendships set requester_id='33333333-3333-4333-8333-333333333333' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    raise exception 'Friendship participants can be reassigned';
  exception when insufficient_privilege then null; end;
end $$;
update public.friendships set status='accepted',accepted_at=now() where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
do $$ begin
  assert (select status from public.friendships where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')='accepted', 'Recipient cannot accept';
  assert (select count(*) from public.user_profiles)=1, 'Private fields visible to friends';
  assert (select count(*) from public.user_animals)=2, 'Accepted friend progress missing';
  assert (select seen_count from public.get_social_peer_stats(auth.uid()) where user_id='11111111-1111-4111-8111-111111111111')=2, 'Wrong seen count';
  assert (select captured_count from public.get_social_peer_stats(auth.uid()) where user_id='11111111-1111-4111-8111-111111111111')=1, 'Wrong capture count';
  assert (select count(*) from public.get_social_peer_stats('11111111-1111-4111-8111-111111111111'))=0, 'Viewer impersonation allowed';
end $$;
reset role;
insert into public.user_blocks values('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222'),('33333333-3333-4333-8333-333333333333','22222222-2222-4222-8222-222222222222');
set local role authenticated;
do $$ begin
  assert (select count(*) from public.user_blocks)=0, 'Fixture no longer checks invisible reverse blocks';
  assert (select count(*) from public.get_social_profiles(array['11111111-1111-4111-8111-111111111111']::uuid[]))=0, 'Blocked profile leaked';
  assert (select count(*) from public.user_animals)=0, 'Blocked progress leaked';
  assert (select count(*) from public.get_social_peer_stats(auth.uid()))=1, 'Blocked peer stats leaked';
  begin
    insert into public.friendships(requester_id,addressee_id) values(auth.uid(),'33333333-3333-4333-8333-333333333333');
    raise exception 'Reverse block bypassed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
  assert not has_function_privilege(current_user,'public.get_social_peer_stats(uuid)','EXECUTE'), 'Anonymous stats execution allowed';
  assert not has_function_privilege(current_user,'public.get_social_profiles(uuid[])','EXECUTE'), 'Anonymous profiles execution allowed';
end $$;
rollback;
select 'All security assertions passed' as result;
