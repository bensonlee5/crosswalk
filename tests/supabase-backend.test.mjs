import {CURRENT_GAME_PROTOCOL,CURRENT_GAME_SCHEMA} from '../lib/current-game.ts';
import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { createHandler } from '../supabase/functions/crosswalk-game/handler.ts';
import { postgresStore } from '../supabase/functions/crosswalk-game/postgres-store.ts';
import { fingerprint, parseMutation } from '../supabase/functions/crosswalk-game/game-service.ts';

const users = Array.from({ length: 6 }, (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`);
const tokens = users.map((_, i) => `header.user${i}.signature`);
const origin = 'https://crosswalk.example';
let pg, store, handler;
const signatures = {
  crosswalk_read_room: ['p_actor:uuid', 'p_code:text'],
  crosswalk_history: ['p_actor:uuid', 'p_before_updated_at:bigint', 'p_before_code:text'],
  crosswalk_receipt: ['p_actor:uuid', 'p_request_id:text', 'p_fingerprint:text'],
  crosswalk_commit: ['p_actor:uuid', 'p_request_id:text', 'p_fingerprint:text', 'p_op:text', 'p_code:text', 'p_expected_version:bigint', 'p_next_state:jsonb'],
};
const rpc = async (name, args) => {
  try {
    const spec = signatures[name];
    if (!spec) throw Error('Unexpected RPC');
    const values = spec.map(item => { const [key, type] = item.split(':'); return type === 'jsonb' ? JSON.stringify(args[key]) : args[key]; });
    const { rows } = await pg.query(`select public.${name}(${spec.map((item, i) => `$${i + 1}::${item.split(':')[1]}`).join(',')}) as data`, values);
    return { data: rows[0].data, error: null };
  } catch (error) { return { data: null, error: { message: error.message, code: error.code } }; }
};
const asOwner = async sql => { await pg.exec('reset role'); try { return (await pg.exec(sql)).at(-1); } finally { await pg.exec('set role service_role'); } };
const count = async () => (await pg.query('select public.crosswalk_usage_counts() as value')).rows[0].value;
function request(actor, body, query = '', extras = {}) {
  if(extras.protocol!==false){
    if(body)body={protocolVersion:CURRENT_GAME_PROTOCOL,...body};
    else if(!new URLSearchParams(query).has('protocolVersion'))query+=(query?'&':'?')+`protocolVersion=${CURRENT_GAME_PROTOCOL}`;
  }
  const headers = { Origin: origin, Authorization: `Bearer ${tokens[actor]}`, apikey: 'sb_publishable_TEST_ONLY', ...(body ? { 'Content-Type': 'application/json' } : {}), ...extras.headers };
  return new Request(`${origin}/functions/v1/crosswalk-game${query}`, { method: body ? 'POST' : 'GET', ...extras, headers, ...(body ? { body: JSON.stringify(body) } : {}) });
}
async function call(actor, body, query = '', extras = {}) {
  const response = await handler(request(actor, body, query, extras));
  return { response, status: response.status, body: await response.json() };
}
const post = (actor, body) => call(actor, { protocolVersion:CURRENT_GAME_PROTOCOL, requestId: crypto.randomUUID(), ownerSession: users[actor], ...body });
const create = (actor = 0, mode = 'hotseat', id = crypto.randomUUID()) => post(actor, { op: 'create', mode, ...(mode === 'hotseat' ? { names: ['First'] } : { name: 'First' }), requestId: id });
const join = (actor, code, id = crypto.randomUUID()) => post(actor, { op: 'join', code, name: `Player ${actor}`, requestId: id });
const move = (actor, room, action, id = crypto.randomUUID(), destination) => post(actor, { op: 'move', code: room.code, version: room.version, action, requestId: id, ...(destination ? { destination } : {}) });

before(async () => {
  pg = new PGlite();
  // Minimal real-Postgres Auth/role fixture. It does not emulate SQL or RLS.
  await pg.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key, is_anonymous boolean not null default true, email_confirmed_at timestamptz);
    grant usage on schema auth to service_role;`);
  await pg.exec(await readFile(new URL('../supabase/migrations/20261010054417_crosswalk_authoritative_game.sql', import.meta.url), 'utf8'));
  for (const id of users) await pg.query('insert into auth.users (id) values ($1)', [id]);
  await pg.exec('set role service_role');
  store = postgresStore({ rpc });
  handler = createHandler({ store, allowedOrigins: [origin], authenticate: async token => {
    const index = tokens.indexOf(token);
    return index < 0 ? null : { id: users[index], role: 'authenticated', is_anonymous: true };
  } });
  if (process.env.CROSSWALK_TEST_BUNDLE) {
    const { bundledHandler } = await import('./support/bundled-handler.mjs');
    handler = await bundledHandler(process.env.CROSSWALK_TEST_BUNDLE, { rpc, users, tokens, origin });
  }
});
beforeEach(async () => {
  await asOwner('truncate crosswalk_private.rooms, crosswalk_private.room_members, crosswalk_private.request_receipts, crosswalk_private.participating_users; update auth.users set is_anonymous = true, email_confirmed_at = null;');
});
after(async () => { await pg?.close(); });

test('requires verified user JWT, not a public API key, and exact CORS origins', async () => {
  assert.equal((await handler(new Request(origin, { headers: { apikey: 'sb_publishable_TEST' } }))).status, 401);
  assert.equal((await call(0, null, '?session=1', { headers: { Authorization: 'Bearer sb_publishable_TEST' } })).status, 401);
  assert.equal((await call(0, null, '?session=1', { headers: { Authorization: 'Bearer invalid.user.token' } })).status, 401);
  assert.equal((await call(0, null, '?session=1', { headers: { Origin: 'https://untrusted.example' } })).status, 403);
  const preflight = await handler(new Request(origin, { method: 'OPTIONS', headers: { Origin: origin } }));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
  const session = await call(0, null, '?session=1');
  assert.equal(session.body.session, users[0]);
  assert.equal(session.response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await count(), { participating_identities: 0, registered_participants: 0, guest_participants: 0 });
});

test('server authors initial state; stranger preview and history cannot expose private state', async () => {
  const room = await post(0, { op: 'create', mode: 'online', name: 'Host', state: { players: [{ cash: 999999 }] }, economyVersion: 999 });
  assert.equal(room.status, 200);
  assert.equal(room.body.players[0].cash, 6000);
  assert.equal(room.body.schemaVersion, CURRENT_GAME_SCHEMA);
  assert.equal(room.body.players[0].schemaVersion, CURRENT_GAME_SCHEMA);
  assert.equal(room.body.economyVersion, undefined);
  assert.equal(room.body.members, undefined); assert.equal(room.body.lifeSeed, undefined); assert.equal(room.body.seen, undefined);
  const preview = await call(1, null, `?code=${room.body.code}`);
  assert.deepEqual(preview.body.players, [{ name: 'Host' }]);
  assert.equal(preview.body.mine, undefined); assert.equal(preview.body.players[0].cash, undefined);
  assert.deepEqual((await call(1, null, '?history=1')).body, { rooms: [], nextCursor: null });
  const history = (await call(0, null, '?history=1')).body.rooms;
  assert.equal(history.length, 1); assert.deepEqual(history[0].names, ['Host']);
  assert.equal(history[0].code, room.body.code);
  assert.equal((await count()).participating_identities, 1);
});

test('changed session UID refuses mutation and explicitly preserves the pending intent', async () => {
  const response = await post(1, { op: 'create', mode: 'hotseat', names: ['Wrong seat'], ownerSession: users[0] });
  assert.equal(response.status, 403); assert.equal(response.body.identityMismatch, true);
  assert.equal((await count()).participating_identities, 0);
});

