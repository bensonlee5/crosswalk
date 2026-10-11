import assert from 'node:assert/strict';
import {after, test} from 'node:test';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {buildSync} from 'esbuild';
import {currentGame} from './current-fixture.mjs';
import {move} from '../lib/game.ts';
import {CURRENT_GAME_PROTOCOL} from '../lib/current-game.ts';
import {createTestGameApi} from './support/current-game-api.mjs';
import {JSDOM} from 'jsdom';

// Real React/ReactDOM scheduling in an in-process DOM emulator. This is not
// browser, rendering/animation, mobile or accessibility acceptance coverage.
const dom = new JSDOM('<!doctype html><html><body></body></html>', {url: 'https://test.invalid/'});
dom.window.scrollTo = () => {};
dom.window.matchMedia = () => ({matches: true, addEventListener() {}, removeEventListener() {}});
const previous = new Map();
for (const [key, value] of Object.entries({window: dom.window, document: dom.window.document, navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, Node: dom.window.Node, MutationObserver: dom.window.MutationObserver, localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage, history: dom.window.history, location: dom.window.location, requestAnimationFrame: callback => {queueMicrotask(callback); return 1;}, IS_REACT_ACT_ENVIRONMENT: true})) {
  previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
  Object.defineProperty(globalThis, key, {configurable: true, writable: true, value});
}
after(() => {
  dom.window.close();
  for (const [key, descriptor] of previous) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
});
const React = await import('react');
const {createRoot} = await import('react-dom/client');
const {act, createElement: h, StrictMode, Suspense, startTransition, useEffect, useLayoutEffect, useRef} = React;
const rootPath = fileURLToPath(new URL('../', import.meta.url));
const compiled = buildSync({
  stdin: {contents: "export {useCommittedRef, useCommittedEvent} from './lib/committed-ref.ts'; export {useEncounterCommit} from './app/story-choices.tsx'; export {useGameTutorial} from './app/game-tutorial.tsx'; export {LifeJournal} from './app/life-story.tsx';", resolveDir: rootPath, sourcefile: 'lifecycle-entry.ts'},
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent',
  define: {'import.meta.env.BASE_URL': '"/"'}, loader: {'.css': 'empty'},
}).outputFiles[0].text;
const module = {exports: {}};
new Function('require', 'module', 'exports', compiled)(createRequire(import.meta.url), module, module.exports);
const {useCommittedRef, useCommittedEvent, useEncounterCommit, useGameTutorial, LifeJournal} = module.exports;
const never = new Promise(() => {});

async function mounted(t, Component, props) {
  const element = document.createElement('div'); document.body.append(element);
  const root = createRoot(element);
  const tree = next => h(StrictMode, null, h(Suspense, {fallback: h('p', null, 'waiting')}, h(Component, next)));
  await act(async () => root.render(tree(props)));
  let unmounted = false;
  const unmount = async () => { if (!unmounted) { unmounted = true; await act(async () => root.unmount()); element.remove(); } };
  t.after(unmount);
  return {element, unmount, async render(next, transition = false) { await act(async () => {
    if (transition) startTransition(() => root.render(tree(next)));
    else root.render(tree(next));
  }); }};
}

async function suspendedRefScenario(t, hook) {
  const attempts = [], clicks = []; let read, subscriptions = 0, setups = 0, cleanups = 0;
  function Probe({value, suspend = false}) {
    const latest = hook(value);
    useLayoutEffect(() => { read = () => latest.current; }, [latest]);
    useEffect(() => { setups++; subscriptions++; return () => { cleanups++; subscriptions--; }; }, []);
    attempts.push(value);
    if (suspend) throw never;
    return h('button', {onClick: () => clicks.push(latest.current)}, value);
  }
  const ui = await mounted(t, Probe, {value: 'committed'});
  assert.ok(setups >= 2, 'Strict Mode must replay mount effects');
  assert.equal(subscriptions, 1); assert.equal(cleanups, setups - 1);
  await ui.render({value: 'speculative', suspend: true}, true);
  assert.ok(attempts.includes('speculative'), 'the suspended render actually ran');
  assert.equal(ui.element.textContent, 'committed', 'the prior UI is still committed');
  await act(async () => ui.element.querySelector('button').click());
  const during = {value: read(), click: clicks.at(-1)};
  await ui.render({value: 'replacement'});
  assert.equal(read(), 'replacement'); assert.equal(subscriptions, 1);
  await ui.unmount(); assert.equal(subscriptions, 0);
  return during;
}

