-- No D1 rows are copied here. This is a new, explicitly provisioned Supabase backend.
-- Engine validation runs in the Edge Function; clients can never submit state to RPCs.
begin;

create schema crosswalk_private;
revoke all on schema crosswalk_private from public, anon, authenticated;
grant usage on schema crosswalk_private to service_role;
-- Only the identity/status columns needed for existence and aggregate counts.
grant usage on schema auth to service_role;
grant select (id, is_anonymous, email_confirmed_at) on auth.users to service_role;

create table crosswalk_private.rooms (
  code text primary key check (code ~ '^[A-Z0-9]{6}$'),
  state jsonb not null check (jsonb_typeof(state) = 'object' and octet_length(state::text) <= 1048576),
  version bigint not null default 0 check (version between 0 and 9007199254740991),
  updated_at bigint not null default (extract(epoch from clock_timestamp()) * 1000)::bigint
);
create table crosswalk_private.room_members (
  room_code text not null references crosswalk_private.rooms(code) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  primary key (room_code, user_id)
);
create index crosswalk_members_user_room on crosswalk_private.room_members (user_id, room_code);
create index crosswalk_rooms_recent on crosswalk_private.rooms (updated_at desc, code);
create table crosswalk_private.request_receipts (
  user_id uuid not null references auth.users(id) on delete restrict,
  request_id text not null check (length(request_id) between 1 and 80),
  fingerprint text not null check (fingerprint ~ '^[a-f0-9]{64}$'),
  room_code text not null references crosswalk_private.rooms(code) on delete restrict,
  operation text not null check (operation in ('create', 'join', 'start', 'move')),
  applied_version bigint not null check (applied_version >= 0),
  primary key (user_id, request_id)
);
create index crosswalk_receipts_room on crosswalk_private.request_receipts (room_code);
-- Count participating identities, not visits, people, sessions, names or devices.
-- No analytics-specific timestamps, fingerprints, IP addresses or event logs.
create table crosswalk_private.participating_users (
  user_id uuid primary key references auth.users(id) on delete restrict
);

alter table crosswalk_private.rooms enable row level security;
alter table crosswalk_private.room_members enable row level security;
alter table crosswalk_private.request_receipts enable row level security;
alter table crosswalk_private.participating_users enable row level security;
-- Deliberately no client policies: the trusted Edge service is the only reader/writer.
revoke all on all tables in schema crosswalk_private from public, anon, authenticated;
grant select, insert, update on all tables in schema crosswalk_private to service_role;

create function crosswalk_private.require_actor(p_actor uuid) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if p_actor is null or not exists (select 1 from auth.users where id = p_actor) then
    raise exception 'Saved-seat identity is unavailable' using errcode = '42501';
  end if;
end;
$$;

create function crosswalk_private.room_record(p_code text) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object('code', code, 'state', state, 'version', version, 'updated_at', updated_at)
  from crosswalk_private.rooms where code = p_code;
$$;

-- This endpoint is a service-only internal fetch. Edge returns a sanitized member
-- view or limited lobby preview; this full state is never returned to the browser.
create function public.crosswalk_read_room(p_actor uuid, p_code text) returns jsonb
language plpgsql security invoker set search_path = '' as $$
begin
  perform crosswalk_private.require_actor(p_actor);
  if p_code is null or p_code !~ '^[A-Z0-9]{6}$' then raise exception 'Invalid room code' using errcode = '22023'; end if;
  return crosswalk_private.room_record(p_code);
end;
$$;