test('lost create response retries one permanent receipt and one participant', async () => {
  const original = { op: 'create', mode: 'hotseat', names: ['Lost response'], requestId: 'create-retry', ownerSession: users[0] };
  const one = await call(0, original), two = await call(0, Object.fromEntries(Object.entries(original).reverse()));
  assert.equal(one.status, 200); assert.deepEqual(two.body, one.body);
  assert.equal((await pg.query('select count(*)::int as n from crosswalk_private.rooms')).rows[0].n, 1);
  assert.equal((await pg.query('select count(*)::int as n from crosswalk_private.request_receipts')).rows[0].n, 1);
  assert.equal((await count()).participating_identities, 1);
});

test('request ID reuse for different commands is rejected instead of executing or hiding it', async () => {
  await create(0, 'hotseat', 'same-id');
  const changed = await post(0, { op: 'create', mode: 'hotseat', names: ['Changed'], requestId: 'same-id' });
  assert.equal(changed.status, 409);
  assert.match(changed.body.error, /different action/);
});

test('join retry after the lobby starts remains recoverable and counts once', async () => {
  const room = (await create(0, 'online')).body;
  const joined = await join(1, room.code, 'join-1'); assert.equal(joined.status, 200);
  const started = await post(0, { op: 'start', code: room.code, requestId: 'start', version: joined.body.version });
  assert.equal(started.status, 200);
  const replay = await join(1, room.code, 'join-1');
  assert.equal(replay.status, 200); assert.equal(replay.body.status, 'playing');
  assert.equal(replay.body.version, started.body.version); assert.equal(replay.body.mine.length, 1);
  const duplicateDifferentID = await join(1, room.code, 'join-new');
  assert.equal(duplicateDifferentID.status, 200); assert.equal(duplicateDifferentID.body.version, started.body.version);
  assert.equal((await count()).participating_identities, 2);
});

test('host and turn authorization; stale version cannot spend or reward', async () => {
  const room = (await create(0, 'online')).body;
  const joined = (await join(1, room.code)).body;
  assert.equal((await post(1, { op: 'start', code: room.code, version: joined.version })).status, 400);
  const started = (await post(0, { op: 'start', code: room.code, version: joined.version })).body;
  assert.equal((await move(1, started, 'end')).status, 403);
  const visited = (await move(0, started, 'visit', 'visit', 'COMMUNITY')).body;
  assert.equal((await move(0, started, 'end')).status, 409);
  const replay = (await move(0, started, 'visit', 'visit', 'COMMUNITY')).body;
  assert.equal(replay.version, visited.version);
  assert.equal(replay.players[0].cash, visited.players[0].cash);
});

test('permanent receipts replay after more than 100 later actions', async () => {
  const initial = (await create()).body;
  let room = (await move(0, initial, 'visit', 'ancient-request', 'COMMUNITY')).body;
  for (let i = 0; i < 105; i++) {
    const result = await move(0, room, 'visit', `new-${i}`, i % 2 ? 'COMMUNITY' : 'APARTMENTS');
    assert.equal(result.status, 200); room = result.body;
  }
  const replay = await move(0, initial, 'visit', 'ancient-request', 'COMMUNITY');
  assert.equal(replay.status, 200); assert.equal(replay.body.version, room.version);
  assert.deepEqual(replay.body.players, room.players);
});

test('SQL CAS conflicts roll back membership, counters and receipts together', async () => {
  const room = (await create(0, 'online')).body;
  const before = await store.read(users[0], room.code);
  await join(1, room.code);
  const candidate = structuredClone((await store.read(users[0], room.code)).state);
  candidate.members[users[2]] = candidate.members[users[1]]; delete candidate.members[users[1]];
  const result = await store.commit({ actor: users[2], requestId: 'stale-join', fingerprint: 'a'.repeat(64), op: 'join', code: room.code, expectedVersion: before.version, state: candidate });
  assert.equal(result.kind, 'stale');
  assert.equal((await count()).participating_identities, 2);
  assert.deepEqual(await store.history(users[2]), []);
  assert.equal((await store.receipt(users[2], 'stale-join', 'a'.repeat(64))).kind, 'missing');
});

test('transaction failure after room update rolls back room, receipt and participant count', async () => {
  // Simulate an operational failure exactly where counting occurs.
  await asOwner(`create function crosswalk_private.test_fail_count() returns trigger language plpgsql as $$ begin raise exception 'simulated storage failure'; end $$;
    create trigger fail_count before insert on crosswalk_private.participating_users for each row execute function crosswalk_private.test_fail_count();`);
  try {
    const result = await create(); assert.equal(result.status, 503);
    assert.equal((await pg.query('select count(*)::int as n from crosswalk_private.rooms')).rows[0].n, 0);
    assert.equal((await pg.query('select count(*)::int as n from crosswalk_private.request_receipts')).rows[0].n, 0);
  } finally { await asOwner('drop trigger fail_count on crosswalk_private.participating_users; drop function crosswalk_private.test_fail_count();'); }
});

test('anonymous-to-confirmed-account upgrade keeps same count and existing ownership', async () => {
  const room = (await create()).body;
  await asOwner(`update auth.users set is_anonymous = false, email_confirmed_at = now() where id = '${users[0]}';`);
  assert.deepEqual(await count(), { participating_identities: 1, registered_participants: 1, guest_participants: 0 });
  assert.equal((await store.history(users[0]))[0].code, room.code);
  await create(0);
  assert.equal((await count()).participating_identities, 1);
  // Another account does not gain the guest's seats by knowing a room code.
  assert.equal((await call(1, null, `?code=${room.code}`)).body.mine, undefined);
});

test('hot-seat names are multiple seats but one participating identity', async () => {
  const result = await post(0, { op: 'create', mode: 'hotseat', names: ['One', 'Two', 'Three', 'Four'] });
  assert.equal(result.status, 200); assert.equal(result.body.mine.length, 4);
  assert.equal((await count()).participating_identities, 1);
  assert.equal((await store.history(users[0]))[0].names.length, 4);
});

test('client SQL roles have neither RPC privileges nor private table access', async () => {
  for (const role of ['anon', 'authenticated']) {
    await pg.exec(`reset role; set role ${role}`);
    await assert.rejects(pg.query('select public.crosswalk_history($1::uuid)', [users[0]]), /permission denied/);
    await assert.rejects(pg.query('select * from crosswalk_private.rooms'), /permission denied/);
    await assert.rejects(pg.query('select public.crosswalk_usage_counts()'), /permission denied/);
  }
  await pg.exec('reset role; set role service_role');
  const functions = await asOwner(`select p.proname, p.prosecdef from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'crosswalk_private' or p.proname like 'crosswalk_%';`);
  assert.ok(functions.rows.length >= 7); assert.ok(functions.rows.every(row => row.prosecdef === false));
  const tables = await asOwner(`select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'crosswalk_private' and c.relkind = 'r';`);
  assert.equal(tables.rows.length, 4); assert.ok(tables.rows.every(row => row.relrowsecurity));
});

test('the trusted store rejects unsupported state and SQL protects immutable ownership', async () => {
  const room = (await create()).body, record = await store.read(users[0], room.code);
  const changed = structuredClone(record.state); changed.schemaVersion = 999;
  assert.throws(()=>store.commit({ actor: users[0], requestId: 'bad-schema', fingerprint: 'b'.repeat(64), op: 'move', code: room.code, expectedVersion: 0, state: changed }), /Start a new life/);
  assert.equal((await store.read(users[0], room.code)).version, 0);
  const forbidden = structuredClone(record.state); forbidden.members[users[1]] = forbidden.members[users[0]]; delete forbidden.members[users[0]]; forbidden.host = users[1];
  await assert.rejects(store.commit({ actor: users[1], requestId: 'steal', fingerprint: 'c'.repeat(64), op: 'move', code: room.code, expectedVersion: 0, state: forbidden }), /22023/);
});