test('committed refs retain the visible state through an actual suspended, abandoned React transition', async t => {
  assert.deepEqual(await suspendedRefScenario(t, useCommittedRef), {value: 'committed', click: 'committed'});
});

test('the concurrent harness detects the original render-time ref publication defect', async t => {
  function unsafeRenderRef(value) { const ref = useRef(value); ref.current = value; return ref; }
  assert.deepEqual(await suspendedRefScenario(t, unsafeRenderRef), {value: 'speculative', click: 'speculative'});
});

test('committed events keep subscription identity while accepting only committed callbacks', async t => {
  const calls = [], attempts = [], identities = []; let listener;
  function Probe({value, suspend = false}) {
    const callback = useCommittedEvent(() => calls.push(value));
    useEffect(() => { listener = callback; identities.push(callback); }, [callback]);
    attempts.push(value);
    if (suspend) throw never;
    return h('span', null, value);
  }
  const ui = await mounted(t, Probe, {value: 'first'}), original = listener;
  await ui.render({value: 'discarded', suspend: true}, true);
  assert.ok(attempts.includes('discarded')); listener(); assert.deepEqual(calls, ['first']);
  await ui.render({value: 'next'}); listener();
  assert.deepEqual(calls, ['first', 'next']); assert.equal(listener, original);
  assert.ok(identities.every(value => value === original));
});

const choice = {id: 'choice', actionId: 'scene:choice', title: 'Reply', body: '', available: true, reason: '', previewText: [], cost: {time: 0, cash: 0, energy: 0}};
function encounterProps(label, onAction, findReceipt) {
  const p = {id: 'seat'}, g = {code: label, round: 1, players: [p]};
  return {g, p, context: label, disabled: false, choices: [choice], onAction, findReceipt};
}

test('the actual encounter hook cannot route a visible old button into a suspended new scene', async t => {
  const calls = [], attempts = []; let controls, resolve;
  function Probe({input, suspend = false}) {
    const state = useEncounterCommit(input);
    useLayoutEffect(() => { controls = state; });
    attempts.push(input.context);
    if (suspend) throw never;
    return h('button', {onClick: () => void state.commit(choice)}, state.busy ? 'pending' : input.context);
  }
  const first = encounterProps('FIRST', () => {calls.push('FIRST'); return new Promise(done => {resolve = done;});}, () => ({id: 'receipt', title: 'Confirmed', body: 'Original scene'}));
  const second = encounterProps('SECOND', async () => {calls.push('SECOND');}, () => null);
  const ui = await mounted(t, Probe, {input: first});
  await ui.render({input: second, suspend: true}, true);
  assert.ok(attempts.includes('SECOND'));
  let pending;
  await act(async () => {pending = controls.commit(choice); void controls.commit(choice);});
  assert.deepEqual(calls, ['FIRST'], 'only the committed scene submits, and repeated input is locked');
  await act(async () => {resolve(first.g); await pending;});
  assert.equal(controls.receipt?.body, 'Original scene');
  await ui.render({input: second});
  assert.equal(controls.receipt, null, 'committing a new scene clears the old private reply');
});

test('Strict Mode encounter teardown rejects late confirmed replies after unmount', async t => {
  let controls, resolve, receiptReads = 0, submissions = 0;
  function Probe({input}) { const state = useEncounterCommit(input); useLayoutEffect(() => {controls = state;}); return h('p', null, 'scene'); }
  const input = encounterProps('FIRST', () => {submissions++; return new Promise(done => {resolve = done;});}, () => {receiptReads++; return {title: 'Too late', body: 'Hidden'};});
  const ui = await mounted(t, Probe, {input}); let pending;
  await act(async () => {pending = controls.commit(choice);});
  await ui.unmount();
  await act(async () => {resolve(input.g); await pending;});
  assert.equal(receiptReads, 0);
  await controls.commit(choice);
  assert.equal(submissions, 1, 'a retained callback cannot submit after its scene unmounts');
});

