import {CURRENT_GAME_PROTOCOL} from '../lib/current-game.ts';
import assert from 'node:assert/strict';
import test from 'node:test';
import {createGame, memberView, parseMutation} from '../supabase/functions/crosswalk-game/game-service.ts';

const actor = '00000000-0000-4000-8000-000000000001';
const command = requestId => ({op: 'create', mode: 'hotseat', names: ['First'], ownerSession: actor, protocolVersion:CURRENT_GAME_PROTOCOL, requestId});

test('request identifiers intentionally reject every C0 control character without trimming or replacing input', () => {
  for (let code = 0; code <= 0x1f; code++) {
    const body = command(`before${String.fromCharCode(code)}after`), before = structuredClone(body);
    assert.throws(() => parseMutation(body, actor), /A stable request ID is required/, `U+${code.toString(16).padStart(4, '0')}`);
    assert.deepEqual(body, before);
  }
  for (const requestId of ['stable-request-123', ' '.repeat(80), 'café-request', `before${String.fromCharCode(0x7f)}after`]) {
    assert.equal(parseMutation(command(requestId), actor).requestId, requestId);
  }
  for (const requestId of ['', 'a'.repeat(81), null, 7]) {
    assert.throws(() => parseMutation(command(requestId), actor), /A stable request ID is required/);
  }
});

test('member response rest destructuring omits private server fields and preserves the saved state', () => {
  const state = createGame(command('private-creation-id'), 'ABC234');
  const before = structuredClone(state), room = {code: state.code, state, version: 7, updated_at: 123};
  const view = memberView(room, actor);
  for (const key of ['members', 'host', 'lifeSeed', 'lifeSchedule', 'actionIncidentRng', 'creationRequestId']) {
    assert.ok(Object.hasOwn(state, key), `fixture includes ${key}`);
    assert.equal(Object.hasOwn(view, key), false, `${key} must not be a response field`);
  }
  assert.deepEqual(view.mine, state.members[actor]);
  assert.equal(view.isHost, true);
  assert.equal(view.version, 7);
  assert.deepEqual(state, before);
  assert.throws(() => memberView(room, '00000000-0000-4000-8000-000000000002'), /does not own a seat/);
  assert.deepEqual(state, before);
});