test('unsupported saved lives are rejected without read repair, mutation, new receipts or lost ownership', async () => {
  const created = await create(0, 'online', 'old-life-create'), code = created.body.code;
  const saved = await store.read(users[0], code), old = saved.state;
  delete old.schemaVersion;for(const p of old.players){delete p.schemaVersion;p.cash=1100;}
  await pg.query('update crosswalk_private.rooms set state=$1::jsonb where code=$2',[JSON.stringify(old),code]);
  const before=JSON.stringify(await store.read(users[0],code)), counts=await count();
  const receiptCount=(await pg.query('select count(*)::int as n from crosswalk_private.request_receipts')).rows[0].n;
  const attempts=[await call(0,null,`?code=${code}`),await call(1,null,`?code=${code}`),await join(1,code),await post(0,{op:'start',code,version:0}),await post(0,{op:'move',code,version:0,action:'home_reset'}),await create(0,'online','old-life-create')];
  for(const result of attempts){assert.equal(result.status,409);assert.equal(result.body.newLifeRequired,true);assert.match(result.body.error,/Start a new life/);assert.equal(result.body.players,undefined);assert.equal(result.body.mine,undefined);}
  assert.equal(JSON.stringify(await store.read(users[0],code)),before);assert.deepEqual(await count(),counts);
  assert.equal((await pg.query('select count(*)::int as n from crosswalk_private.request_receipts')).rows[0].n,receiptCount);
  assert.equal((await store.history(users[0]))[0].code,code);assert.equal((await store.history(users[1])).length,0);
  assert.equal((await create(0)).status,200);assert.equal(JSON.stringify(await store.read(users[0],code)),before);
});

test('body limits and invalid commands fail without writes', async () => {
  const huge = await post(0, { op: 'create', mode: 'hotseat', names: ['Test'], junk: 'x'.repeat(5000) });
  assert.equal(huge.status, 413);
  const noID = await call(0, { op: 'create', mode: 'hotseat', names: ['Test'], ownerSession: users[0] }); assert.equal(noID.status, 400);
  const wrong = await post(0, { op: 'state', players: [{ cash: 9999 }] }); assert.equal(wrong.status, 400);
  assert.equal((await count()).participating_identities, 0);
});

test('same normalized request has same fingerprint regardless of JSON property order', async () => {
  const a = { protocolVersion:CURRENT_GAME_PROTOCOL, op: 'create', mode: 'hotseat', names: ['One'], requestId: 'id', ownerSession: users[0] };
  const b = { protocolVersion:CURRENT_GAME_PROTOCOL, names: ['One'], ownerSession: users[0], mode: 'hotseat', op: 'create', requestId: 'id', cash: 88888 };
  assert.equal(await fingerprint(parseMutation(a, users[0])), await fingerprint(parseMutation(b, users[0])));
});

test('history keyset pagination reaches every older room without exposing another user', async () => {
  for (let i = 0; i < 45; i++) assert.equal((await create(0, 'hotseat', `room-${i}`)).status, 200);
  await create(1);
  // Force equal timestamps to prove code tie-breaking is deterministic.
  await pg.query('update crosswalk_private.rooms set updated_at = 1234567890123');
  const found = []; let cursor = null;
  do {
    const page = await call(0, null, '?history=1' + (cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''));
    assert.equal(page.status, 200); assert.ok(page.body.rooms.length <= 20);
    found.push(...page.body.rooms.map(room => room.code)); cursor = page.body.nextCursor;
  } while (cursor);
  assert.equal(found.length, 45); assert.equal(new Set(found).size, 45);
  assert.equal((await call(0, null, '?history=1&cursor=not-valid')).status, 400);
});

test('concurrent duplicate requests produce one saved create and one receipt', async () => {
  const [a, b] = await Promise.all([create(0, 'hotseat', 'parallel-create'), create(0, 'hotseat', 'parallel-create')]);
  assert.equal(a.status, 200); assert.equal(b.status, 200); assert.deepEqual(a.body, b.body);
  assert.equal((await pg.query('select count(*)::int as n from crosswalk_private.rooms')).rows[0].n, 1);
  assert.equal((await count()).participating_identities, 1);
});

test('duplicate completing between receipt lookup and state read still replays successfully', async () => {
  const room = (await create()).body;
  const body = { op: 'move', requestId: 'race-read', ownerSession: users[0], code: room.code, version: room.version, action: 'visit', destination: 'COMMUNITY' };
  let triggered = false;
  const racedHandler = createHandler({ allowedOrigins: [origin], authenticate: async () => ({ id: users[0], role: 'authenticated', is_anonymous: true }), store: {
    ...store,
    read: async (actor, code) => {
      if (!triggered) { triggered = true; assert.equal((await call(0, body)).status, 200); }
      return store.read(actor, code);
    },
  } });
  const result = await racedHandler(request(0, body));
  assert.equal(result.status, 200); assert.equal((await result.json()).version, 1);
});

test('engine bundle matches the verified source snapshot', async () => {
  const base = new URL('../supabase/functions/_shared/engine/', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('../supabase/functions/_shared/engine-manifest.json', import.meta.url), 'utf8'));
  for (const file of await readdir(base)) {
    if (!file.endsWith('.ts')) continue;
    assert.equal(createHash('sha256').update(await readFile(new URL(file, base))).digest('hex'), manifest.sha256[file], file);
  }
});

test('new cast schedules are server-authored; saved retries do not reroll or spend twice', async () => {
  const {castPeople} = await import('../supabase/functions/_shared/engine/character-cast.ts');
  const first = await post(0, {op:'create',mode:'hotseat',names:['First'],castVersion:999,historyVersion:999,cast:{schedule:{}}});
  assert.equal(first.status,200);
  let room = first.body;
  assert.equal(room.schemaVersion,CURRENT_GAME_SCHEMA);
  assert.equal(room.castVersion,undefined);
  assert.equal(room.historyVersion,undefined);
  assert.deepEqual(Object.keys(room.cast.schedule),[String(room.round)]);
  const schedule=structuredClone(room.cast.schedule);
  const person=castPeople(room,room.players[0])[0];
  assert.ok(person);
  const arrived=await move(0,room,'visit',crypto.randomUUID(),person.spot);
  assert.equal(arrived.status,200);room=arrived.body;
  const choice=castPeople(room,room.players[0]).find(c=>c.id===person.id).choices.find(c=>c.available);
  assert.ok(choice);
  const actionId=crypto.randomUUID(),before=room.players[0].hours;
  const applied=await move(0,room,choice.id,actionId);
  assert.equal(applied.status,200);
  assert.equal(applied.body.players[0].hours,before-choice.cost.time);
  assert.equal(applied.body.players[0].cast.receipts.length,1);
  const replay=await move(0,room,choice.id,actionId);
  assert.equal(replay.status,200);
  assert.equal(replay.body.players[0].cast.receipts.length,1);
  assert.equal(replay.body.players[0].hours,applied.body.players[0].hours);
  assert.deepEqual(replay.body.cast.schedule,schedule);
  const fresh=await call(0,null,`?code=${room.code}`);
  assert.deepEqual(fresh.body.cast.schedule,schedule);
  assert.equal(fresh.body.lifeSeed,undefined);
});

test('online cast views hide future appearances and another seat’s relationship memories', async () => {
  const {castPeople}=await import('../supabase/functions/_shared/engine/character-cast.ts');
  const created=await create(0,'online');
  const joined=await join(1,created.body.code);
  const started=await post(0,{op:'start',code:created.body.code,version:joined.body.version});
  assert.equal(started.status,200);
  let room=started.body;
  assert.ok(room.players[0].cast);
  assert.equal(room.players[1].cast,undefined);
  const npc=castPeople(room,room.players[0])[0];
  room=(await move(0,room,'visit',crypto.randomUUID(),npc.spot)).body;
  const c=castPeople(room,room.players[0]).find(c=>c.id===npc.id).choices.find(c=>c.available);
  room=(await move(0,room,c.id)).body;
  assert.equal(room.players[0].cast.receipts.length,1);
  const other=(await call(1,null,`?code=${room.code}`)).body;
  assert.equal(other.players[0].cast,undefined);
  assert.equal(other.players[0].castRedacted,true);
  assert.notEqual(other.players[1].castRedacted,true);
  const privateReceipt=room.players[0].cast.receipts[0];
  assert.ok(!JSON.stringify(other).includes(privateReceipt.outcome),'private conversation outcome must not leak through the shared log');
  assert.ok(other.players[1].cast);
  assert.deepEqual(other.cast,room.cast);
  const observed=castPeople(other,other.players[0]);
  assert.ok(observed.every(c=>c.status==='Relationship private'&&c.choices.length===0&&c.memories.length===0));
  assert.deepEqual(Object.keys(other.cast.schedule),['1']);
  const authoritative=await store.read(users[0],room.code);
  assert.equal(Object.keys(authoritative.state.cast.schedule).length,8);
  assert.equal(authoritative.state.players[0].cast.receipts.length,1);
  room=(await move(0,room,'end')).body;
  room=(await move(1,room,'end')).body;
  assert.equal(room.round,2);
  assert.deepEqual(Object.keys(room.cast.schedule),['2']);
  assert.deepEqual(room.cast.schedule[2],authoritative.state.cast.schedule[2]);
});


