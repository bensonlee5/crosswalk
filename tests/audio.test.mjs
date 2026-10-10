import test from 'node:test';
import assert from 'node:assert/strict';
import { CrosswalkAudio, getAudio } from '../lib/audio.ts';

class FakeParam {
  value = 0;
  events = [];
  setValueAtTime(value, time) { this.events.push(['set', value, time]); this.value = value; return this; }
  linearRampToValueAtTime(value, time) { this.events.push(['linear', value, time]); return this; }
  exponentialRampToValueAtTime(value, time) {
    assert.ok(value > 0, 'exponential envelopes never target zero');
    this.events.push(['exponential', value, time]); return this;
  }
  setTargetAtTime(value, time, constant) { this.events.push(['target', value, time, constant]); this.value = value; return this; }
  cancelScheduledValues(time) { this.events.push(['cancel', time]); return this; }
}
class FakeNode {
  constructor(context, kind) { this.context = context; this.kind = kind; this.connections = []; this.disconnected = false; }
  connect(node) { this.connections.push(node); return node; }
  disconnect() { this.disconnected = true; this.connections.length = 0; }
}
class FakeSource extends FakeNode {
  frequency = new FakeParam();
  start(at) { assert.ok(at >= 0); this.startedAt = at; this.context.sources.push(this); }
  stop(at = this.context.currentTime) { this.stoppedAt = at; }
}
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };

async function withBrowser(options, body) {
  const old = Object.fromEntries(['window', 'document', 'setInterval', 'clearInterval'].map((key) => [key, globalThis[key]]));
  const contexts = [];
  const timers = new Map();
  const documentListeners = new Set();
  let timerId = 0;
  const doc = {
    hidden: false,
    addEventListener(type, callback) { assert.equal(type, 'visibilitychange'); documentListeners.add(callback); },
    removeEventListener(type, callback) { documentListeners.delete(callback); },
    changeVisibility(hidden) { this.hidden = hidden; for (const callback of documentListeners) callback(); },
  };
  class FakeContext {
    currentTime = 0;
    sampleRate = 8000;
    state = 'suspended';
    sources = [];
    gains = [];
    destination = new FakeNode(this, 'destination');
    listeners = new Set();
    resumeCalls = 0;
    suspendCalls = 0;
    closeCalls = 0;
    rejectResume = options.failResume ?? false;
    operations = Promise.resolve();
    constructor() {
      contexts.push(this);
      if (options.noStereoPanner) this.createStereoPanner = undefined;
    }
    createGain() { const node = new FakeNode(this, 'gain'); node.gain = new FakeParam(); this.gains.push(node); return node; }
    createDynamicsCompressor() {
      const node = new FakeNode(this, 'compressor');
      for (const name of ['threshold', 'knee', 'ratio', 'attack', 'release']) node[name] = new FakeParam();
      return node;
    }
    createOscillator() { return new FakeSource(this, 'oscillator'); }
    createBufferSource() { return new FakeSource(this, 'noise'); }
    createBiquadFilter() { const node = new FakeNode(this, 'filter'); node.frequency = new FakeParam(); node.Q = new FakeParam(); return node; }
    createStereoPanner() { const node = new FakeNode(this, 'pan'); node.pan = new FakeParam(); return node; }
    createBuffer(channels, length) { const data = new Float32Array(length); return { getChannelData: () => data }; }
    addEventListener(type, callback) { this.listeners.add(callback); }
    removeEventListener(type, callback) { this.listeners.delete(callback); }
    transition(state) { this.state = state; for (const callback of this.listeners) callback(); }
    enqueue(callback) { this.operations = this.operations.catch(() => {}).then(callback); return this.operations; }
    resume() {
      this.resumeCalls++;
      return this.enqueue(() => { if (this.rejectResume) throw Error('Gesture required'); this.transition('running'); });
    }
    suspend() { this.suspendCalls++; return this.enqueue(() => this.transition('suspended')); }
    close() { this.closeCalls++; return this.enqueue(() => this.transition('closed')); }
    advance(seconds, tick = true) {
      this.currentTime += seconds;
      for (const source of this.sources) if (source.stoppedAt <= this.currentTime && source.onended) source.onended();
      if (tick) for (const callback of [...timers.values()]) callback();
    }
  }
  globalThis.window = options.unsupported ? {} : options.webkit ? { webkitAudioContext: FakeContext } : { AudioContext: FakeContext };
  globalThis.document = doc;
  globalThis.setInterval = (callback) => { timers.set(++timerId, callback); return timerId; };
  globalThis.clearInterval = (id) => timers.delete(id);
  const engines = [];
  const make = () => { const engine = new CrosswalkAudio(); engines.push(engine); return engine; };
  try { await body({ make, contexts, timers, doc, documentListeners }); }
  finally {
    engines.forEach((engine) => engine.dispose());
    await flush();
    for (const [key, value] of Object.entries(old)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
}

test('SSR-safe singleton, all pre-unlock setters, and disposal', async () => {
  const audio = getAudio();
  assert.equal(getAudio(), audio);
  audio.setMusicEnabled(false);
  audio.setEffectsEnabled(false);
  audio.setMusicVolume(0.3);
  audio.setEffectsVolume(0.4);
  audio.setActive(true);
  audio.play('start');
  assert.equal(await audio.unlock(), false);
  audio.dispose();
  audio.dispose();
  assert.notEqual(getAudio(), audio);
  getAudio().dispose();
});

test('context and sound are created only by unlock; dispose releases everything', async () => {
  await withBrowser({}, async ({ make, contexts, timers, documentListeners }) => {
    const audio = make();
    audio.setActive(true);
    audio.play('start');
    audio.setMusicVolume(0.3);
    assert.equal(contexts.length, 0);
    const unlocking = audio.unlock();
    assert.equal(contexts.length, 1);
    assert.equal(contexts[0].resumeCalls, 1, 'resume invoked synchronously inside gesture');
    assert.equal(await unlocking, true);
    assert.equal(timers.size, 1);
    assert.ok(contexts[0].sources.length > 0);
    audio.dispose();
    await flush();
    assert.equal(timers.size, 0);
    assert.equal(documentListeners.size, 0);
    assert.equal(contexts[0].listeners.size, 0);
    assert.equal(contexts[0].state, 'closed');
    assert.ok(contexts[0].sources.every((source) => source.disconnected));
    assert.equal(await audio.unlock(), false);
  });
});

test('unsupported browser fails quietly', async () => {
  await withBrowser({ unsupported: true }, async ({ make, contexts, timers }) => {
    assert.equal(await make().unlock(), false);
    assert.equal(contexts.length, 0);
    assert.equal(timers.size, 0);
  });
});

test('Safari constructor fallback and no stereo panner are supported', async () => {
  await withBrowser({ webkit: true, noStereoPanner: true }, async ({ make, contexts }) => {
    const audio = make();
    assert.equal(await audio.unlock(), true);
    audio.play('learn');
    assert.ok(contexts[0].sources.length >= 4);
  });
});

test('rejected resume is handled and a later gesture can retry', async () => {
  await withBrowser({ failResume: true }, async ({ make, contexts, timers }) => {
    const audio = make();
    assert.equal(await audio.unlock(), false);
    audio.play('start');
    assert.equal(contexts[0].sources.length, 0);
    assert.equal(timers.size, 0);
    contexts[0].rejectResume = false;
    assert.equal(await audio.unlock(), true);
    assert.equal(timers.size, 1);
  });
});

test('every action cue, including the action clock, produces bounded scheduled voices', async () => {
  await withBrowser({}, async ({ make, contexts, timers }) => {
    const audio = make();
    audio.setMusicEnabled(false);
    audio.play('work');
    await audio.unlock();
    const ctx = contexts[0];
    assert.equal(ctx.sources.length, 0, 'locked effects are discarded instead of queued');
    assert.equal(timers.size, 0);
    const effects = ['travel', 'work', 'buy', 'learn', 'social', 'rest', 'craft', 'success', 'endWeek', 'start', 'finish', 'error', 'tick', 'timeUp'];
    const signatures = new Set();
    for (const effect of effects) {
      ctx.advance(3);
      const before = ctx.sources.length;
      audio.play(effect);
      const added = ctx.sources.slice(before);
      assert.ok(added.length >= 2 && added.length <= 8, effect);
      assert.ok(added.every((source) => source.startedAt >= ctx.currentTime && source.stoppedAt > source.startedAt), effect);
      signatures.add(added.map((source) => `${source.kind}:${source.frequency.value}:${(source.stoppedAt - source.startedAt).toFixed(3)}`).join('|'));
    }
    assert.equal(signatures.size, effects.length, 'all action sound signatures are distinct');
  });
});

test('muting and zero/invalid volume prevent new sound, and levels clamp safely', async () => {
  await withBrowser({}, async ({ make, contexts, timers }) => {
    const audio = make();
    audio.setMusicEnabled(false);
    await audio.unlock();
    const ctx = contexts[0];
    audio.setEffectsEnabled(false);
    audio.play('finish');
    assert.equal(ctx.sources.length, 0);
    audio.setEffectsEnabled(true);
    audio.setEffectsVolume(0);
    audio.play('finish');
    assert.equal(ctx.sources.length, 0);
    audio.setEffectsVolume(2);
    assert.equal(ctx.gains[1].gain.value, 1);
    audio.setEffectsVolume(Number.NaN);
    assert.equal(ctx.gains[1].gain.value, 0);
    audio.setMusicVolume(-1);
    audio.setMusicEnabled(true);
    assert.equal(timers.size, 0);
    audio.setMusicVolume(0.2);
    assert.equal(timers.size, 1);
    audio.setMusicEnabled(false);
    assert.equal(timers.size, 0);
    assert.ok(ctx.sources.every((source) => source.stoppedAt <= ctx.currentTime + 0.04));
  });
});

test('hidden page stops voices and scheduler, resumes fresh with no catch-up burst', async () => {
  await withBrowser({}, async ({ make, contexts, timers, doc }) => {
    const audio = make();
    await audio.unlock();
    const ctx = contexts[0];
    audio.play('finish');
    doc.changeVisibility(true);
    await flush();
    assert.equal(ctx.state, 'suspended');
    assert.equal(timers.size, 0);
    assert.ok(ctx.sources.every((source) => source.disconnected));
    const before = ctx.sources.length;
    audio.play('success');
    assert.equal(ctx.sources.length, before);
    ctx.advance(120);
    doc.changeVisibility(false);
    await flush();
    assert.equal(ctx.state, 'running');
    assert.equal(timers.size, 1);
    const fresh = ctx.sources.slice(before);
    assert.ok(fresh.length > 0 && fresh.length < 12);
    assert.ok(fresh.every((source) => source.startedAt >= 120));
  });
});

test('inactive before unlock stays silent; fast hide/show during initial resume is safe', async () => {
  await withBrowser({}, async ({ make, contexts, timers }) => {
    const audio = make();
    audio.setActive(false);
    assert.equal(await audio.unlock(), false);
    assert.equal(contexts.length, 0);
    audio.setActive(true);
    assert.equal(contexts.length, 0);
    const first = audio.unlock();
    audio.setActive(false);
    audio.setActive(true);
    await first;
    await flush();
    assert.equal(contexts[0].state, 'running');
    assert.equal(timers.size, 1);
    audio.setActive(false);
    await flush();
    assert.equal(contexts[0].state, 'suspended');
    assert.equal(timers.size, 0);
  });
});

test('rapid duplicate taps are suppressed; rapid different cues respect total voice cap', async () => {
  await withBrowser({}, async ({ make, contexts }) => {
    const audio = make();
    audio.setMusicEnabled(false);
    await audio.unlock();
    const ctx = contexts[0];
    audio.play('work');
    const one = ctx.sources.length;
    audio.play('work');
    assert.equal(ctx.sources.length, one);
    for (let i = 0; i < 100; i++) audio.play(i % 2 ? 'success' : 'finish');
    assert.equal(ctx.sources.length, 56);
    ctx.advance(3);
    const before = ctx.sources.length;
    audio.play('work');
    assert.ok(ctx.sources.length > before, 'finished voices release capacity');
  });
});

test('delayed scheduler skips missed music instead of replaying a backlog', async () => {
  await withBrowser({}, async ({ make, contexts, timers }) => {
    const audio = make();
    await audio.unlock();
    const ctx = contexts[0];
    const before = ctx.sources.length;
    ctx.advance(90);
    const fresh = ctx.sources.slice(before);
    assert.equal(timers.size, 1);
    assert.ok(fresh.length > 0 && fresh.length < 12);
    assert.ok(fresh.every((source) => source.startedAt >= ctx.currentTime));
  });
});

test('music varies across sixteen bars and does not accumulate live sources', async () => {
  await withBrowser({}, async ({ make, contexts }) => {
    const audio = make();
    await audio.unlock();
    const ctx = contexts[0];
    for (let i = 0; i < 1600; i++) {
      ctx.advance(0.035);
      assert.ok(ctx.sources.filter((source) => !source.disconnected).length <= 34);
    }
    const pitches = new Set(ctx.sources.filter((source) => source.kind === 'oscillator').map((source) => source.frequency.value));
    assert.ok(pitches.size >= 20, 'score includes varied bass, harmony and melody');
    assert.ok(ctx.sources.length > 250);
  });
});
