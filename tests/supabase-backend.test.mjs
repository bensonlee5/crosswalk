import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { createHandler } from '../supabase/functions/crosswalk-game/handler.ts';
import { postgresStore } from '../supabase/functions/crosswalk-game/postgres-store.ts';
import { createGame, fingerprint, parseMutation } from '../supabase/functions/crosswalk-game/game-service.ts';

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
  const headers = { Origin: origin, Authorization: `Bearer ${tokens[actor]}`, apikey: 'sb_publishable_TEST_ONLY', ...(body ? { 'Content-Type': 'application/json' } : {}), ...extras.headers };
  return new Request(`${origin}/functions/v1/crosswalk-game${query}`, { method: body ? 'POST' : 'GET', ...extras, headers, ...(body ? { body: JSON.stringify(body) } : {}) });
}
async function call(actor, body, query = '', extras = {}) {
  const response = await handler(request(actor, body, query, extras));
  return { response, status: response.status, body: await response.json() };
}
const post = (actor, body) => call(actor, { requestId: crypto.randomUUID(), ownerSession: users[actor], ...body });
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
  assert.equal(room.body.economyVersion, 1);
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

test('receipt survives >100 actions, beyond the legacy game.seen ring', async () => {
  const initial = (await create()).body;
  let room = (await move(0, initial, 'visit', 'ancient-request', 'COMMUNITY')).body;
  for (let i = 0; i < 105; i++) {
    const result = await move(0, room, 'visit', `new-${i}`, i % 2 ? 'COMMUNITY' : 'APARTMENTS');
    assert.equal(result.status, 200); room = result.body;
  }
  assert.equal((await store.read(users[0], room.code)).state.seen.includes('ancient-request'), false);
  const replay = await move(0, initial, 'visit', 'ancient-request', 'COMMUNITY');
  assert.equal(replay.status, 200); assert.equal(replay.body.version, room.version);
  assert.deepEqual(replay.body.players, room.players);
});

test('SQL CAS conflicts roll back membership, counters and receipts together', async () => {
  const room = (await create(0, 'online')).body;
  const before = await store.read(users[0], room.code);
  const joined = (await join(1, room.code)).body;
  const candidate = structuredClone(before.state);
  const newcomer = structuredClone(joined.players[1]); newcomer.id = crypto.randomUUID();
  candidate.players.push(newcomer); candidate.members[users[2]] = [newcomer.id];
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

test('SQL protects owner/member/version flags even from a buggy trusted adapter', async () => {
  const room = (await create()).body, record = await store.read(users[0], room.code);
  const changed = structuredClone(record.state); changed.balanceVersion = 999;
  await assert.rejects(store.commit({ actor: users[0], requestId: 'bad-engine-flag', fingerprint: 'b'.repeat(64), op: 'move', code: room.code, expectedVersion: 0, state: changed }), /22023/);
  assert.equal((await store.read(users[0], room.code)).version, 0);
  const forbidden = structuredClone(record.state); forbidden.members[users[1]] = forbidden.members[users[0]]; delete forbidden.members[users[0]]; forbidden.host = users[1];
  await assert.rejects(store.commit({ actor: users[1], requestId: 'steal', fingerprint: 'c'.repeat(64), op: 'move', code: room.code, expectedVersion: 0, state: forbidden }), /22023/);
});

test('legacy unversioned room joins preserve original game-engine rules', async () => {
  const made = (await create(0, 'online')).body;
  const record = await store.read(users[0], made.code), old = record.state;
  for (const key of ['rulesVersion','lifeVersion','lifeSeed','lifeSchedule','worldVersion','storyVersion','economyVersion','balanceVersion','environmentVersion','weatherSchedule','story','sharedWorld']) delete old[key];
  for (const p of old.players) {
    for (const key of ['rulesVersion','craft','legacy','stories','storyWeeks','life','world','storyVersion','story','economyVersion','economyInitialized','economyWork','economyHabits','balanceVersion']) delete p[key];
    p.cash = 1100;
  }
  await pg.query('update crosswalk_private.rooms set state = $1 where code = $2', [JSON.stringify(old), made.code]);
  const joined = await join(1, made.code);
  assert.equal(joined.status, 200); assert.equal(joined.body.rulesVersion, undefined);
  assert.equal(joined.body.players[1].cash, 1100); assert.equal(joined.body.players[1].rulesVersion, undefined);
  assert.equal(joined.body.players[1].economyVersion, undefined); assert.equal(joined.body.players[1].life, undefined);
});

test('body limits and invalid commands fail without writes', async () => {
  const huge = await post(0, { op: 'create', mode: 'hotseat', names: ['Test'], junk: 'x'.repeat(5000) });
  assert.equal(huge.status, 413);
  const noID = await call(0, { op: 'create', mode: 'hotseat', names: ['Test'], ownerSession: users[0] }); assert.equal(noID.status, 400);
  const wrong = await post(0, { op: 'state', players: [{ cash: 9999 }] }); assert.equal(wrong.status, 400);
  assert.equal((await count()).participating_identities, 0);
});

test('same normalized request has same fingerprint regardless of JSON property order', async () => {
  const a = { op: 'create', mode: 'hotseat', names: ['One'], requestId: 'id', ownerSession: users[0] };
  const b = { names: ['One'], ownerSession: users[0], mode: 'hotseat', op: 'create', requestId: 'id', cash: 88888 };
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

test('engine bundle matches the verified v34 source snapshot', async () => {
  const base = new URL('../supabase/functions/_shared/engine/', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('../supabase/functions/_shared/engine-manifest.json', import.meta.url), 'utf8'));
  for (const file of await readdir(base)) {
    if (!file.endsWith('.ts')) continue;
    assert.equal(createHash('sha256').update(await readFile(new URL(file, base))).digest('hex'), manifest.sha256[file], file);
  }
});