test('authoritative motive exchanges persist once, ignore forged flags and redact private state',async()=>{
 const {castPeople}=await import('../supabase/functions/_shared/engine/character-cast.ts');
 const {motiveScene}=await import('../supabase/functions/_shared/engine/character-motives.ts');
 const created=await post(0,{op:'create',mode:'online',name:'Motive owner',motivesVersion:999});
 assert.equal(created.body.motivesVersion,undefined);assert.equal(created.body.schemaVersion,CURRENT_GAME_SCHEMA);assert.deepEqual(created.body.players[0].motives.bonds,{});
 const joined=await join(1,created.body.code);
 let room=(await post(0,{op:'start',code:created.body.code,version:joined.body.version})).body;
 const npc=castPeople(room,room.players[0])[0];room=(await move(0,room,'visit',crypto.randomUUID(),npc.spot)).body;
 const intro=castPeople(room,room.players[0]).find(c=>c.id===npc.id).choices.find(c=>c.available);room=(await move(0,room,intro.id)).body;
 const choice=motiveScene(room,room.players[0],npc.id).choices.find(c=>c.key==='press'),requestId=crypto.randomUUID();
 const applied=await move(0,room,choice.id,requestId),replay=await move(0,room,choice.id,requestId);
 assert.equal(applied.status,200);assert.deepEqual(replay.body,applied.body);assert.equal(applied.body.players[0].motives.receipts.length,1);
 const other=(await call(1,null,`?code=${room.code}`)).body;
 assert.equal(other.players[0].motives,undefined);assert.equal(other.players[0].castRedacted,true);assert.ok(other.players[1].motives);
 assert.ok(!JSON.stringify(other).includes(applied.body.players[0].motives.receipts[0].outcome));
 const reload=(await call(0,null,`?code=${room.code}`)).body;assert.deepEqual(reload.players[0].motives,applied.body.players[0].motives);
});

test('shared commitments use real PostgreSQL ownership, private responses and durable exactly-once receipts',async()=>{
 const {sharedChoices}=await import('../supabase/functions/_shared/engine/shared-opportunities.ts');
 let room=(await create(0,'online')).body;room=(await join(1,room.code)).body;room=(await post(0,{op:'start',code:room.code,version:room.version})).body;
 room=(await move(0,room,'visit','shared-cafe','CORNER CAFÉ')).body;
 const c=sharedChoices(room,room.players[0]).find(c=>c.key==='order');const ordered=await move(0,room,c.actionId,'shared-order');assert.equal(ordered.status,200);room=ordered.body;
 const order=room.sharedOpportunities.orders.find(o=>o.owner.id===room.players[0].id);assert.ok(order);const speech=room.players[0].sharedPersonal.receipts.at(-1).response.speech;
 const guest=(await call(1,null,`?code=${room.code}`)).body;assert.equal(guest.players[0].sharedPersonal,undefined);assert.equal(guest.players[0].familiarity,undefined);assert.ok(!JSON.stringify(guest).includes(speech));assert.ok(guest.sharedOpportunities.events.some(e=>e.actor.id===room.players[0].id));
 room=(await move(0,room,'end','shared-host-end')).body;room=(await move(1,room,'visit','shared-guest-cafe','CORNER CAFÉ')).body;
 const prep=sharedChoices(room,room.players[1]).find(c=>c.key==='prepare:'+order.id),before=room.players[1].cash;
 assert.equal((await move(0,room,prep.actionId,'wrong-shared-seat')).status,403);
 const submitted=room,done=await move(1,room,prep.actionId,'shared-prepare');assert.equal(done.status,200);assert.equal(done.body.players[1].cash,before+154);assert.equal(done.body.sharedOpportunities.orders.find(o=>o.id===order.id).status,'ready');
 const retry=await move(1,submitted,prep.actionId,'shared-prepare');assert.equal(retry.status,200);assert.equal(retry.body.players[1].cash,before+154);assert.equal(retry.body.players[1].sharedPersonal.receipts.length,1);assert.equal(retry.body.players[1].familiarity.actions['shared:alder:prepare'].count,1);
 const cancelled=await move(1,done.body,`world:shared:${done.body.round}:${done.body.sharedOpportunities.revision}:alder:cancel:${order.id}`,'steal-cancel');assert.equal(cancelled.status,400);assert.equal((await store.read(users[1],room.code)).state.sharedOpportunities.orders.find(o=>o.id===order.id).status,'ready');
});

test('incidents keep RNG server-private and consume exactly one draw set for accepted requests only',async()=>{
 let room=(await post(0,{op:'create',mode:'online',name:'First'})).body;room=(await join(1,room.code)).body;room=(await post(0,{op:'start',code:room.code,version:room.version})).body;
 assert.equal(room.actionIncidentsVersion,undefined);assert.ok(room.players[0].actionIncidents);assert.equal(room.actionIncidentRng,undefined);
 const publicView=(await call(2,null,`?code=${room.code}`)).body;assert.equal(publicView.actionIncidentRng,undefined);assert.equal(publicView.players[0].actionIncidents,undefined);
 room=(await move(0,room,'visit','incident-cafe','CORNER CAFÉ')).body;
 let saved=await store.read(users[0],room.code),seat=saved.state.players[0].id;saved.state.actionIncidentRng[seat]={words:[1,1,1,1]};
 await pg.query('update crosswalk_private.rooms set state=$1::jsonb where code=$2',[JSON.stringify(saved.state),room.code]);
 const before=room,applied=await move(0,before,'cafe_break','incident-coffee');assert.equal(applied.status,200);room=applied.body;
 const receipt=room.players[0].actionIncidents.receipts.at(-1);assert.equal(receipt.incidentId,'coffee_spill');assert.equal(room.players[0].actionIncidents.ordinal,1);assert.equal(room.players[0].familiarity.actions.cafe_break.count,1);assert.equal(room.actionIncidentRng,undefined);
 const rngAfter=JSON.stringify((await store.read(users[0],room.code)).state.actionIncidentRng);
 const replay=await move(0,before,'cafe_break','incident-coffee');assert.deepEqual(replay.body,applied.body);assert.equal(JSON.stringify((await store.read(users[0],room.code)).state.actionIncidentRng),rngAfter);
 assert.equal((await move(0,before,'home_reset','incident-stale')).status,409);assert.equal((await move(0,room,'unknown','incident-failed')).status,400);assert.equal((await move(1,room,'home_reset','incident-wrong-seat')).status,403);assert.equal(JSON.stringify((await store.read(users[0],room.code)).state.actionIncidentRng),rngAfter);
 const otherView=(await call(1,null,`?code=${room.code}`)).body;assert.equal(otherView.actionIncidentRng,undefined);assert.equal(otherView.players[0].actionIncidents,undefined);assert.equal(JSON.stringify(otherView).includes(receipt.body),false);assert.equal(JSON.stringify(otherView).includes('"words"'),false);
 room=(await move(0,room,'visit','incident-home','APARTMENTS')).body;saved=await store.read(users[0],room.code);saved.state.actionIncidentRng[seat]={words:[0x80000000,0,0,0]};await pg.query('update crosswalk_private.rooms set state=$1::jsonb where code=$2',[JSON.stringify(saved.state),room.code]);
 const common=room,raced=await Promise.all([move(0,common,'home_reset','incident-race-a'),move(0,common,'home_reset','incident-race-b')]);assert.deepEqual(raced.map(r=>r.status).sort(),[200,409]);const won=raced.find(r=>r.status===200).body;assert.equal(won.players[0].actionIncidents.ordinal,2);assert.equal(won.players[0].actionIncidents.receipts.at(-1).incidentId,null);const committed=await store.read(users[0],room.code),stateAfter=JSON.stringify(committed.state.actionIncidentRng);assert.equal(committed.state.players[0].actionIncidents.ordinal,2);
 for(const requestId of ['incident-race-a','incident-race-b'])await move(0,common,'home_reset',requestId);assert.equal(JSON.stringify((await store.read(users[0],room.code)).state.actionIncidentRng),stateAfter);assert.equal((await store.read(users[0],room.code)).state.players[0].actionIncidents.ordinal,2);
});