test('the actual tutorial restores once semantically through Strict Mode and ignores an abandoned room', async t => {
  localStorage.clear(); let state; const attempts = [];
  function Probe({room, replay = 0, suspend = false}) {
    const tutorial = useGameTutorial(room, replay, true);
    useLayoutEffect(() => {state = tutorial;}); attempts.push(room);
    if (suspend) throw never;
    return h('p', null, tutorial.state?.step);
  }
  const ui = await mounted(t, Probe, {room: 'FIRST'});
  assert.equal(state.state.step, 'welcome');
  const before = localStorage.getItem('cw_tutorial_v1');
  await ui.render({room: 'DISCARDED', suspend: true}, true);
  assert.ok(attempts.includes('DISCARDED'));
  assert.equal(state.state.room, 'FIRST');
  assert.equal(localStorage.getItem('cw_tutorial_v1'), before);
  await act(async () => {state.send('next'); state.send('next');});
  assert.equal(state.state.step, 'resources');
  await ui.render({room: 'FIRST', replay: 1});
  assert.equal(state.state.step, 'resources');
});

const homeCode = buildSync({
  entryPoints: [rootPath + 'app/page.tsx'], bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent',
  external: ['@/lib/game-api', '@/components/account-panel', '@/components/ui/*', './game-screen', './life-story', './monthly-news', './sound-controls', './cast-story', './game-rules', './game-painting', './weather-icon'],
  define: {'import.meta.env.BASE_URL': '"/"'}, loader: {'.css': 'empty'},
}).outputFiles[0].text;
function realHome() {
  const api = createTestGameApi(), subscribers = new Set(), calls = [];
  let owner = crypto.randomUUID(), screen = null, afterPost = null;
  const passthrough = ({children}) => h('div', null, children);
  const ui = new Proxy({}, {get: (_, name) => name === 'Dialog' || name === 'AlertDialog' ? ({open, children}) => open ? h('div', null, children) : null : passthrough});
  function Screen(props) { useLayoutEffect(() => {screen = props; return () => {screen = null;};}, [props]); return h('div', {'data-game': props.g.code}, 'confirmed game'); }
  const module = {exports: {}};
  const boundary = {
    getOwnerSession: async () => owner,
    subscribeOwnerSession: listener => {subscribers.add(listener); listener(owner); return () => subscribers.delete(listener);},
    gameFetch: async (url, options = {}) => {
      const actor = owner; calls.push({url, options, actor});
      const response = await api.request(new Request(new URL(url, 'https://test.invalid'), {...options, headers: {...options.headers, Origin: 'https://test.invalid'}}), actor);
      if (options.method === 'POST' && afterPost) await afterPost();
      return response;
    },
  };
  const require = createRequire(import.meta.url);
  new Function('require', 'module', 'exports', homeCode)(id => {
    if (id === '@/lib/game-api') return boundary;
    if (id.startsWith('@/components/ui/')) return ui;
    if (id === './game-screen') return Screen;
    if (id === './sound-controls') return {useGameSound: () => ({unlock: async () => true, play() {}, capture: () => 0, stopEffects() {}}), SoundSettings: () => null};
    if (id === './life-story') return {LifeEnding: () => null};
    if (id === './cast-story') return {CastPromiseNotice: () => null};
    if (['@/components/account-panel', './monthly-news', './game-rules', './game-painting', './weather-icon'].includes(id)) return () => null;
    return require(id);
  }, module, module.exports);
  return {Home: module.exports.default, api, calls, subscribers, get owner() {return owner;}, get screen() {return screen;}, set afterPost(value) {afterPost = value;}, setOwner(value) {owner = value; for (const listener of subscribers) listener(value);}};
}
async function settleDom() { await act(async () => {for (let i = 0; i < 8; i++) await new Promise(resolve => setTimeout(resolve, 0));}); }

test('real Home Strict Mode bootstrap replays one exact pending request and keeps one owner subscription', async t => {
  localStorage.clear(); sessionStorage.clear(); history.replaceState(null, '', '/');
  const app = realHome(), request = {op: 'create', mode: 'hotseat', names: ['Reader'], requestId: 'strict-create', ownerSession: app.owner, protocolVersion: CURRENT_GAME_PROTOCOL};
  localStorage.setItem('cw_pending_save_' + request.requestId, JSON.stringify({createdAt: Date.now(), request}));
  const ui = await mounted(t, app.Home, {}); await settleDom();
  const posts = app.calls.filter(call => call.options.method === 'POST');
  assert.equal(posts.length, 1); assert.deepEqual(JSON.parse(posts[0].options.body), request);
  assert.equal(app.api.receipts.size, 1); assert.equal(app.api.rows.size, 1);
  assert.equal(app.subscribers.size, 1); assert.ok(app.screen);
  assert.equal(localStorage.getItem('cw_pending_save_' + request.requestId), null);
  await ui.unmount(); assert.equal(app.subscribers.size, 0);
  await act(async () => {await new Promise(resolve => setTimeout(resolve, 420));});
});