create function public.crosswalk_history(p_actor uuid, p_before_updated_at bigint default null, p_before_code text default null) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare v_rooms jsonb;
begin
  perform crosswalk_private.require_actor(p_actor);
  if (p_before_updated_at is null) <> (p_before_code is null)
    or (p_before_updated_at is not null and (p_before_updated_at < 0 or p_before_code !~ '^[A-Z0-9]{6}$')) then
    raise exception 'Invalid history cursor' using errcode = '22023';
  end if;
  select coalesce(jsonb_agg(summary order by updated_at desc, code), '[]'::jsonb) into v_rooms from (
    select r.updated_at, r.code, jsonb_build_object(
      'code', r.code, 'mode', r.state->>'mode', 'status', r.state->>'status',
      'round', r.state->'round', 'maxRounds', r.state->'maxRounds',
      'version', r.version, 'updatedAt', r.updated_at,
      'names', coalesce((select jsonb_agg(p->>'name' order by ordinal)
        from jsonb_array_elements(r.state->'players') with ordinality as players(p, ordinal)
        where (r.state->'members'->p_actor::text) ? (p->>'id')), '[]'::jsonb)
    ) as summary
    from crosswalk_private.rooms r
    join crosswalk_private.room_members m on m.room_code = r.code and m.user_id = p_actor
    where p_before_updated_at is null or r.updated_at < p_before_updated_at or (r.updated_at = p_before_updated_at and r.code > p_before_code)
    order by r.updated_at desc, r.code limit 21
  ) own_rooms;
  return v_rooms;
end;
$$;

create function public.crosswalk_receipt(p_actor uuid, p_request_id text, p_fingerprint text) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare receipt crosswalk_private.request_receipts%rowtype;
begin
  perform crosswalk_private.require_actor(p_actor);
  if p_request_id is null or length(p_request_id) not between 1 and 80 or p_fingerprint is null or p_fingerprint !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid saved-action identity' using errcode = '22023';
  end if;
  select * into receipt from crosswalk_private.request_receipts where user_id = p_actor and request_id = p_request_id;
  if not found then return jsonb_build_object('kind', 'missing'); end if;
  if receipt.fingerprint <> p_fingerprint then return jsonb_build_object('kind', 'request_mismatch'); end if;
  if not exists (select 1 from crosswalk_private.room_members where room_code = receipt.room_code and user_id = p_actor) then
    return jsonb_build_object('kind', 'forbidden');
  end if;
  return jsonb_build_object('kind', 'ok', 'room', crosswalk_private.room_record(receipt.room_code),
    'replayed', true, 'appliedVersion', receipt.applied_version);
end;
$$;