test('one exact current protocol gates every request including saved replays',async()=>{
 const room=(await create(0,'online','protocol-room')).body,code=room.code;
 const before=JSON.stringify(await store.read(users[0],code));
 for(const protocolVersion of [undefined,null,0,1,CURRENT_GAME_PROTOCOL+1,String(CURRENT_GAME_PROTOCOL),[],{}]){
  const body={op:'create',mode:'online',name:'Cached',ownerSession:users[0],requestId:'cached',protocolVersion};
  const result=await call(0,body);assert.equal(result.status,409);assert.equal(result.body.refreshRequired,true);assert.equal(result.body.players,undefined);
 }
 for(const query of [`?code=${code}`,'?history=1','?session=1',`?code=${code}&protocolVersion=1`,`?code=${code}&protocolVersion=${CURRENT_GAME_PROTOCOL+1}`,`?code=${code}&protocolVersion=${CURRENT_GAME_PROTOCOL}&protocolVersion=${CURRENT_GAME_PROTOCOL}`]){
  const result=await call(0,null,query,{protocol:false});assert.equal(result.status,409);assert.equal(result.body.refreshRequired,true);
 }
 for(const body of [{op:'join',name:'Guest'}, {op:'start',version:0}, {op:'move',version:0,action:'home_reset'}, {op:'create',mode:'online',name:'First',requestId:'protocol-room'}]){
  const result=await call(0,{code,ownerSession:users[0],requestId:crypto.randomUUID(),...body},'',{protocol:false});assert.equal(result.status,409);assert.equal(result.body.refreshRequired,true);
 }
 assert.equal(JSON.stringify(await store.read(users[0],code)),before);
 assert.equal((await count()).participating_identities,1);
 const joined=await join(1,code);assert.equal(joined.status,200);
 const started=await post(0,{op:'start',code,version:joined.body.version});assert.equal(started.status,200);
 const command={op:'move',code,version:started.body.version,action:'home_reset',requestId:'protocol-action'};
 const applied=await post(0,command);assert.equal(applied.status,200);
 const blocked=await call(0,{...command,ownerSession:users[0] },'',{protocol:false});assert.equal(blocked.status,409);assert.equal(blocked.body.refreshRequired,true);
 assert.deepEqual((await post(0,command)).body,applied.body);
});

test('every new life and joined player has the current features without opt-in modes', async()=>{
 for(const mode of ['online','hotseat']){
  const created=await create(0,mode),room=created.body;assert.equal(created.status,200);assert.equal(room.schemaVersion,CURRENT_GAME_SCHEMA);assert.equal(room.requiredRules,undefined);
  for(const p of room.players){assert.equal(p.schemaVersion,CURRENT_GAME_SCHEMA);assert.equal(p.cash,6000);assert.ok(p.career);assert.equal(p.finance.arrears,0);assert.equal(p.actionIncidents.ordinal,0);assert.ok(p.familiarity);assert.ok(p.life);assert.ok(p.world);assert.ok(p.story);assert.ok(p.cast);assert.ok(p.motives);assert.deepEqual(p.ensemble,{version:1,receipts:[],personal:[]});}
  for(const key of Object.keys(room))assert.ok(!key.endsWith('Version')||key==='schemaVersion',key);
  if(mode==='online'){
   const joined=await join(1,room.code);assert.equal(joined.status,200);const p=joined.body.players.find(p=>joined.body.mine.includes(p.id));assert.equal(p.schemaVersion,CURRENT_GAME_SCHEMA);assert.ok(p.career);assert.ok(p.finance);assert.ok(p.actionIncidents);assert.ok(p.familiarity);assert.deepEqual(p.ensemble,{version:1,receipts:[],personal:[]});
   const other=joined.body.players.find(p=>!joined.body.mine.includes(p.id));for(const field of ['ensemble','career','finance','actionIncidents','familiarity','sharedPersonal','cast','motives'])assert.equal(other[field],undefined,field);
  }
 }
});

test('venue application, acceptance and paycheck are authoritative across concurrent commands and retries', async()=>{
 let room=(await post(0,{op:'create',mode:'hotseat',names:['Worker']})).body;
 room=(await move(0,room,'visit',crypto.randomUUID(),'WORK')).body;
 const {careerChoices}=await import('../lib/careers.ts');let choices=careerChoices(room,room.players[0]),application=choices.find(c=>c.target==='t.technical.assistant');assert.equal(application.available,true,application.reason);
 const requests=await Promise.all([move(0,room,application.id,'career-apply-a'),move(0,room,application.id,'career-apply-b')]);assert.deepEqual(requests.map(r=>r.status).sort(),[200,409]);room=requests.find(r=>r.status===200).body;assert.equal(room.players[0].career.receipts.filter(r=>r.verb==='apply').length,1);
 choices=careerChoices(room,room.players[0]);room=(await move(0,room,choices.find(c=>c.verb==='accept').id)).body;assert.equal(room.players[0].career.contracts.length,1);const choice=careerChoices(room,room.players[0]).find(c=>c.verb==='work'&&c.target.endsWith('.regular')),before=structuredClone(room);
 const paid=await move(0,room,choice.id,'career-paid');assert.equal(paid.status,200);assert.equal(paid.body.players[0].cash-before.players[0].cash,choice.cash);assert.equal(paid.body.players[0].economyWork.paidHours,160);assert.equal(paid.body.players[0].career.experience.technical.paidHours,160);
 const retry=await move(0,before,choice.id,'career-paid');assert.equal(retry.status,200);assert.equal(retry.body.players[0].cash,paid.body.players[0].cash);const stale=await move(0,before,choice.id,'career-stale');assert.equal(stale.status,409);
});
test('an authoritative refused career interaction cannot mint a reference or private notice',async()=>{
 const{careerChoices}=await import('../lib/careers.ts'),{worldChoices}=await import('../lib/world-life.ts'),{motiveScene}=await import('../lib/character-motives.ts');let room=(await post(0,{op:'create',mode:'hotseat',names:['Applicant']})).body;
 const apply=async action=>{const r=await move(0,room,action);assert.equal(r.status,200,r.body.error);room=r.body;};
 room=(await move(0,room,'visit',crypto.randomUUID(),'CORNER CAFÉ')).body;await apply('world:'+worldChoices(room.players[0],room).find(c=>c.key==='talk:alder_tess').id);await apply(careerChoices(room,room.players[0]).find(c=>c.target==='t.service.crew').id);await apply(careerChoices(room,room.players[0]).find(c=>c.verb==='accept').id);await apply(careerChoices(room,room.players[0]).find(c=>c.verb==='work'&&c.target.endsWith('.regular')).id);
 const press=motiveScene(room,room.players[0],'alder_tess').choices.find(c=>c.key==='press'),before=structuredClone(room),requestId=crypto.randomUUID(),result=await move(0,room,press.id,requestId);assert.equal(result.status,200);const p=result.body.players[0];assert.equal(p.motives.receipts.at(-1).response,'boundary');assert.equal(p.career.leads['tess-ferry'].referenceRound,undefined);assert.equal(p.career.notices.some(n=>n.actionId===press.id),false);assert.deepEqual((await move(0,before,press.id,requestId)).body,result.body);const reload=(await call(0,null,`?code=${room.code}`)).body;assert.deepEqual(reload.players[0].career.notices,p.career.notices);
});