test('real Home invalidates a delayed previous-owner save without exposing it after the owner switch', async t => {
  localStorage.clear(); sessionStorage.clear(); history.replaceState(null, '', '/');
  const app = realHome(), request = {op: 'create', mode: 'hotseat', names: ['Private'], requestId: 'strict-owner-create', ownerSession: app.owner, protocolVersion: CURRENT_GAME_PROTOCOL};
  localStorage.setItem('cw_pending_save_' + request.requestId, JSON.stringify({createdAt: Date.now(), request}));
  const ui = await mounted(t, app.Home, {}); await settleDom();
  await act(async () => {await new Promise(resolve => setTimeout(resolve, 420));});
  assert.ok(app.screen);
  let release, entered;
  const held = new Promise(resolve => {entered = resolve;}), response = new Promise(resolve => {release = resolve;});
  app.afterPost = () => {entered(); return response;};
  let pending;
  await act(async () => {pending = app.screen.onAction('home_reset'); await held;});
  await act(async () => app.setOwner(crypto.randomUUID()));
  assert.equal(app.screen, null);
  await act(async () => {release(); await pending;}); await settleDom();
  assert.equal(app.screen, null); assert.equal(ui.element.querySelector('[data-game]'), null);
  assert.equal(app.subscribers.size, 1);
  await ui.unmount();
  await act(async () => {await new Promise(resolve => setTimeout(resolve, 420));});
});

test('the actual life journal accepts a visible-life reply during an abandoned transition and clears it before a new life paints', async t => {
  localStorage.clear(); const first = currentGame({names: ['First']}), second = structuredClone(first); second.code = 'SECOND';
  let resolve, calls = 0; const attempts = [];
  function Suspender() {attempts.push('suspended'); throw never;}
  const onAction = () => {calls++; return new Promise(done => {resolve = done;});};
  function Probe({g, suspend = false}) {return h(React.Fragment, null, h(LifeJournal, {g, p: g.players[0], disabled: false, onAction}), suspend ? h(Suspender) : null);}
  const ui = await mounted(t, Probe, {g: first});
  await ui.render({g: second, suspend: true}, true); assert.ok(attempts.length);
  const button = [...ui.element.querySelectorAll('button')].find(node => node.textContent.includes('Call Mina for a check-in')); assert.ok(button);
  await act(async () => {button.click(); button.click();}); assert.equal(calls, 1);
  const confirmed = structuredClone(first); move(confirmed, 'repair:mina');
  await act(async () => resolve(confirmed));
  assert.ok(ui.element.querySelector('[data-person-phase="confirmed"]'));
  await ui.render({g: second});
  assert.equal(ui.element.querySelector('[data-person-phase="confirmed"]'), null);
});

const screenCode = buildSync({
  entryPoints: [rootPath + 'app/game-screen.tsx'], supported: {'dynamic-import': false}, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent',
  external: ['./game-engine', '@/components/ui/dialog'], define: {'import.meta.env.BASE_URL': '"/"'}, loader: {'.css': 'empty'},
}).outputFiles[0].text;
function realScreen() {
  let created = 0, destroyed = 0;
  const passthrough = ({children}) => h('div', null, children);
  const dialogs = {Dialog: ({open, children, onOpenChange}) => open ? h('div', null, children, h('button', {'data-close-test-dialog': '', onClick: () => onOpenChange(false)}, 'Dismiss')) : null, DialogContent: passthrough, DialogDescription: passthrough, DialogTitle: passthrough};
  const engine = {createTown: (_host, _pick, ready) => {created++; ready(); return {sync() {}, weather() {}, quality() {}, celebrate() {}, pan() {}, zoom() {}, focus() {}, overview() {}, district() {}, destroy() {destroyed++;}};}};
  const module = {exports: {}}, require = createRequire(import.meta.url);
  new Function('require', 'module', 'exports', screenCode)(id => id === './game-engine' ? engine : id === '@/components/ui/dialog' ? dialogs : require(id), module, module.exports);
  return {Screen: module.exports.default, get activeRenderers() {return created - destroyed;}};
}

