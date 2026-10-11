import {committedHooks} from './committed-hooks.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createTestGameApi } from './current-game-api.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(root + 'package.json');
const ts = require('typescript');
const pageJs = ts.transpileModule(fs.readFileSync(root + 'app/page.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ESNext, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
export function storage(start = {}) {
    const values = new Map(Object.entries(start));
    return { get length() { return values.size; }, key: i => [...values.keys()][i] ?? null,
        getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
}
/** Render real Home with a minimal hook scheduler. Child views are named seams:
 * tests enter rooms, open dialogs and move through public props, never state indices.
 * The API/auth boundary supplies a UUID and runs the current Supabase HTTP handler,
 * receipt/CAS store and engine. Only network faults and browser facilities are doubles. */
export function homeHarness({ api = createTestGameApi(), owner = crypto.randomUUID(), saved = '', query = '', local = null, storageBlocked = false } = {}) {
    const slots = [], deps = [], cleanups = [];
    let cursor = 0, effects = [], tree, dirty = false, now = 1000, timerId = 0, disposed = false, heldReady;
    const timeouts = new Map(), intervals = new Map(), gates = new Map(), activeGates = new Set(), inFlight = new Set();
    const calls = [], sounds = [];
    const record = { owner, failPost: null, failGet: false, unauthorized: false, malformedPost: false, malformedGet: false, protocolFault: false, identityListener: null, held: null, reloads: 0 };
    const react = {
        useCallback(fn, next) { const index = cursor++; if (!deps[index] || next.some((value, i) => !Object.is(value, deps[index][i]))) {deps[index] = next; slots[index] = fn;} return slots[index]; },
        useState(initial) { const index = cursor++; if (!(index in slots))
            slots[index] = typeof initial === 'function' ? initial() : initial; return [slots[index], value => { const next = typeof value === 'function' ? value(slots[index]) : value; if (!Object.is(next, slots[index])) {
                slots[index] = next;
                dirty = true;
            } }]; },
        useRef(initial) { const index = cursor++; return slots[index] ?? (slots[index] = { current: initial }); },
        useEffect(fn, next) { const index = cursor++; if (!deps[index] || next.some((value, i) => !Object.is(value, deps[index][i]))) {
            deps[index] = next;
            effects.push(() => { cleanups[index]?.(); cleanups[index] = fn(); });
        } },
    };
    const locals = storageBlocked ? new Proxy({}, { get() { throw Error('Storage blocked'); } }) : local || storage(saved ? { cw_room: saved } : {});
    const sessions = storage();
    const window = { location: { reload() { record.reloads++; } }, scrollTo() { }, addEventListener() { }, removeEventListener() { } };
    const document = { visibilityState: 'visible', addEventListener() { }, removeEventListener() { } };
    async function getOwnerSession() { if (!record.owner)
        record.owner = crypto.randomUUID(); return record.owner; }
    function fetcher(url, opts = {}) {
        const method = opts.method || 'GET';
        const candidate = gates.get(method), gate = candidate?.matches(url) ? candidate : null;
        if (gate)
            gates.delete(method);
        // Capture identity before the request: a later sign-out cannot change its response.
        const actor = record.unauthorized ? null : record.owner;
        const task = (async () => {
            calls.push({ url, opts, actor });
            if (method === 'POST' && record.failPost === 'before' || method === 'GET' && record.failGet)
                throw new TypeError('Connection interrupted');
            const requestUrl = new URL(url, 'https://test.invalid');
            let body = opts.body;
            if (record.protocolFault && !requestUrl.searchParams.has('history')) {
                if (method === 'POST')
                    body = JSON.stringify({ ...JSON.parse(body), protocolVersion: 0 });
                else
                    requestUrl.searchParams.set('protocolVersion', '0');
            }
            let response = await api.request(new Request(requestUrl, { ...opts, body, headers: { ...opts.headers, Origin: 'https://test.invalid' } }), actor);
            if (method === 'POST' && record.failPost === 'after')
                throw new TypeError('Saved response was lost');
            if (method === 'GET' && record.malformedGet && !requestUrl.searchParams.has('history'))
                response = Response.json({});
            if (method === 'POST' && record.malformedPost) {
                const snapshot = await response.json();
                delete snapshot.players;
                response = Response.json(snapshot);
            }
            if (gate) {
                record.held = { response, url, actor };
                gate.entered();
                await gate.promise;
            }
            return response;
        })();
        if (!gate) {
            inFlight.add(task);
            task.then(() => inFlight.delete(task), () => inFlight.delete(task));
        }
        return task;
    }
    const childNames = { './game-screen': 'GameScreen', './game-rules': 'GameRules', './monthly-news': 'MonthlyNews', './game-painting': 'GamePainting', './weather-icon': 'WeatherIcon' };
    const module = { exports: {} };
    vm.runInNewContext(pageJs, {
        exports: module.exports, module,
        require: id => {
            if (id === 'react')
                return react;
            if (id === '@/lib/committed-ref') return committedHooks(react);
            if (id === 'react/jsx-runtime')
                return require(id);
            if (id === '@/lib/game-api')
                return { gameFetch: fetcher, getOwnerSession, subscribeOwnerSession: listener => { record.identityListener = listener; listener(record.owner); return () => { record.identityListener = null; }; } };
            if (id === '@/lib/asset-url')
                return { assetUrl: path => path };
            if (id === '@/components/account-panel')
                return { default: 'AccountPanel' };
            if (id === './life-story')
                return { LifeEnding: 'LifeEnding' };
            if (id === './cast-story')
                return { CastPromiseNotice: 'CastPromiseNotice' };
            if (id === './sound-controls')
                return { useGameSound: () => ({ unlock: async () => true, play: cue => sounds.push(cue), capture: () => 0, stopEffects() { } }), SoundSettings: 'SoundSettings' };
            if (childNames[id])
                return { default: childNames[id] };
            if (id.startsWith('@/lib/'))
                return require(root + id.slice(2) + '.ts');
            if (id.endsWith('.css'))
                return {};
            if (id.startsWith('@/components/ui/') || id === 'lucide-react')
                return new Proxy({}, { get: (_, name) => String(name) });
            throw Error('Unconfigured Home import: ' + id);
        },
        fetch: fetcher, localStorage: locals, sessionStorage: sessions, window, document,
        location: { search: query, pathname: '/', origin: 'https://test.invalid' }, history: { replaceState() { } },
        requestAnimationFrame: fn => fn(),
        setTimeout: (fn, delay = 0) => { const id = ++timerId; timeouts.set(id, { fn, at: now + delay }); return id; }, clearTimeout: id => timeouts.delete(id),
        setInterval: fn => { const id = ++timerId; intervals.set(id, fn); return id; }, clearInterval: id => intervals.delete(id),
        Date: { now: () => now }, URLSearchParams, Intl, crypto, AbortController, TypeError, console,
    });
    function render() {
        assert.equal(disposed, false, 'cannot render a disposed Home');
        for (let n = 0; n < 25; n++) {
            dirty = false;
            cursor = 0;
            effects = [];
            tree = module.exports.default();
            effects.splice(0).forEach(fn => fn());
            if (!dirty)
                return tree;
        }
        throw Error('Home did not settle its render effects');
    }
    async function settle() {
        for (let n = 0; n < 12; n++) {
            await Promise.allSettled([...inFlight]);
            await new Promise(resolve => setImmediate(resolve));
            if (dirty && !disposed)
                render();
        }
        return tree;
    }
    function tick(ms = 500) { now += ms; for (const [id, timer] of timeouts)
        if (timer.at <= now) {
            timeouts.delete(id);
            timer.fn();
        } if (dirty && !disposed)
        render(); }
    function walk(node, predicate, result = []) {
        if (!node || typeof node !== 'object')
            return result;
        if (Array.isArray(node)) {
            node.forEach(child => walk(child, predicate, result));
            return result;
        }
        if (predicate(node))
            result.push(node);
        if (['Dialog', 'AlertDialog', 'GameRules', 'MonthlyNews'].includes(node.type) && node.props.open === false)
            return result;
        walk(node.props?.children, predicate, result);
        return result;
    }
    const find = predicate => walk(tree, predicate);
    const text = node => node == null ? '' : Array.isArray(node) ? node.map(text).join('') : typeof node === 'string' || typeof node === 'number' ? String(node) : text(node.props?.children);
    const button = label => { const found = find(node => node.type === 'button' && text(node) === label)[0]; assert.ok(found, 'button ' + label); return found; };
    const component = name => find(node => node.type === name)[0];
    async function invoke(callback, ...args) { await callback(...args); await settle(); tick(); await settle(); }
    const click = label => { const found = button(label); assert.ok(!found.props.disabled, 'enabled ' + label); return invoke(found.props.onClick, { type: 'click', preventDefault() { }, stopPropagation() { } }); };
    async function dismissTurn() { if (component('MonthlyNews')?.props.open) {
        component('MonthlyNews').props.onClose();
        render();
    } if (find(node => node.type === 'button' && text(node) === 'I’m ready').length)
        await click('I’m ready'); }
    async function start(count = 2) { await settle(); find(node => node.props?.['aria-label'] === 'Number of players')[0].props.onValueChange(String(count)); render(); await click(count === 1 ? 'Start a solo life' : 'Start our game'); await dismissTurn(); return component('GameScreen')?.props.g; }
    function hold(method = 'POST', matches = url => method === 'POST' || new URL(url, 'https://test.invalid').searchParams.has('code')) {
        let release, entered;
        const promise = new Promise(resolve => { release = resolve; });
        heldReady = new Promise(resolve => { entered = resolve; });
        const gate = { promise, matches, entered, release: () => { activeGates.delete(gate); release(); } };
        gates.set(method, gate);
        activeGates.add(gate);
        record.held = null;
        return () => { if (gates.get(method) === gate)
            gates.delete(method); gate.release(); };
    }
    async function waitUntilHeld() {
        let timer;
        try {
            await Promise.race([heldReady, new Promise((_, reject) => { timer = setTimeout(() => reject(Error('No delayed response within five seconds')), 5000); })]);
        }
        finally {
            clearTimeout(timer);
        }
        assert.ok(record.held, 'response is deliberately delayed');
    }
    function setOwner(value) { record.owner = value; record.identityListener?.(value); render(); }
    function dispose() { if (disposed)
        return; disposed = true; cleanups.forEach(cleanup => cleanup?.()); for (const gate of activeGates)
        gate.release(); timeouts.clear(); intervals.clear(); }
    render();
    return { api, render, settle, tick, find, text, button, component, invoke, click, start, dismissTurn, calls, sounds, record, locals, sessions, hold, waitUntilHeld, setOwner, dispose,
        get game() { return component('GameScreen')?.props.g || component('LifeEnding')?.props.g; },
        move: action => invoke(component('GameScreen').props.onAction, action), visit: place => invoke(component('GameScreen').props.onVisit, place),
        home: () => invoke(find(node => node.props?.['aria-label'] === 'Crosswalk home')[0].props.onClick),
        poll() { for (const callback of intervals.values())
            callback(); },
    };
}