test('ensemble stories persist through create, join, start, choices, replay, private reads, reload and finish', async () => {
  const { getEnsembleView } = await import('../lib/ensemble-story.ts');
  const { ensembleById } = await import('../lib/ensemble-story-content.ts');
  const { isCurrentGameState } = await import('../lib/current-game.ts');
  let room = (await create(0, 'online', 'ensemble-room')).body;
  const code = room.code, hostSeat = room.mine[0];
  assert.equal(Object.keys(room.ensemble.threads).length, 20);
  assert.ok(Object.values(room.ensemble.threads).every(thread => thread.status === 'queued'));
  assert.deepEqual(room.players[0].ensemble, {version: 1, receipts: [], personal: []});
  const lobby = JSON.stringify(await store.read(users[0], code));
  assert.equal((await call(0, null, `?code=${code}`)).status, 200);
  assert.equal((await call(2, null, `?code=${code}`)).body.ensemble, undefined);
  assert.equal(JSON.stringify(await store.read(users[0], code)), lobby);

  room = (await join(1, code, 'ensemble-join')).body;
  const guestSeat = room.mine[0];
  assert.deepEqual(room.players.find(p => p.id === guestSeat).ensemble, {version: 1, receipts: [], personal: []});
  assert.equal(room.players.find(p => p.id === hostSeat).ensemble, undefined);
  room = (await post(0, {op: 'start', code, version: room.version, requestId: 'ensemble-start'})).body;
  assert.equal(room.status, 'playing');
  const active = Object.values(room.ensemble.threads).filter(thread => thread.status === 'active');
  assert.ok(active.length > 0 && active.length <= 8);
  assert.ok(active.every(thread => ensembleById[thread.id].region === 'alder'));
  assert.ok(Object.values(room.ensemble.threads).filter(thread => ensembleById[thread.id].region !== 'alder').every(thread => thread.status === 'queued'));
  assert.equal(room.ensemble.arrivedMonth, 1);
  assert.ok(isCurrentGameState((await store.read(users[0], code)).state));

  const scene = getEnsembleView(room, room.players[0], 'bracken').scenes.find(scene => scene.id === 'bracken');
  const clarify = scene.choices.find(choice => choice.actionId === 'ensemble:bracken:main:clarify:0');
  assert.equal(clarify.available, true, clarify.reason);
  const submitted = structuredClone(room);
  assert.equal((await move(1, submitted, clarify.actionId, 'ensemble-wrong-seat')).status, 403);
  const competingIds = ['ensemble-choice-a', 'ensemble-choice-b'];
  const competing = await Promise.all(competingIds.map(id => move(0, submitted, clarify.actionId, id)));
  assert.deepEqual(competing.map(result => result.status).sort(), [200, 409]);
  const winner = competing.findIndex(result => result.status === 200), choiceId = competingIds[winner];
  room = competing[winner].body;
  assert.equal(room.ensemble.threads.bracken.beat, 1);
  assert.equal(room.players[0].ensemble.receipts.length, 1);
  assert.equal(room.players[0].familiarity.people.nell_harper.count, 1);
  const persisted = JSON.stringify(await store.read(users[0], code));
  assert.deepEqual((await move(0, submitted, clarify.actionId, choiceId)).body, room);
  assert.equal((await move(0, submitted, clarify.actionId, 'ensemble-stale')).status, 409);
  assert.equal(JSON.stringify(await store.read(users[0], code)), persisted);

  const personal = getEnsembleView(room, room.players[0], 'bracken').scenes.find(s => s.id === 'bracken').choices.find(c => c.actionId.includes(':personal:'));
  const own = await move(0, room, personal.actionId, 'ensemble-personal');
  assert.equal(own.status, 200, own.body.error);room = own.body;
  const privateReceipt = room.players[0].ensemble.receipts.at(-1);
  const beforeReads = JSON.stringify(await store.read(users[0], code));
  const other = (await call(1, null, `?code=${code}`)).body;
  assert.equal(other.players.find(p => p.id === hostSeat).ensemble, undefined);
  assert.equal(JSON.stringify(other).includes(privateReceipt.body), false);
  assert.deepEqual(other.players.find(p => p.id === guestSeat).ensemble.receipts, []);
  assert.equal(other.ensemble.events.at(-1).actor.id, hostSeat);
  const publicRoom = (await call(2, null, `?code=${code}`)).body;
  assert.equal(publicRoom.ensemble, undefined);assert.deepEqual(publicRoom.players, [{name: 'First'}, {name: 'Player 1'}]);

  const reloaded = createHandler({store: postgresStore({rpc}), allowedOrigins: [origin], authenticate: async token => {
    const index = tokens.indexOf(token);return index < 0 ? null : {id: users[index], role: 'authenticated', is_anonymous: true};
  }});
  const reload = await reloaded(request(0, null, `?code=${code}`));
  assert.equal(reload.status, 200);assert.deepEqual(await reload.json(), room);
  assert.equal(JSON.stringify(await store.read(users[0], code)), beforeReads);

  room = (await move(0, room, 'end')).body;
  // Use the guest's actual private projection for their independent choice.
  const guestView = (await call(1, null, `?code=${code}`)).body;
  const guestPersonal = getEnsembleView(guestView, guestView.players.find(p => p.id === guestSeat), 'bracken').scenes.find(s => s.id === 'bracken').choices.find(c => c.actionId.includes(':personal:'));
  assert.equal(guestPersonal.available, true, guestPersonal.reason);
  const guestAccepted = await move(1, guestView, guestPersonal.actionId);
  assert.equal(guestAccepted.status, 200, guestAccepted.body.error);room = guestAccepted.body;
  while (room.status === 'playing') {
    const actor = room.players[room.turn].id === hostSeat ? 0 : 1;
    const next = await move(actor, room, 'end');assert.equal(next.status, 200, next.body.error);room = next.body;
    assert.ok(isCurrentGameState((await store.read(users[0], code)).state));
  }
  assert.equal(room.status, 'finished');
  const final = await store.read(users[0], code);
  assert.equal(final.state.players[0].ensemble.receipts.length, 2);
  assert.equal(final.state.players[1].ensemble.receipts.length, 1);
  assert.ok(final.state.ensemble.events.some(event => event.actor.kind === 'npc'));
  const finished = JSON.stringify(final);
  assert.equal((await move(0, room, 'ensemble:bracken:main:clarify:0')).status, 400);
  assert.equal(JSON.stringify(await store.read(users[0], code)), finished);
  const recovered = (await call(0, null, `?code=${code}`)).body;
  assert.equal(recovered.status, 'finished');assert.deepEqual(recovered.players[0].ensemble, final.state.players[0].ensemble);
});

