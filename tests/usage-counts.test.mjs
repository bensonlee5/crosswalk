import assert from 'node:assert/strict';
import test from 'node:test';
import {createD1Double} from './d1-double.mjs';
import {participantCountStatement, readParticipantCount} from '../lib/usage-counts.ts';

const host = 'a'.repeat(64);
const guest = 'b'.repeat(64);
const other = 'c'.repeat(64);
const state = members => JSON.stringify({members});
const insert = (db, code, members) => db.prepare(
  'INSERT INTO rooms (code, state, version, updated_at) VALUES (?, ?, 0, ?)',
).bind(code, state(members), 1);
const join = (db, code, members, version) => db.prepare(
  'UPDATE rooms SET state = ?, version = version + 1, updated_at = ? WHERE code = ? AND version = ?',
).bind(state(members), 2, code, version);

test('schema adds only a hash set, with no historical backfill or identity/activity fields', async () => {
  const {db, sqlite, close} = createD1Double();
  try {
    assert.equal(await readParticipantCount(db), 0);
    assert.deepEqual(sqlite.prepare('PRAGMA table_info(usage_browsers)').all().map(column => column.name), ['guest_hash']);
    assert.equal(sqlite.prepare('PRAGMA table_info(usage_browsers)').all()[0].pk, 1);
  } finally { close(); }
});

test('one browser counts once across hotseat seats, multiple rooms and request retries', async () => {
  const {db, close} = createD1Double();
  try {
    await db.batch([insert(db, 'AAAAAA', {[host]: ['seat1', 'seat2', 'seat3', 'seat4']}), participantCountStatement(db, host, 'AAAAAA')]);
    assert.equal(await readParticipantCount(db), 1);
    await db.batch([insert(db, 'BBBBBB', {[host]: ['seat5']}), participantCountStatement(db, host, 'BBBBBB')]);
    await db.batch([participantCountStatement(db, host, 'AAAAAA'), participantCountStatement(db, host, 'BBBBBB')]);
    assert.equal(await readParticipantCount(db), 1);
  } finally { close(); }
});

test('only accepted joins count; losing a room-version race does not count a guest', async () => {
  const {db, close} = createD1Double();
  try {
    await db.batch([insert(db, 'AAAAAA', {[host]: ['seat1']}), participantCountStatement(db, host, 'AAAAAA')]);
    const winner = await db.batch([join(db, 'AAAAAA', {[host]: ['seat1'], [guest]: ['seat2']}, 0), participantCountStatement(db, guest, 'AAAAAA')]);
    assert.equal(winner[0].meta.changes, 1);
    const loser = await db.batch([join(db, 'AAAAAA', {[host]: ['seat1'], [other]: ['seat3']}, 0), participantCountStatement(db, other, 'AAAAAA')]);
    assert.equal(loser[0].meta.changes, 0);
    assert.equal(loser[1].meta.changes, 0);
    assert.equal(await readParticipantCount(db), 2);
    await db.batch([join(db, 'AAAAAA', {[host]: ['seat1'], [guest]: ['seat2'], [other]: ['seat3']}, 1), participantCountStatement(db, other, 'AAAAAA')]);
    assert.equal(await readParticipantCount(db), 3);
  } finally { close(); }
});

test('intermediate save statements do not alter eligibility and reads do not add users', async () => {
  const {db, close} = createD1Double();
  try {
    await db.batch([insert(db, 'AAAAAA', {[host]: ['seat1']}), db.prepare('SELECT 1'), participantCountStatement(db, host, 'AAAAAA')]);
    await participantCountStatement(db, guest, 'AAAAAA').run();
    await participantCountStatement(db, guest, 'ZZZZZZ').run();
    for (let i = 0; i < 5; i++) assert.equal(await readParticipantCount(db), 1);
  } finally { close(); }
});

test('failed room creation cannot increment the count', async () => {
  const {db, close} = createD1Double();
  try {
    await db.batch([insert(db, 'AAAAAA', {[host]: ['seat1']}), participantCountStatement(db, host, 'AAAAAA')]);
    await assert.rejects(db.batch([insert(db, 'AAAAAA', {[guest]: ['seat2']}), participantCountStatement(db, guest, 'AAAAAA')]), /UNIQUE/);
    assert.equal(await readParticipantCount(db), 1);
  } finally { close(); }
});

test('room and count either commit together or roll back together', async () => {
  const {db, rows, sqlite, close} = createD1Double();
  try {
    sqlite.exec("CREATE TRIGGER fail_usage BEFORE INSERT ON usage_browsers BEGIN SELECT RAISE(ABORT, 'test count failure'); END");
    await assert.rejects(db.batch([insert(db, 'AAAAAA', {[host]: ['seat1']}), participantCountStatement(db, host, 'AAAAAA')]), /test count failure/);
    assert.equal(rows.size, 0);
    assert.equal(await readParticipantCount(db), 0);
    sqlite.exec('DROP TRIGGER fail_usage');
    await db.batch([insert(db, 'AAAAAA', {[host]: ['seat1']}), participantCountStatement(db, host, 'AAAAAA')]);
    assert.equal(rows.size, 1);
    assert.equal(await readParticipantCount(db), 1);
  } finally { close(); }
});

test('count survives independent of old room retention and does not enumerate identifiers', async () => {
  const {db, rows, close} = createD1Double();
  try {
    await db.batch([insert(db, 'AAAAAA', {[host]: ['seat1']}), participantCountStatement(db, host, 'AAAAAA')]);
    rows.delete('AAAAAA');
    const aggregate = await readParticipantCount(db);
    assert.equal(aggregate, 1);
    assert.equal(typeof aggregate, 'number');
    await db.batch([insert(db, 'BBBBBB', {[host]: ['seat2']}), participantCountStatement(db, host, 'BBBBBB')]);
    assert.equal(await readParticipantCount(db), 1);
  } finally { close(); }
});

test('helper rejects malformed identity input instead of expanding retained data', () => {
  const {db, close} = createD1Double();
  try {
    for (const invalid of ['', 'raw-token', 'user@example.com', host + '0', 'A'.repeat(64)]) {
      assert.throws(() => participantCountStatement(db, invalid, 'AAAAAA'), /Invalid participant/);
    }
    assert.throws(() => participantCountStatement(db, host, 'not-a-room'), /Invalid participant/);
  } finally { close(); }
});