test('the actual screen retains committed action guards through suspension and tears down its Strict Mode renderer', async t => {
  localStorage.clear();
  const app = realScreen(), first = currentGame({names: ['First']}), second = structuredClone(first); second.code = 'SECOND';
  const attempts = [], calls = [], noop = () => {};
  function Suspender() {attempts.push('suspended'); throw never;}
  function Probe({g, suspend = false}) {
    return h(React.Fragment, null, h(app.Screen, {g, active: true, busy: false, offline: false, onVisit: async () => undefined, onAction: async id => {calls.push({code: g.code, id}); const result = structuredClone(g); move(result, id); return result;}, onEnd: noop, onRules: noop, onHome: noop, onCopy: noop, onNews: noop, onSound: noop, onTutorialReplay: noop, tutorialReplay: 0, tutorialOffer: false, tutorialBlocked: false, newsOpen: false, billsOpen: false}), suspend ? h(Suspender) : null);
  }
  const ui = await mounted(t, Probe, {g: first}); await settleDom();
  assert.equal(app.activeRenderers, 1);
  await act(async () => ui.element.querySelector('.game-current-place').click());
  assert.ok(ui.element.querySelector('.game-do-action'));
  await ui.render({g: second, suspend: true}, true); assert.ok(attempts.length);
  await act(async () => {ui.element.querySelector('.game-do-action').click();});
  assert.equal(calls.length, 1); assert.equal(calls[0].code, first.code);
  await ui.render({g: first});
  assert.equal(app.activeRenderers, 1, 'a discarded render never replaced the renderer');
  await ui.unmount(); assert.equal(app.activeRenderers, 0);
});

test('the actual life journal releases old-context pending state without letting an old reply unlock a newer request', async t => {
  const first = currentGame({names: ['First']}), second = structuredClone(first); second.code = 'SECOND';
  const replies = [], calls = [];
  const onAction = id => {calls.push(id); return new Promise(resolve => replies.push(resolve));};
  function Probe({g}) {return h(LifeJournal, {g, p: g.players[0], disabled: false, onAction});}
  const ui = await mounted(t, Probe, {g: first});
  const button = () => [...ui.element.querySelectorAll('button')].find(node => node.textContent.includes('Call Mina for a check-in'));
  await act(async () => button().click()); assert.equal(calls.length, 1);
  await ui.render({g: second}); assert.equal(button().disabled, false, 'a new life cannot inherit a permanently pending old request');
  await act(async () => button().click()); assert.equal(calls.length, 2);
  const oldResult = structuredClone(first); move(oldResult, 'repair:mina');
  await act(async () => replies[0](oldResult));
  assert.equal(button().disabled, true, 'the old completion cannot release the newer request');
  assert.equal(ui.element.querySelector('[data-person-phase="confirmed"]'), null);
  const result = structuredClone(second); move(result, 'repair:mina');
  await act(async () => replies[1](result));
  assert.equal(button().disabled, false); assert.ok(ui.element.querySelector('[data-person-phase="confirmed"]'));
});

test('the actual encounter hook releases a replaced scene without accepting its stale callback or late request', async t => {
  let controls; const calls = [], replies = [];
  function Probe({input}) {
    const state = useEncounterCommit(input); useLayoutEffect(() => {controls = state;});
    return h('p', null, state.busy ? 'pending' : input.context);
  }
  const input = label => encounterProps(label, () => {calls.push(label); return new Promise(resolve => replies.push(resolve));}, () => ({title: 'Confirmed', body: label}));
  const first = input('FIRST'), second = input('SECOND');
  const ui = await mounted(t, Probe, {input: first}), oldCommit = controls.commit;
  let oldPending, newPending;
  await act(async () => {oldPending = controls.commit(choice);});
  await ui.render({input: second}); assert.equal(controls.busy, false);
  await act(async () => {newPending = controls.commit(choice);});
  assert.deepEqual(calls, ['FIRST', 'SECOND'], 'the old request must not block the new committed scene');
  await act(async () => {replies[0](first.g); await oldPending;});
  assert.equal(controls.busy, true, 'the old reply must not unlock the new request'); assert.equal(controls.receipt, null);
  await act(async () => {replies[1](second.g); await newPending;});
  assert.equal(controls.receipt?.body, 'SECOND');
  const third = input('THIRD'); await ui.render({input: third});
  await act(async () => {await oldCommit(choice);});
  assert.deepEqual(calls, ['FIRST', 'SECOND'], 'a saved old callback must never submit into a different scene');
});