test('real travel, individual story tickets and bounded paid story work retain private accounting on retry', async () => {
  const { getEnsembleView } = await import('../lib/ensemble-story.ts');
  const { worldChoices, visiblePlaces } = await import('../lib/world-life.ts');
  let room = (await create(0, 'online')).body;
  room = (await join(1, room.code)).body;
  room = (await post(0, {op: 'start', code: room.code, version: room.version})).body;
  const code = room.code, hostSeat = room.mine[0];
  const apply = async (action, destination) => {const result = await move(0, room, action, crypto.randomUUID(), destination);assert.equal(result.status, 200, result.body.error);room = result.body;};
  const endMonth = async () => {
    const month = room.round;
    while (room.round === month || room.players[room.turn].id !== hostSeat) {
      const actor = room.players[room.turn].id === hostSeat ? 0 : 1;
      const ended = await move(actor, room, 'end');assert.equal(ended.status, 200, ended.body.error);room = ended.body;
    }
    room = (await call(0, null, `?code=${code}`)).body;
  };
  await endMonth();await endMonth();assert.equal(room.round, 3);
  while (!visiblePlaces(room.players[0], room).includes('TRANSIT')) {
    const explore = worldChoices(room.players[0], room).find(choice => choice.key === 'explore');
    assert.equal(explore.available, true, explore.reason);await apply(`world:${explore.id}`);
  }
  await apply('visit', 'TRANSIT');
  const travel = worldChoices(room.players[0], room).find(choice => choice.key === 'travel:embermesa');
  assert.equal(travel.available, true, travel.reason);await apply(`world:${travel.id}`);
  assert.equal(room.players[0].world.region, 'embermesa');
  assert.ok(visiblePlaces(room.players[0], room).includes('CORNER CAFÉ'));
  await apply('visit', 'CORNER CAFÉ');
  const scene = () => getEnsembleView(room, room.players[0], 'dalloway').scenes.find(scene => scene.id === 'dalloway');
  assert.equal(room.ensemble.threads.dalloway.beat, 0);
  assert.equal(room.ensemble.threads.dalloway.openedMonth, room.round);
  assert.deepEqual(room.ensemble.threads.dalloway.history, []);
  const opening = scene().choices.find(choice => choice.actionId === 'ensemble:dalloway:main:correct:0');
  assert.equal(opening.available, true, opening.reason);await apply(opening.actionId);
  const ticket = scene().choices.find(choice => choice.actionId.includes(':personal:'));
  assert.equal(ticket.available, true, ticket.reason);
  const ticketBefore = structuredClone(room), ticketId = crypto.randomUUID();
  const bought = await move(0, room, ticket.actionId, ticketId);assert.equal(bought.status, 200, bought.body.error);room = bought.body;
  assert.equal(ticketBefore.players[0].cash - room.players[0].cash, 30);
  assert.deepEqual((await move(0, ticketBefore, ticket.actionId, ticketId)).body, room);
  const order = room.ensemble.orders.find(order => order.payerId === hostSeat);assert.equal(order.amount, 30);
  const other = (await call(1, null, `?code=${code}`)).body;
  const hiddenOrder = other.ensemble.orders.find(otherOrder => otherOrder.id === order.id);
  assert.equal(hiddenOrder.amount, 0);assert.equal(hiddenOrder.absorbedWages, 0);
  assert.equal(other.players[0].ensemble, undefined);
  assert.equal((await store.read(users[0], code)).state.ensemble.orders.find(saved => saved.id === order.id).amount, 30);

  const fullCredit = scene().choices.find(choice => choice.actionId === 'ensemble:dalloway:main:full:1');
  assert.equal(fullCredit.available, true, fullCredit.reason);await apply(fullCredit.actionId);
  const nextMain = scene().choices.find(choice => choice.actionId === 'ensemble:dalloway:main:own_choice:2');
  assert.equal(nextMain.available, false);assert.match(nextMain.reason, /two main parts/);
  await endMonth();assert.equal(room.round, 4);
  const work = scene().choices.find(choice => choice.actionId === 'ensemble:dalloway:main:cover:3');
  assert.equal(work.available, true, work.reason);
  const beforePay = structuredClone(room), workId = crypto.randomUUID();
  const paid = await move(0, room, work.actionId, workId);assert.equal(paid.status, 200, paid.body.error);room = paid.body;
  const receipt = room.players[0].ensemble.receipts.at(-1);
  assert.equal(receipt.paidHours, 4);assert.ok(receipt.cash > 0);
  assert.equal(room.players[0].cash - beforePay.players[0].cash, receipt.cash);
  assert.equal(room.players[0].economyWork.paidHours - beforePay.players[0].economyWork.paidHours, 4);
  assert.equal(room.ensemble.orders.find(saved => saved.id === order.id).status, 'served');
  const committed = JSON.stringify(await store.read(users[0], code));
  assert.deepEqual((await move(0, beforePay, work.actionId, workId)).body, room);
  assert.equal((await move(0, beforePay, work.actionId)).status, 409);
  assert.equal(JSON.stringify(await store.read(users[0], code)), committed);
  assert.deepEqual((await call(0, null, `?code=${code}`)).body.players[0].ensemble, room.players[0].ensemble);
  assert.equal((await call(1, null, `?code=${code}`)).body.players[0].ensemble, undefined);
});

test('older and incomplete ensemble saves reject reads, join, start, moves and saved replays without any writes', async () => {
  const created = await create(0, 'online', 'ensemble-integrity'), code = created.body.code;
  const original = (await store.read(users[0], code)).state;
  const edits = [
    g => {g.schemaVersion = 1;}, g => {g.players[0].schemaVersion = 1;},
    g => {delete g.ensemble;}, g => {g.ensemble = {version: 1};},
    g => {delete g.ensemble.threads.bracken;}, g => {delete g.ensemble.events;},
    g => {delete g.players[0].ensemble;}, g => {delete g.players[0].ensemble.receipts;},
  ];
  for (const edit of edits) {
    const broken = structuredClone(original);edit(broken);
    await pg.query('update crosswalk_private.rooms set state=$1::jsonb where code=$2', [JSON.stringify(broken), code]);
    const before = JSON.stringify(await store.read(users[0], code)), counts = await count();
    const receipts = (await pg.query('select count(*)::int as n from crosswalk_private.request_receipts')).rows[0].n;
    const attempts = [await call(0, null, `?code=${code}`), await call(1, null, `?code=${code}`), await join(1, code),
      await post(0, {op: 'start', code, version: 0}), await move(0, {code, version: 0}, 'ensemble:bracken:main:clarify:0'),
      await create(0, 'online', 'ensemble-integrity')];
    for (const result of attempts) {assert.equal(result.status, 409);assert.equal(result.body.newLifeRequired, true);assert.equal(result.body.players, undefined);}
    assert.equal(JSON.stringify(await store.read(users[0], code)), before);assert.deepEqual(await count(), counts);
    assert.equal((await pg.query('select count(*)::int as n from crosswalk_private.request_receipts')).rows[0].n, receipts);
    assert.equal((await store.history(users[0]))[0].code, code);assert.deepEqual(await store.history(users[1]), []);
  }
});

