import assert from 'node:assert/strict';
import test from 'node:test';
import { CURRENT_GAME_PROTOCOL, CURRENT_GAME_SCHEMA, currentGameQuery } from '../lib/current-game.ts';
import { pendingSaves, rememberPending } from '../lib/save-session.ts';
import { homeHarness } from './support/home-harness.mjs';
function setup(t, options) { const h = homeHarness(options); t.after(() => h.dispose()); return h; }
const posts = h => h.calls.filter(call => call.opts.method === 'POST');
const lastRequest = h => JSON.parse(posts(h).at(-1).opts.body);
const pending = h => JSON.parse(JSON.stringify(pendingSaves(h.locals)));
const snapshot = h => structuredClone(h.game);
async function finishMonth(h) { h.component('GameScreen').props.onEnd(); h.render(); await h.click('Settle bills & end month'); }
function changeStoredGame(h, update) { const row = h.api.rows.get(h.game.code); const game = JSON.parse(row.state); update(game); row.state = JSON.stringify(game); return row; }
async function postAs(h, request, actor = h.record.owner) { return h.api.request(new Request('https://test.invalid/api/game', { method: 'POST', headers: { Origin: 'https://test.invalid', 'Content-Type': 'application/json' }, body: JSON.stringify(request) }), actor); }
for (const count of [1, 2, 3, 4]) {
    await test(`current ${count}-player campaign completes all eight months and restores ending`, async (t) => {
        const h = setup(t);
        await h.start(count);
        assert.equal(h.game.schemaVersion, CURRENT_GAME_SCHEMA);
        assert.equal(h.game.players.length, count);
        assert.equal(h.game.actionIncidentRng, undefined, 'private incident entropy is never exposed');
        for (const player of h.game.players) {
            assert.equal(player.schemaVersion, CURRENT_GAME_SCHEMA);
            assert.equal(player.career.contracts.length, 0);
            assert.equal(player.finance.version, 1);
        }
        const code = h.game.code, names = h.game.players.map(player => player.name), order = [];
        while (h.component('GameScreen')) {
            await h.dismissTurn();
            const game = h.game, player = game.players[game.turn];
            order.push(`${game.round}:${player.name}`);
            const initialHours = player.hours;
            // Current recovery choices remain usable even after money troubles begin.
            await h.visit('APARTMENTS');
            assert.equal(h.game.players[h.game.turn].hours, initialHours);
            for (let i = 0; i < 3; i++)
                await h.move('home_reset');
            assert.equal(h.game.players[h.game.turn].hours, initialHours - 3);
            await finishMonth(h);
        }
        assert.equal(order.length, count * 8);
        for (let month = 1; month <= 8; month++)
            assert.deepEqual(order.slice((month - 1) * count, month * count), Array.from({ length: count }, (_, i) => `${month}:${names[((month - 1) % count + i) % count]}`));
        assert.ok(h.component('LifeEnding'));
        assert.equal(posts(h).filter(call => JSON.parse(call.opts.body).action === 'end').length, count * 8);
        assert.equal(JSON.parse(h.api.rows.get(code).state).status, 'finished');
        const restored = setup(t, { api: h.api, owner: h.record.owner, query: '?room=' + code });
        await restored.settle();
        assert.ok(restored.component('LifeEnding'));
        assert.equal(restored.game.code, code);
    });
}
await test('free travel, repeated current actions and zero-block rejection use public Home callbacks', async (t) => {
    const h = setup(t);
    await h.start(1);
    for (const place of ['THE PARK', 'APARTMENTS', 'THE PARK', 'APARTMENTS']) {
        await h.visit(place);
        assert.equal(h.game.players[0].place, place);
        assert.equal(h.game.players[0].hours, 6);
    }
    const first = h.component('GameScreen');
    await Promise.all([first.props.onAction('home_reset'), first.props.onAction('home_reset')]);
    await h.settle();
    h.tick();
    assert.equal(h.game.players[0].hours, 5, 'rapid duplicate only spends one block');
    for (let i = 0; i < 5; i++)
        await h.move('home_reset');
    assert.equal(h.game.players[0].hours, 0);
    const before = snapshot(h);
    await h.move('home_reset');
    assert.deepEqual(h.game, before);
    assert.ok(h.find(node => node.props?.role === 'alert').length);
});
for (const op of ['create', 'join']) {
    await test(`pending ${op} excludes saved-room restore and releases the mutation lock`, async (t) => {
        const h = setup(t);
        await h.start();
        const original = h.game.code;
        await h.home();
        if (op === 'join') {
            await h.click('Have a room code? Join friends');
            h.find(node => node.type === 'input' && node.props.placeholder === 'ABC234')[0].props.onChange({ target: { value: original } });
            h.find(node => node.type === 'input' && node.props.placeholder === 'First name or nickname')[0].props.onChange({ target: { value: 'Alex' } });
            h.render();
        }
        const release = h.hold();
        const started = h.button(op === 'create' ? 'Start our game' : 'Join the room').props.onClick();
        await h.settle();
        await h.waitUntilHeld();
        const resume = h.button(op === 'create' ? 'Resume my last game' : 'Resume on this browser');
        assert.equal(resume.props.disabled, true);
        const calls = h.calls.length;
        await resume.props.onClick();
        await h.settle();
        assert.equal(h.calls.length, calls);
        release();
        await started;
        await h.settle();
        h.tick();
        await h.dismissTurn();
        assert.equal(h.component('GameScreen').props.busy, false);
        assert.equal(h.game.code === original, op === 'join');
        await h.move('home_reset');
        assert.equal(h.game.players[0].hours, 5);
    });
}
await test('pending restore excludes create, join and another restore', async (t) => {
    const h = setup(t);
    await h.start();
    const code = h.game.code;
    await h.home();
    const release = h.hold('GET'), restoring = h.button('Resume my last game').props.onClick();
    h.render();
    await h.waitUntilHeld();
    assert.equal(h.button('Start our game').props.disabled, true);
    let calls = h.calls.length;
    await h.button('Start our game').props.onClick();
    assert.equal(h.calls.length, calls);
    await h.click('Have a room code? Join friends');
    assert.equal(h.button('Join the room').props.disabled, true);
    assert.equal(h.button('Resume on this browser').props.disabled, true);
    calls = h.calls.length;
    await h.button('Join the room').props.onClick();
    await h.button('Resume on this browser').props.onClick();
    assert.equal(h.calls.length, calls);
    release();
    await restoring;
    await h.settle();
    assert.equal(h.game.code, code);
    assert.equal(h.component('GameScreen').props.busy, false);
    await h.move('home_reset');
    assert.equal(h.game.players[0].hours, 5);
});
for (const missing of [false, true]) {
    await test(`cancelled ${missing ? 'failed' : 'successful'} restore cannot replace or unlock a newer create`, async (t) => {
        const h = setup(t);
        await h.start();
        await h.home();
        if (missing) {
            await h.click('Have a room code? Join friends');
            h.find(node => node.type === 'input' && node.props.placeholder === 'ABC234')[0].props.onChange({ target: { value: 'BAD123' } });
            h.render();
        }
        const releaseRead = h.hold('GET'), restoring = h.button(missing ? 'Resume on this browser' : 'Resume my last game').props.onClick();
        h.render();
        await h.waitUntilHeld();
        await h.home();
        const releaseWrite = h.hold(), creating = h.button('Start our game').props.onClick();
        await h.waitUntilHeld();
        releaseRead();
        await restoring;
        await h.settle();
        assert.equal(h.component('GameScreen'), undefined);
        assert.equal(h.find(node => node.props?.role === 'alert').length, 0);
        assert.equal(h.button('Setting the table…').props.disabled, true);
        const calls = h.calls.length;
        await h.button('Resume my last game').props.onClick();
        assert.equal(h.calls.length, calls);
        releaseWrite();
        await creating;
        await h.settle();
        h.tick();
        assert.equal(h.component('GameScreen').props.busy, false);
    });
}
await test('failed restore releases the transition lock for a new life', async (t) => {
    const h = setup(t, { query: '?room=BAD123' });
    await h.settle();
    assert.ok(h.find(node => node.props?.role === 'alert').length);
    await h.home();
    await h.start();
    assert.equal(h.component('GameScreen').props.busy, false);
});
await test('late lower-version poll cannot roll back a confirmed action', async (t) => {
    const h = setup(t);
    await h.start();
    const before = snapshot(h);
    const release = h.hold('GET');
    h.poll();
    await h.waitUntilHeld();
    await h.move('home_reset');
    const saved = snapshot(h);
    assert.equal(saved.version, before.version + 1);
    release();
    await h.settle();
    assert.deepEqual(h.game, saved);
    assert.equal(h.component('GameScreen').props.busy, false);
});
for (const interruption of ['before', 'after']) {
    await test(`lost response ${interruption} server commit replays exact owner, ID and version after reload`, async (t) => {
        const h = setup(t);
        await h.start(1);
        const code = h.game.code;
        h.record.failPost = interruption;
        await h.move('home_reset');
        assert.equal(h.game.players[0].hours, 6);
        assert.equal(h.component('GameScreen').props.busy, true);
        assert.deepEqual(h.sounds, ['start']);
        const original = lastRequest(h);
        assert.equal(original.protocolVersion, CURRENT_GAME_PROTOCOL);
        assert.equal(original.ownerSession, h.record.owner);
        assert.equal(original.version, 0);
        assert.deepEqual(pending(h)[0].request, original);
        const calls = h.calls.length;
        await h.move('home_reset');
        h.poll();
        await h.settle();
        assert.equal(h.calls.length, calls);
        h.dispose();
        const restored = setup(t, { api: h.api, owner: h.record.owner, local: h.locals, query: '?room=' + code });
        await restored.settle();
        restored.tick();
        await restored.settle();
        assert.equal(restored.game.players[0].hours, 5);
        assert.equal(restored.game.version, 1);
        assert.deepEqual(lastRequest(restored), original);
        assert.equal(pending(restored).length, 0);
        assert.deepEqual(restored.sounds, []);
        assert.equal(restored.component('GameScreen').props.busy, false);
        assert.equal(h.api.receipts.size, 2, 'one create and one move receipt, including replay');
    });
}
await test('another tab winning the version race clears an unapplied stale request without double spending', async (t) => {
    const h = setup(t);
    await h.start();
    h.record.failPost = 'before';
    await h.move('home_reset');
    const response = await postAs(h, { ...lastRequest(h), requestId: crypto.randomUUID() });
    assert.equal(response.status, 200);
    h.record.failPost = null;
    await h.click('Check saved action');
    assert.equal(h.game.version, 1);
    assert.equal(h.game.players[0].hours, 5);
    assert.equal(pending(h).length, 0);
    assert.equal(h.component('GameScreen').props.busy, false);
    assert.match(h.text(h.find(node => node.props?.role === 'alert')[0]), /room changed/i);
});
await test('blocked browser storage preserves in-tab recovery and server history restore', async (t) => {
    const h = setup(t, { storageBlocked: true });
    await h.start();
    const code = h.game.code;
    h.record.failPost = 'after';
    await h.move('home_reset');
    h.record.failPost = null;
    await h.click('Check saved action');
    assert.equal(h.game.players[0].hours, 5);
    const restored = setup(t, { api: h.api, owner: h.record.owner, storageBlocked: true, query: '?room=' + code });
    await restored.settle();
    assert.equal(restored.game.players[0].hours, 5);
});
await test('server history restores multiple private seats without a local room pointer', async (t) => {
    const h = setup(t);
    await h.start();
    const first = h.game.code;
    await h.home();
    await h.start();
    assert.notEqual(h.game.code, first);
    const restored = setup(t, { api: h.api, owner: h.record.owner });
    await restored.settle();
    const rooms = restored.find(node => node.props?.className === 'saved-room');
    assert.equal(rooms.length, 2);
    await restored.invoke(rooms.find(node => restored.text(node).includes(first)).props.onClick);
    assert.equal(restored.game.code, first);
    const stranger = setup(t, { api: h.api });
    await stranger.settle();
    assert.equal(stranger.find(node => node.props?.className === 'saved-room').length, 0);
});
await test('saved-room history pagination reaches all rooms through the real service cursor', async (t) => {
    const h = setup(t);
    const codes = [];
    for (let i = 0; i < 22; i++) {
        await h.start();
        codes.push(h.game.code);
        await h.home();
    }
    assert.equal(h.find(node => node.props?.className === 'saved-room').length, 20);
    await h.click('Load older saved games');
    const rooms = h.find(node => node.props?.className === 'saved-room');
    assert.equal(rooms.length, 22);
    assert.equal(new Set(rooms.map(node => h.text(node))).size, 22);
    for (const code of codes)
        assert.ok(rooms.some(node => h.text(node).includes(code)));
    assert.equal(h.find(node => node.type === 'button' && h.text(node) === 'Load older saved games').length, 0);
    assert.ok(h.calls.some(call => new URL(call.url, 'https://test.invalid').searchParams.has('cursor')));
});
await test('wrong identity keeps the original pending request and deferred recovery requires an explicit click', async (t) => {
    const h = setup(t);
    await h.start();
    const code = h.game.code, owner = h.record.owner;
    h.record.failPost = 'before';
    await h.move('home_reset');
    const original = lastRequest(h);
    h.record.failPost = null;
    h.record.owner = crypto.randomUUID();
    await h.click('Check saved action');
    assert.deepEqual(pending(h)[0].request, original);
    await h.home();
    assert.equal(h.component('AccountPanel').props.disabled, false);
    await h.click('Check later');
    assert.equal(h.button('Start our game').props.disabled, false);
    assert.notEqual(pending(h)[0].unsupported, true, 'a click event must not mark a recoverable action unsupported');
    const restored = setup(t, { api: h.api, owner: h.record.owner, local: h.locals });
    await restored.settle();
    assert.equal(posts(restored).length, 0);
    assert.ok(restored.button('Check ' + code + ' action'));
    restored.setOwner(owner);
    await restored.settle();
    await restored.click('Check ' + code + ' action');
    assert.equal(restored.game.players[0].hours, 5);
    assert.equal(restored.game.version, 1);
    assert.equal(pending(restored).length, 0);
    assert.deepEqual(lastRequest(restored), original);
});
await test('401 after a committed response loss preserves the original identity-bound receipt', async (t) => {
    const h = setup(t);
    await h.start();
    h.record.failPost = 'after';
    await h.move('home_reset');
    const original = lastRequest(h);
    h.record.failPost = null;
    h.record.unauthorized = true;
    await h.click('Check saved action');
    assert.deepEqual(pending(h)[0].request, original);
    await h.home();
    assert.equal(h.component('AccountPanel').props.disabled, false);
    h.record.unauthorized = false;
    await h.click('Check saved action');
    assert.deepEqual(lastRequest(h), original);
    assert.equal(h.game.players[0].hours, 5);
    assert.equal(h.game.version, 1);
    assert.equal(pending(h).length, 0);
});
for (const finished of [false, true]) {
    await test(`owner switch clears ${finished ? 'ending' : 'playing'} state and previous-owner history`, async (t) => {
        const h = setup(t);
        await h.start();
        if (finished) {
            changeStoredGame(h, game => { game.status = 'finished'; }).version++;
            h.poll();
            await h.settle();
            assert.ok(h.component('LifeEnding'));
        }
        h.setOwner(crypto.randomUUID());
        await h.settle();
        assert.equal(h.component('GameScreen'), undefined);
        assert.equal(h.component('LifeEnding'), undefined);
        assert.equal(h.find(node => node.props?.className === 'saved-room').length, 0);
        assert.equal(h.find(node => node.type === 'button' && h.text(node) === 'Resume my last game').length, 0);
    });
}
for (const signOut of [false, true]) {
    await test(`${signOut ? 'sign-out' : 'new-user switch'} invalidates a delayed previous-owner save`, async (t) => {
        const h = setup(t);
        await h.start();
        const release = h.hold(), saving = h.component('GameScreen').props.onAction('home_reset');
        await h.waitUntilHeld();
        h.setOwner(signOut ? null : crypto.randomUUID());
        await h.settle();
        release();
        await saving;
        await h.settle();
        h.tick();
        assert.equal(h.component('GameScreen'), undefined);
        assert.equal(h.find(node => node.props?.className === 'saved-room').length, 0);
        assert.deepEqual(h.sounds, ['start']);
    });
}
await test('a delayed previous-owner history response cannot repopulate the new owner’s saved seats', async (t) => {
    const h = setup(t);
    await h.start();
    const release = h.hold('GET', url => new URL(url, 'https://test.invalid').searchParams.has('history'));
    await h.home();
    await h.waitUntilHeld();
    h.setOwner(crypto.randomUUID());
    await h.settle();
    assert.equal(h.find(node => node.props?.className === 'saved-room').length, 0);
    release();
    await h.settle();
    assert.equal(h.find(node => node.props?.className === 'saved-room').length, 0);
    assert.equal(h.find(node => node.type === 'button' && h.text(node) === 'Resume my last game').length, 0);
});
await test('a stale room callback cannot spend a newly opened room’s blocks', async (t) => {
    const h = setup(t);
    await h.start();
    const old = h.component('GameScreen');
    await h.home();
    await h.start();
    assert.notEqual(h.game.code, old.props.g.code);
    const calls = h.calls.length;
    await h.invoke(old.props.onAction, 'home_reset');
    assert.equal(h.calls.length, calls);
    assert.equal(h.game.players[0].hours, 6);
});
await test('a stale acknowledged callback is ignored while a freshly rendered action works', async (t) => {
    const h = setup(t);
    await h.start();
    const old = h.component('GameScreen');
    await h.invoke(old.props.onAction, 'home_reset');
    const calls = h.calls.length;
    await h.invoke(old.props.onAction, 'home_reset');
    assert.equal(h.calls.length, calls);
    assert.equal(h.game.players[0].hours, 5);
    await h.move('home_reset');
    assert.equal(h.game.players[0].hours, 4);
});
await test('malformed successful POST keeps the confirmed snapshot and exact recoverable intent', async (t) => {
    const h = setup(t);
    await h.start();
    const before = snapshot(h);
    h.record.malformedPost = true;
    await h.move('home_reset');
    assert.deepEqual(h.game, before);
    assert.equal(h.find(node => node.props?.className === 'reconnect-banner').length, 1);
    const original = lastRequest(h);
    assert.deepEqual(pending(h)[0].request, original);
    h.record.malformedPost = false;
    await h.click('Check saved action');
    assert.deepEqual(lastRequest(h), original);
    assert.equal(h.game.players[0].hours, 5);
    assert.equal(h.game.version, 1);
    assert.equal(pending(h).length, 0);
});
await test('malformed room reads retain the last confirmed state until reconnection', async (t) => {
    const h = setup(t);
    await h.start();
    const before = snapshot(h);
    h.record.malformedGet = true;
    h.poll();
    await h.settle();
    assert.deepEqual(h.game, before);
    assert.equal(h.find(node => node.props?.className === 'reconnect-banner').length, 1);
    h.record.malformedGet = false;
    await h.click('Reconnect');
    assert.equal(h.component('GameScreen').props.offline, false);
});
await test('current semantic audio plays only for confirmed deliberate actions', async (t) => {
    const h = setup(t);
    await h.start();
    h.sounds.length = 0;
    const first = h.component('GameScreen'), release = h.hold();
    const saving = first.props.onAction('home_meal');
    await h.waitUntilHeld();
    assert.deepEqual(h.sounds, []);
    await first.props.onAction('home_meal');
    assert.deepEqual(h.sounds, []);
    release();
    await saving;
    await h.settle();
    h.tick();
    assert.deepEqual(h.sounds, ['cook']);
    await h.invoke(first.props.onAction, 'home_meal');
    h.poll();
    await h.settle();
    assert.deepEqual(h.sounds, ['cook']);
    await h.visit('CORNER CAFÉ');
    h.sounds.length = 0;
    await h.move('cafe_break');
    assert.deepEqual(h.sounds, ['sip']);
    await h.move('cafe_break');
    assert.deepEqual(h.sounds, ['sip']);
    h.component('GameScreen').props.onEnd();
    h.render();
    h.find(node => node.type === 'AlertDialog' && node.props.open)[0].props.onOpenChange(false);
    h.render();
    assert.deepEqual(h.sounds, ['sip']);
});
for (const failure of ['before', 'after']) {
    await test(`recovered meal ${failure} commit remains silent`, async (t) => {
        const h = setup(t);
        await h.start();
        h.sounds.length = 0;
        h.record.failPost = failure;
        await h.move('home_meal');
        assert.deepEqual(h.sounds, []);
        h.record.failPost = null;
        await h.click('Check saved action');
        assert.deepEqual(h.sounds, []);
        assert.equal(h.game.version, 1);
    });
}
await test('leaving a room silences a delayed accepted meal', async (t) => {
    const h = setup(t);
    await h.start();
    h.sounds.length = 0;
    const release = h.hold(), saving = h.component('GameScreen').props.onAction('home_meal');
    await h.waitUntilHeld();
    await h.home();
    release();
    await saving;
    await h.settle();
    h.tick();
    assert.deepEqual(h.sounds, []);
    assert.equal(h.component('GameScreen'), undefined);
});
await test('online play uses separate owners and only the sending device sounds', async (t) => {
    const host = setup(t);
    await host.settle();
    host.find(node => node.props?.['aria-label'] === 'Play mode')[0].props.onValueChange('online');
    host.render();
    host.find(node => node.type === 'input' && node.props.placeholder === 'Your first name or nickname')[0].props.onChange({ target: { value: 'Host' } });
    host.render();
    await host.click('Create a room');
    const code = host.text(host.find(node => node.props?.className === 'room-code')[0]).trim();
    const guest = setup(t, { api: host.api, query: '?room=' + code });
    await guest.settle();
    guest.find(node => node.type === 'input' && node.props.placeholder === 'First name or nickname')[0].props.onChange({ target: { value: 'Guest' } });
    guest.render();
    await guest.click('Join the room');
    host.poll();
    await host.settle();
    await host.click('Start with 2 players');
    await host.click('Start the game');
    guest.poll();
    await guest.settle();
    await host.dismissTurn();
    await guest.dismissTurn();
    assert.equal(guest.game.players[0].finance, undefined, 'the remote player’s private bill state stays redacted');
    assert.equal(guest.component('GameScreen').props.active, false);
    host.sounds.length = 0;
    guest.sounds.length = 0;
    await host.move('home_meal');
    guest.poll();
    await guest.settle();
    assert.deepEqual(host.sounds, ['cook']);
    assert.deepEqual(guest.sounds, []);
    await guest.move('home_meal');
    assert.deepEqual(guest.sounds, []);
    assert.equal(host.game.version, guest.game.version);
    await finishMonth(host);
    guest.poll();
    await guest.settle();
    await guest.dismissTurn();
    assert.equal(host.component('GameScreen').props.active, false, 'a new remote turn must render without reading its private bills');
    assert.equal(guest.component('GameScreen').props.active, true);
    host.sounds.length = 0;
    guest.sounds.length = 0;
    await guest.move('home_meal');
    host.poll();
    await host.settle();
    assert.deepEqual(guest.sounds, ['cook']);
    assert.deepEqual(host.sounds, []);
});
await test('protocol rejection keeps exact pending intent and confirmed state until page refresh', async (t) => {
    const h = setup(t);
    await h.start();
    const before = snapshot(h);
    h.record.protocolFault = true;
    await h.move('home_reset');
    assert.deepEqual(h.game, before);
    const original = pending(h)[0].request;
    assert.equal(original.protocolVersion, CURRENT_GAME_PROTOCOL);
    assert.ok(h.button('Reload latest page'));
    assert.equal(h.component('GameScreen').props.active, false);
    await h.click('Reload latest page');
    assert.equal(h.record.reloads, 1);
    h.dispose();
    const refreshed = setup(t, { api: h.api, owner: h.record.owner, local: h.locals, query: '?room=' + before.code });
    await refreshed.settle();
    refreshed.tick();
    await refreshed.settle();
    assert.deepEqual(lastRequest(refreshed), original);
    assert.equal(pending(refreshed).length, 0);
    assert.equal(refreshed.game.players[0].hours, 5);
});
await test('a protocol-refresh read guard cannot be cleared by later successful polling', async (t) => {
    const h = setup(t);
    await h.start();
    const before = snapshot(h);
    h.record.protocolFault = true;
    h.poll();
    await h.settle();
    assert.deepEqual(h.game, before);
    assert.ok(h.button('Reload latest page'));
    assert.equal(h.component('GameScreen').props.active, false);
    h.record.protocolFault = false;
    h.poll();
    await h.settle();
    assert.equal(h.component('GameScreen').props.active, false);
    const calls = h.calls.length;
    await h.move('home_reset');
    assert.equal(h.calls.length, calls);
    for (const call of h.calls.filter(call => call.opts.method !== 'POST'))
        assert.equal(new URL(call.url, 'https://test.invalid').searchParams.get('protocolVersion'), String(CURRENT_GAME_PROTOCOL));
});
await test('unsupported saved schema stops polling and allows a fresh current life', async (t) => {
    const h = setup(t);
    await h.start();
    const original = h.game.code;
    changeStoredGame(h, game => { delete game.schemaVersion; });
    h.poll();
    await h.settle();
    assert.ok(h.button('Start a new life'));
    assert.equal(h.component('GameScreen').props.active, false);
    assert.equal(h.find(node => node.type === 'button' && h.text(node) === 'Reconnect').length, 0);
    const calls = h.calls.length;
    h.poll();
    await h.move('home_reset');
    await h.settle();
    assert.equal(h.calls.length, calls, 'unsupported state never enters an offline retry loop');
    await h.click('Start a new life');
    await h.start();
    assert.notEqual(h.game.code, original);
    assert.equal(h.game.schemaVersion, CURRENT_GAME_SCHEMA);
    assert.equal(JSON.parse(h.api.rows.get(original).state).schemaVersion, undefined, 'the unsupported record is never rewritten or upgraded');
});
await test('unsupported room mutation keeps its intent without replaying it into a fresh life', async (t) => {
    const h = setup(t);
    await h.start();
    const original = h.game.code;
    changeStoredGame(h, game => { game.players[0].schemaVersion = 0; });
    await h.move('home_reset');
    const intent = pending(h)[0];
    assert.ok(intent);
    assert.ok(h.button('Start a new life'));
    assert.equal(h.find(node => node.type === 'button' && h.text(node) === 'Check saved action').length, 0);
    await h.click('Start a new life');
    assert.equal(pending(h)[0].deferred, true);
    assert.equal(pending(h)[0].unsupported, true);
    assert.equal(h.find(node => node.type === 'button' && h.text(node) === 'Check ' + original + ' action').length, 0);
    await h.start();
    assert.notEqual(h.game.code, original);
    assert.equal(h.game.players[0].hours, 6);
    assert.deepEqual(pending(h)[0].request, intent.request);
    const reopened = setup(t, { api: h.api, owner: h.record.owner, local: h.locals, query: '?room=' + h.game.code });
    await reopened.settle();
    assert.equal(posts(reopened).length, 0);
    assert.equal(reopened.game.code, h.game.code);
    assert.equal(pending(reopened)[0].unsupported, true);
});
for (const protocolVersion of [undefined, 0, CURRENT_GAME_PROTOCOL + 1]) {
    await test(`unsupported stored protocol ${String(protocolVersion)} is preserved without automatic transmission`, async (t) => {
        const h = setup(t);
        await h.settle();
        h.record.failPost = 'before';
        await h.click('Start our game');
        const saved = pending(h)[0];
        assert.ok(saved);
        saved.request.protocolVersion = protocolVersion;
        rememberPending(h.locals, saved);
        h.dispose();
        const reopened = setup(t, { api: h.api, owner: h.record.owner, local: h.locals });
        await reopened.settle();
        reopened.tick();
        await reopened.settle();
        assert.equal(posts(reopened).length, 0);
        assert.ok(reopened.button('Start a new life'));
        assert.equal(pending(reopened)[0].request.protocolVersion, protocolVersion);
        await reopened.click('Start a new life');
        assert.equal(reopened.find(node => node.type === 'button' && reopened.text(node) === 'Check new room action').length, 0);
        await reopened.start();
        assert.equal(reopened.game.schemaVersion, CURRENT_GAME_SCHEMA);
        assert.equal(lastRequest(reopened).protocolVersion, CURRENT_GAME_PROTOCOL);
        assert.equal(pending(reopened)[0].request.requestId, saved.request.requestId);
        assert.equal(pending(reopened)[0].deferred, true);
        assert.equal(pending(reopened)[0].unsupported, true);
    });
}
await test('new current create intent survives response loss without adding rule flags or changing its ID', async (t) => {
    const h = setup(t);
    await h.settle();
    h.record.failPost = 'after';
    await h.click('Start our game');
    const original = pending(h)[0].request;
    assert.equal(original.protocolVersion, CURRENT_GAME_PROTOCOL);
    assert.equal(original.op, 'create');
    assert.equal(Object.hasOwn(original, 'careerMode'), false);
    assert.equal(Object.hasOwn(original, 'supportedRules'), false);
    const restored = setup(t, { api: h.api, owner: h.record.owner, local: h.locals });
    await restored.settle();
    restored.tick();
    await restored.settle();
    assert.deepEqual(lastRequest(restored), original);
    assert.equal(restored.game.schemaVersion, CURRENT_GAME_SCHEMA);
    assert.equal(h.api.rows.size, 1);
    assert.equal(h.api.receipts.size, 1);
    const direct = await h.api.request(new Request('https://test.invalid' + currentGameQuery({ code: restored.game.code })), h.record.owner);
    assert.equal(direct.status, 200);
});