create function public.crosswalk_commit(
  p_actor uuid, p_request_id text, p_fingerprint text, p_op text,
  p_code text, p_expected_version bigint, p_next_state jsonb
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  v_receipt jsonb;
  v_old crosswalk_private.rooms%rowtype;
  v_version bigint;
  v_key text;
  v_ids jsonb;
  v_inserted integer;
  v_now bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
begin
  perform crosswalk_private.require_actor(p_actor);
  if p_request_id is null or length(p_request_id) not between 1 and 80 or p_fingerprint is null or p_fingerprint !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid saved-action identity' using errcode = '22023';
  end if;
  -- Same owner + request serializes even before a new room exists. The row lock
  -- below serializes competing commands from different owners for one room.
  perform pg_advisory_xact_lock(hashtextextended(p_actor::text || ':' || p_request_id, 0));
  v_receipt := public.crosswalk_receipt(p_actor, p_request_id, p_fingerprint);
  if v_receipt->>'kind' <> 'missing' then return v_receipt; end if;
  if p_op is null or p_op not in ('create','join','start','move') or p_code is null or p_code !~ '^[A-Z0-9]{6}$' then
    raise exception 'Invalid command' using errcode = '22023';
  end if;
  if p_next_state is null or jsonb_typeof(p_next_state) is distinct from 'object'
    or octet_length(p_next_state::text) > 1048576
    or (p_next_state->>'code') is distinct from p_code
    or jsonb_typeof(p_next_state->'members') is distinct from 'object'
    or jsonb_typeof(p_next_state->'players') is distinct from 'array'
    or (p_next_state->>'mode') is null or (p_next_state->>'mode') not in ('online','hotseat')
    or (p_next_state->>'status') is null or (p_next_state->>'status') not in ('lobby','playing','finished')
    or (p_next_state->>'host') is null then
    raise exception 'Invalid authoritative state' using errcode = '22023';
  end if;
  if jsonb_array_length(p_next_state->'players') not between 1 and 4 then raise exception 'Invalid player count' using errcode = '22023'; end if;
  if jsonb_typeof(p_next_state->'members'->p_actor::text) is distinct from 'array'
    or jsonb_typeof(p_next_state->'members'->(p_next_state->>'host')) is distinct from 'array' then
    return jsonb_build_object('kind', 'forbidden');
  end if;
  -- Membership must refer to unique actual player IDs; every owner must be a
  -- real Auth user. This also makes histories/counts agree with saved state.
  for v_key, v_ids in select key, value from jsonb_each(p_next_state->'members') loop
    if v_key !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or jsonb_typeof(v_ids) is distinct from 'array' then raise exception 'Invalid member' using errcode = '22023'; end if;
    perform crosswalk_private.require_actor(v_key::uuid);
    if jsonb_array_length(v_ids) not between 1 and 4 or exists (
      select 1 from jsonb_array_elements_text(v_ids) as member_id(id)
      where not exists (select 1 from jsonb_array_elements(p_next_state->'players') as player_state(p) where p->>'id' = member_id.id)
    ) then raise exception 'Invalid seat' using errcode = '22023'; end if;
  end loop;
  if (select count(*) from jsonb_each(p_next_state->'members') as member(key, ids), lateral jsonb_array_elements_text(ids))
      <> jsonb_array_length(p_next_state->'players')
    or (select count(distinct id) from jsonb_each(p_next_state->'members') as member(key, ids), lateral jsonb_array_elements_text(ids) as seat(id))
      <> jsonb_array_length(p_next_state->'players') then raise exception 'Seat assignment mismatch' using errcode = '22023'; end if;

  if p_op = 'create' then
    if p_expected_version is not null or p_next_state->>'host' <> p_actor::text
      or p_next_state->>'creationRequestId' is distinct from p_request_id
      or (select count(*) from jsonb_each(p_next_state->'members')) <> 1 then
      return jsonb_build_object('kind', 'forbidden');
    end if;
    insert into crosswalk_private.rooms (code, state, version, updated_at) values (p_code, p_next_state, 0, v_now) on conflict (code) do nothing;
    get diagnostics v_inserted = row_count;
    if v_inserted = 0 then return jsonb_build_object('kind', 'code_taken'); end if;
    v_version := 0;
  else
    select * into v_old from crosswalk_private.rooms where code = p_code for update;
    if not found then return jsonb_build_object('kind', 'missing'); end if;
    if p_expected_version is null or v_old.version <> p_expected_version then return jsonb_build_object('kind', 'stale'); end if;
    -- Room ownership, mode, players' IDs and engine version flags cannot be
    -- arbitrarily replaced by a server integration mistake.
    if (p_next_state->'host') is distinct from (v_old.state->'host')
      or (p_next_state->'mode') is distinct from (v_old.state->'mode')
      or (p_next_state->'creationRequestId') is distinct from (v_old.state->'creationRequestId')
      or exists (select 1 from unnest(array['rulesVersion','lifeVersion','worldVersion','storyVersion','economyVersion','balanceVersion','environmentVersion']) as flag(key)
        where (p_next_state->key) is distinct from (v_old.state->key)) then
      raise exception 'Immutable room fields changed' using errcode = '22023';
    end if;
    if p_op = 'join' then
      if (v_old.state->'members') ? p_actor::text then
        if p_next_state is distinct from v_old.state then raise exception 'Existing seat cannot be replaced' using errcode = '22023'; end if;
        v_version := v_old.version;
      else
        if v_old.state->>'mode' <> 'online' or v_old.state->>'status' <> 'lobby' or jsonb_array_length(v_old.state->'players') >= 4
          or ((p_next_state->'members') - p_actor::text) is distinct from (v_old.state->'members')
          or jsonb_array_length(p_next_state->'players') <> jsonb_array_length(v_old.state->'players') + 1
          or jsonb_array_length(p_next_state->'members'->p_actor::text) <> 1 then return jsonb_build_object('kind', 'forbidden'); end if;
        v_version := v_old.version + 1;
      end if;
    else
      if not exists (select 1 from crosswalk_private.room_members where room_code = p_code and user_id = p_actor)
        or (p_next_state->'members') is distinct from (v_old.state->'members') then return jsonb_build_object('kind', 'forbidden'); end if;
      if (select jsonb_agg(p->>'id' order by ordinal) from jsonb_array_elements(p_next_state->'players') with ordinality as players(p, ordinal))
        is distinct from (select jsonb_agg(p->>'id' order by ordinal) from jsonb_array_elements(v_old.state->'players') with ordinality as players(p, ordinal)) then
        raise exception 'Player IDs changed' using errcode = '22023';
      end if;
      if p_op = 'start' and (v_old.state->>'host' <> p_actor::text or v_old.state->>'status' <> 'lobby' or p_next_state->>'status' <> 'playing') then
        return jsonb_build_object('kind', 'forbidden');
      end if;
      if p_op = 'move' and (v_old.state->>'status' <> 'playing'
        or not ((v_old.state->'members'->p_actor::text) ? (v_old.state->'players'->((v_old.state->>'turn')::integer)->>'id'))) then
        return jsonb_build_object('kind', 'forbidden');
      end if;
      v_version := v_old.version + 1;
    end if;
    if v_version <> v_old.version then
      update crosswalk_private.rooms set state = p_next_state, version = v_version, updated_at = v_now where code = p_code;
    end if;
  end if;
  -- These writes commit with the room mutation and permanent receipt or all
  -- roll back. A lost CAS cannot count an uncommitted participant.
  if p_op in ('create', 'join') then
    insert into crosswalk_private.room_members (room_code, user_id) values (p_code, p_actor) on conflict do nothing;
    insert into crosswalk_private.participating_users (user_id) values (p_actor) on conflict do nothing;
  end if;
  insert into crosswalk_private.request_receipts (user_id, request_id, fingerprint, room_code, operation, applied_version)
    values (p_actor, p_request_id, p_fingerprint, p_code, p_op, v_version);
  return jsonb_build_object('kind', 'ok', 'room', crosswalk_private.room_record(p_code), 'replayed', false, 'appliedVersion', v_version);
end;
$$;

-- An owner-only SQL/RPC report. The game HTTP handler exposes no usage endpoint.
create function public.crosswalk_usage_counts() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'participating_identities', count(*),
    'registered_participants', count(*) filter (where u.is_anonymous is false and u.email_confirmed_at is not null),
    'guest_participants', count(*) filter (where u.is_anonymous is true)
  ) from crosswalk_private.participating_users p join auth.users u on u.id = p.user_id;
$$;

revoke all on all functions in schema crosswalk_private from public, anon, authenticated;
grant execute on all functions in schema crosswalk_private to service_role;
revoke all on function public.crosswalk_read_room(uuid, text) from public, anon, authenticated;
revoke all on function public.crosswalk_history(uuid, bigint, text) from public, anon, authenticated;
revoke all on function public.crosswalk_receipt(uuid, text, text) from public, anon, authenticated;
revoke all on function public.crosswalk_commit(uuid, text, text, text, text, bigint, jsonb) from public, anon, authenticated;
revoke all on function public.crosswalk_usage_counts() from public, anon, authenticated;
grant execute on function public.crosswalk_read_room(uuid, text) to service_role;
grant execute on function public.crosswalk_history(uuid, bigint, text) to service_role;
grant execute on function public.crosswalk_receipt(uuid, text, text) to service_role;
grant execute on function public.crosswalk_commit(uuid, text, text, text, text, bigint, jsonb) to service_role;
grant execute on function public.crosswalk_usage_counts() to service_role;
comment on schema crosswalk_private is 'Crosswalk game state: do not expose this schema in the Data API. No anonymous-user cleanup without an explicit save-retention plan.';
commit;