test('private histories stay owner-only across actual aftermath, travel, fresh-handler reads, posts, replay and saved lists', async () => {
  const { getEnsembleView } = await import('../lib/ensemble-story.ts');
  const { getStoryView } = await import('../lib/story-arcs.ts');
  const { worldChoices } = await import('../lib/world-life.ts');
  let room = (await create(0, 'online', 'private-history-room')).body;
  room = (await join(1, room.code, 'private-history-join')).body;
  room = (await post(0, {op: 'start', code: room.code, version: room.version})).body;
  const code = room.code, ownerSeat = room.mine[0];
  const owner = () => room.players.find(p => p.id === ownerSeat);
  const apply = async (action, destination) => {
    const result = await move(0, room, action, crypto.randomUUID(), destination);
    assert.equal(result.status, 200, result.body.error);room = result.body;
  };
  await apply('aspire:home');
  await apply('visit', 'CORNER CAFÉ');
  const firstScene = getStoryView(room, owner()).scenes.find(scene => scene.id === 'quay-promise');
  const listen = firstScene.choices.find(choice => choice.id.startsWith('listen~'));
  assert.equal(listen.available, true, listen.reason);await apply(`story:${firstScene.id}:${listen.id}`);
  const conversation = worldChoices(owner(), room).find(choice => choice.key === 'talk:alder_tess');
  assert.equal(conversation.available, true, conversation.reason);await apply(`world:${conversation.id}`);
  await apply('visit', 'MARKET');
  await apply('ensemble:late_loaf:main:normal:0');
  await apply('ensemble:late_loaf:main:name:1');
  await apply('visit', 'APARTMENTS');
  await apply('ensemble:bracken:main:clarify:0');
  while (room.round < 2 || room.players[room.turn].id !== ownerSeat) {
    const actor = room.players[room.turn].id === ownerSeat ? 0 : 1;
    const result = await move(actor, room, 'end');assert.equal(result.status, 200, result.body.error);room = result.body;
  }
  room = (await call(0, null, `?code=${code}`)).body;
  await apply('visit', 'MARKET');
  const bakery = getEnsembleView(room, owner(), 'late_loaf').scenes.find(scene => scene.id === 'late_loaf');
  const privateChoice = bakery.choices.find(choice => choice.actionId.includes(':aftermath:') && choice.available && choice.cost.time === 1);
  assert.ok(privateChoice, 'A source-linked, personal bakery aftermath is reachable through legal actions');
  const privateRequest = {protocolVersion: CURRENT_GAME_PROTOCOL, ownerSession: users[0], requestId: 'private-aftermath', op: 'move', code, version: room.version, action: privateChoice.actionId};
  const accepted = await call(0, privateRequest);assert.equal(accepted.status, 200, accepted.body.error);room = accepted.body;
  const privateReceipt = owner().ensemble.receipts.find(receipt => receipt.actionId === privateChoice.actionId);
  const alternative = privateChoice.actionId.split(':')[3];
  assert.equal(owner().world.actionCounts[privateChoice.actionId], 1);
  assert.equal(owner().world.localeHistory.alder.lastAction, privateChoice.actionId);
  assert.ok(owner().life.relationships.mina.history.length > 0);
  assert.ok(owner().story.receipts.length > 0);
  assert.equal(owner().aspiration, 'home');
  assert.equal(owner().world.story.localTalks.alder_tess, 1);
  assert.ok(owner().world.localBonds.alder_tess > 0);

  const assertPrivateAbsent = response => {
    const bytes = JSON.stringify(response);
    assert.equal(bytes.includes(privateChoice.actionId), false);
    assert.equal(bytes.includes(`:aftermath:${alternative}:`), false);
    assert.equal(bytes.includes(JSON.stringify(alternative)), false);
    assert.equal(bytes.includes(privateReceipt.body), false);
  };
  const assertOtherSeat = (view, state) => {
    assertPrivateAbsent(view);
    const masked = view.players.find(p => p.id === ownerSeat), original = state.players.find(p => p.id === ownerSeat);
    assert.equal(masked.castRedacted, true);
    for (const key of ['life', 'story', 'aspiration', 'aspirationWeek', 'ensemble', 'economyWork', 'economyHabits', 'regionalLifeUsage', 'weatherUsage']) assert.equal(masked[key], undefined, key);
    assert.equal(masked.world.story, undefined);
    for (const key of ['actionCounts', 'localBonds', 'localTalkWeeks']) assert.deepEqual(masked.world[key], {}, key);
    for (const key of ['acceptedChoices', 'journal']) assert.deepEqual(masked.world[key], [], key);
    assert.equal(masked.world.companionBond, 0);assert.equal(masked.world.companionStatus, 'unmet');
    for (const [region, history] of Object.entries(masked.world.localeHistory)) {
      assert.equal(history.arrivals, original.world.localeHistory[region].arrivals);
      assert.equal(history.actions, 0);assert.equal(history.lastAction, undefined);assert.deepEqual(history.completedOpportunities, []);
      assert.equal(history.departures.length, original.world.localeHistory[region].departures.length);
      for (const departure of history.departures) {assert.equal(departure.actions, 0);assert.equal(departure.lastAction, undefined);assert.deepEqual(departure.bonds, {});}
    }
    for (const key of ['place', 'cash', 'hours', 'energy', 'joy', 'skill', 'social']) assert.equal(masked[key], original[key], `public ${key}`);
    assert.equal(masked.world.region, original.world.region);
    assert.deepEqual(masked.world.discoveredRegions, original.world.discoveredRegions);
    assert.deepEqual(masked.world.discoveredPlacesByRegion, original.world.discoveredPlacesByRegion);
    const publicEffect = state.ensemble.events.find(event => event.id === privateReceipt.eventId);
    assert.match(publicEffect.actionId, /:aftermath:public:/);
    assert.deepEqual(view.ensemble.events.find(event => event.id === publicEffect.id), publicEffect);
  };
  const beforeReload = await store.read(users[0], code), beforeReloadBytes = JSON.stringify(beforeReload);
  assert.deepEqual(owner(), beforeReload.state.players.find(p => p.id === ownerSeat));
  const otherBeforeTravel = await call(1, null, `?code=${code}`);
  assert.equal(otherBeforeTravel.status, 200);assertOtherSeat(otherBeforeTravel.body, beforeReload.state);

  const fresh = createHandler({store: postgresStore({rpc}), allowedOrigins: [origin], authenticate: async token => {
    const index = tokens.indexOf(token);return index < 0 ? null : {id: users[index], role: 'authenticated', is_anonymous: true};
  }});
  const freshCall = async (actor, body, query = '') => {const response = await fresh(request(actor, body, query));return {status: response.status, body: await response.json()};};
  const reloaded = await freshCall(0, null, `?code=${code}`), replayed = await freshCall(0, privateRequest);
  for (const result of [reloaded, replayed]) {assert.equal(result.status, 200);assert.deepEqual(result.body.players.find(p => p.id === ownerSeat), beforeReload.state.players.find(p => p.id === ownerSeat));}
  assert.equal(JSON.stringify(await store.read(users[0], code)), beforeReloadBytes);

  await apply('visit', 'TRANSIT');
  const travel = worldChoices(owner(), room).find(choice => choice.key === 'travel:saffron');
  assert.equal(travel.available, true, travel.reason);
  const travelRequest = {protocolVersion: CURRENT_GAME_PROTOCOL, ownerSession: users[0], requestId: 'private-travel', op: 'move', code, version: room.version, action: `world:${travel.id}`};
  const travelled = await freshCall(0, travelRequest);assert.equal(travelled.status, 200, travelled.body.error);room = travelled.body;
  const saved = await store.read(users[0], code), stored = saved.state.players.find(p => p.id === ownerSeat), savedBytes = JSON.stringify(saved);
  assert.equal(stored.world.region, 'saffron');
  assert.equal(stored.world.localeHistory.alder.departures.at(-1).lastAction, privateChoice.actionId);
  assert.equal(stored.world.actionCounts[privateChoice.actionId], 1);
  assert.deepEqual(owner(), stored);
  for (const result of [await freshCall(0, null, `?code=${code}`), await freshCall(0, travelRequest), await freshCall(0, privateRequest)]) {
    assert.equal(result.status, 200);assert.deepEqual(result.body.players.find(p => p.id === ownerSeat), stored);
  }
  const guestRequest = {protocolVersion: CURRENT_GAME_PROTOCOL, ownerSession: users[1], requestId: 'private-guest-reload', op: 'join', code, name: 'Player 1'};
  for (const result of [await freshCall(1, null, `?code=${code}`), await freshCall(1, guestRequest), await freshCall(1, guestRequest)]) {
    assert.equal(result.status, 200);assertOtherSeat(result.body, saved.state);
  }
  const outsider = await freshCall(2, null, `?code=${code}`);
  assert.equal(outsider.status, 200);assertPrivateAbsent(outsider.body);
  assert.equal(outsider.body.ensemble, undefined);assert.equal(outsider.body.story, undefined);
  assert.deepEqual(outsider.body.players, [{name: 'First'}, {name: 'Player 1'}]);
  for (const actor of [0, 1, 2]) {
    const history = await freshCall(actor, null, '?history=1');assert.equal(history.status, 200);assertPrivateAbsent(history.body);
    assert.equal(history.body.rooms.length, actor === 2 ? 0 : 1);
    for (const summary of history.body.rooms) assert.deepEqual(Object.keys(summary).sort(), ['code', 'maxRounds', 'mode', 'names', 'round', 'status', 'updatedAt', 'version']);
  }
  assert.equal(JSON.stringify(await store.read(users[0], code)), savedBytes, 'projection, reload and retries must not redact or rewrite the authoritative histories');
});
