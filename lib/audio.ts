/**
 * Crosswalk's original procedural score plus short, licensed action recordings.
 * Call unlock() in a real pointer/keyboard gesture; all other methods are safe
 * before that gesture, during SSR, and in browsers without Web Audio.
 */
import {assetUrl} from './asset-url.ts';
import {FOLEY_FILES, isFoleyCue, type FoleyCue} from './foley.ts';

export type AudioEffect = FoleyCue
  | 'travel' | 'work' | 'buy' | 'learn' | 'social' | 'rest' | 'craft'
  | 'success' | 'endWeek' | 'start' | 'finish' | 'error' | 'tick' | 'timeUp';

type Bus = 'music' | 'effects';
type Timbre = 'keys' | 'bass' | 'bell' | 'pluck';
type Voice = {
  source: AudioScheduledSourceNode;
  envelope: GainNode;
  nodes: AudioNode[];
  bus: Bus;
  end: number;
  foley?: boolean;
};
type SafariWindow = Window & { webkitAudioContext?: typeof AudioContext };
const EPSILON = 0.0001;
const MAX_VOICES = 56;
const MAX_MUSIC_VOICES = 34;
const MAX_FOLEY_VOICES = 2;
const MAX_FOLEY_SECONDS = 6;
const MAX_FOLEY_BYTES = 600_000;
const FOLEY_MUSIC_DUCK = 0.3;
const BPM = 84;
const EIGHTH = 60 / BPM / 2;
const SWING = 0.07;
const midi = (note: number) => 440 * 2 ** ((note - 69) / 12);
const clamp = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;

// Sixteen bars of original, gently voiced jazz harmony. No quotation or sample.
const HARMONY = [
  { bass: 36, chord: [59, 62, 64, 67], melody: [76, 0, 0, 74, 0, 71, 0, 0] },
  { bass: 33, chord: [55, 61, 64, 69], melody: [0, 0, 73, 0, 0, 71, 0, 0] },
  { bass: 38, chord: [60, 64, 65, 69], melody: [69, 0, 0, 72, 0, 0, 76, 0] },
  { bass: 31, chord: [59, 64, 65, 69], melody: [0, 0, 74, 0, 0, 69, 0, 0] },
  { bass: 40, chord: [59, 62, 67, 72], melody: [71, 0, 0, 0, 74, 0, 0, 0] },
  { bass: 40, chord: [59, 62, 64, 67], melody: [0, 0, 79, 0, 0, 76, 0, 0] },
  { bass: 33, chord: [59, 60, 64, 67], melody: [76, 0, 0, 72, 0, 71, 0, 0] },
  { bass: 38, chord: [60, 64, 66, 69], melody: [0, 0, 69, 0, 0, 0, 0, 0] },
  { bass: 38, chord: [60, 64, 65, 69], melody: [77, 0, 0, 76, 0, 72, 0, 0] },
  { bass: 31, chord: [59, 64, 65, 69], melody: [0, 0, 74, 0, 0, 71, 0, 0] },
  { bass: 36, chord: [57, 62, 64, 67], melody: [76, 0, 0, 79, 0, 0, 76, 0] },
  { bass: 33, chord: [55, 61, 64, 69], melody: [0, 0, 73, 0, 0, 0, 71, 0] },
  { bass: 38, chord: [60, 64, 65, 69], melody: [69, 0, 0, 72, 0, 0, 74, 0] },
  { bass: 31, chord: [59, 64, 65, 69], melody: [0, 0, 71, 0, 0, 69, 0, 0] },
  { bass: 36, chord: [57, 62, 64, 67], melody: [67, 0, 0, 0, 72, 0, 0, 0] },
  { bass: 31, chord: [57, 60, 62, 65], melody: [0, 0, 69, 0, 0, 71, 0, 74] },
] as const;

export class CrosswalkAudio {
  private context: AudioContext | null = null;
  private musicBus: GainNode | null = null;
  private effectsBus: GainNode | null = null;
  private output: DynamicsCompressorNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private voices = new Set<Voice>();
  private scheduler: ReturnType<typeof setInterval> | null = null;
  private gestureRequested = false;
  private active = true;
  private unlocked = false;
  private disposed = false;
  private musicEnabled = true;
  private effectsEnabled = true;
  private musicVolume = 0.24;
  private effectsVolume = 0.55;
  private nextStep = 0;
  private nextTime = 0;
  private lastEffect = -Infinity;
  private lastEffectName: AudioEffect | null = null;
  private foleyBuffers = new Map<FoleyCue, AudioBuffer>();
  private foleyLoads = new Map<FoleyCue, Promise<void>>();
  private foleyRequests = new Set<AbortController>();
  private foleyRetryAfter = new Map<FoleyCue, number>();
  private effectsGeneration = 0;

  /** Capture before an async action; mute, hide, interruption or leaving invalidates it. */
  get effectToken(): number { return this.effectsGeneration; }
  foleyStatus(cue: FoleyCue): 'ready' | 'loading' | 'unavailable' {
    return this.foleyBuffers.has(cue) ? 'ready' : this.foleyLoads.has(cue) ? 'loading' : 'unavailable';
  }
  stopEffects(): void {
    this.effectsGeneration++;
    this.stopVoices('effects');
  }


  get isDisposed(): boolean { return this.disposed; }

  /** Invoke directly inside a click / touch / keyboard handler. Never throws. */
  unlock(): Promise<boolean> {
    if (this.disposed || !this.isActive()) return Promise.resolve(false);
    if (!this.context && !this.createContext()) return Promise.resolve(false);
    this.gestureRequested = true;
    // Loading is preparation only. Completion never plays a queued action.
    void this.preloadFoley();
    return this.resume(true);
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    this.updateGain('music');
    if (!enabled) {
      this.stopScheduler();
      this.stopVoices('music', true);
    } else {
      this.startScheduler();
    }
  }

  setEffectsEnabled(enabled: boolean): void {
    this.effectsEnabled = enabled;
    this.updateGain('effects');
    if (!enabled) this.stopEffects();
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = clamp(volume);
    this.updateGain('music');
    if (this.musicVolume === 0) {
      this.stopScheduler();
      this.stopVoices('music', true);
    } else this.startScheduler();
  }

  setEffectsVolume(volume: number): void {
    this.effectsVolume = clamp(volume);
    this.updateGain('effects');
    if (this.effectsVolume === 0) this.stopEffects();
  }

  /** Route unmounts or modal pauses here. Visibility is also handled internally. */
  setActive(active: boolean): void {
    this.active = active;
    this.reconcileActivity();
  }

  /** Never queues an effect while locked, muted, hidden, or interrupted. */
  play(effect: AudioEffect, token = this.effectsGeneration): boolean {
    const ctx = this.context;
    if (!ctx || !this.unlocked || !this.isActive() || ctx.state !== 'running'
      || !this.effectsEnabled || this.effectsVolume <= 0 || token !== this.effectsGeneration) return false;
    if (isFoleyCue(effect)) return this.playFoley(effect);
    const now = ctx.currentTime;
    // Suppress accidental duplicate taps, but retain genuinely different cues.
    if (effect === this.lastEffectName && now - this.lastEffect < 0.085) return false;
    this.lastEffect = now;
    this.lastEffectName = effect;
    const notes = (pitches: number[], gap = 0.09, duration = 0.22, timbre: Timbre = 'bell', level = 0.12) => {
      pitches.forEach((pitch, index) => this.tone('effects', pitch, now + 0.008 + index * gap,
        duration, level, timbre, (index - (pitches.length - 1) / 2) * 0.12));
    };
    switch (effect) {
      case 'travel': // Two rounded footfalls and a little movement upward.
        this.percussion('effects', now, 'step', 0.075, -0.2);
        this.percussion('effects', now + 0.14, 'step', 0.06, 0.2);
        notes([62, 67], 0.12, 0.14, 'pluck', 0.06);
        break;
      case 'work': notes([55, 62, 67], 0.095, 0.2, 'pluck'); break;
      case 'buy': notes([79, 74, 71], 0.065, 0.18, 'bell', 0.1); break;
      case 'learn': notes([64, 67, 71, 76], 0.105, 0.28, 'bell', 0.105); break;
      case 'social':
        notes([67, 71], 0.09, 0.2, 'keys');
        this.tone('effects', 74, now + 0.25, 0.32, 0.09, 'keys', 0.2);
        break;
      case 'rest':
        [60, 64, 67].forEach((note, index) => this.tone('effects', note, now + index * 0.07,
          0.75, 0.065, 'keys', (index - 1) * 0.2));
        break;
      case 'craft':
        notes([72, 67, 76], 0.085, 0.14, 'pluck', 0.13);
        this.percussion('effects', now + 0.07, 'step', 0.035, 0);
        break;
      case 'success': notes([60, 64, 67, 72, 76], 0.075, 0.4, 'bell', 0.115); break;
      case 'endWeek': notes([67, 64, 60, 72], 0.14, 0.5, 'keys', 0.115); break;
      case 'start': notes([60, 67, 72, 76], 0.12, 0.4, 'keys', 0.12); break;
      case 'finish':
        notes([60, 64, 67, 72, 79], 0.14, 0.58, 'bell', 0.11);
        [60, 64, 67].forEach((note) => this.tone('effects', note, now + 0.72, 0.85, 0.06, 'keys'));
        break;
      case 'error': notes([55, 53], 0.11, 0.15, 'keys', 0.1); break;
      case 'tick': notes([84, 84], 0.105, 0.048, 'pluck', 0.055); break;
      case 'timeUp': notes([79, 72], 0.21, 0.58, 'bell', 0.095); break;
    }
    return true;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.effectsGeneration++;
    for (const request of this.foleyRequests) request.abort();
    this.foleyRequests.clear();
    this.foleyLoads.clear();
    this.foleyBuffers.clear();
    this.foleyRetryAfter.clear();
    this.unlocked = false;
    this.stopScheduler();
    this.stopVoices();
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.onVisibility);
    const ctx = this.context;
    if (ctx) {
      ctx.removeEventListener('statechange', this.onStateChange);
      try { void ctx.close().catch(() => {}); } catch { /* Already closed or unavailable. */ }
    }
    this.musicBus?.disconnect();
    this.effectsBus?.disconnect();
    this.output?.disconnect();
    this.context = null;
    this.musicBus = null;
    this.effectsBus = null;
    this.output = null;
    this.noiseBuffer = null;
  }

  /** Best effort, bounded same-origin downloads. No network starts before unlock(). */
  async preloadFoley(): Promise<void> {
    const ctx = this.context;
    if (!ctx || this.disposed || !this.gestureRequested || !this.effectsEnabled
      || this.effectsVolume <= 0 || typeof fetch !== 'function') return;
    await Promise.all((Object.keys(FOLEY_FILES) as FoleyCue[]).map(cue => {
      if (this.foleyBuffers.has(cue)) return Promise.resolve();
      const existing = this.foleyLoads.get(cue);
      if (existing) return existing;
      if ((this.foleyRetryAfter.get(cue) ?? 0) > Date.now()) return Promise.resolve();
      const controller = new AbortController();
      this.foleyRequests.add(controller);
      const timeout = setTimeout(() => controller.abort(), 8000);
      const loading = Promise.resolve().then(async () => {
        try {
          const response = await fetch(assetUrl(FOLEY_FILES[cue]), { signal: controller.signal });
          if (!response.ok) throw Error('Recording unavailable');
          const bytes = await response.arrayBuffer();
          if (bytes.byteLength === 0 || bytes.byteLength > MAX_FOLEY_BYTES) throw Error('Recording too large');
          const buffer = await ctx.decodeAudioData(bytes);
          if (!Number.isFinite(buffer.duration) || buffer.duration <= 0 || buffer.duration > MAX_FOLEY_SECONDS
            || buffer.numberOfChannels > 2) throw Error('Invalid recording');
          if (!this.disposed && this.context === ctx && !controller.signal.aborted) {
            this.foleyBuffers.set(cue, buffer);
            this.foleyRetryAfter.delete(cue);
          }
        } catch {
          // A subsequent gesture may retry after a cooldown. Never synthesize a substitute.
          if (!this.disposed) this.foleyRetryAfter.set(cue, Date.now() + 30_000);
        } finally {
          clearTimeout(timeout);
          this.foleyRequests.delete(controller);
          this.foleyLoads.delete(cue);
        }
      });
      this.foleyLoads.set(cue, loading);
      return loading;
    }));
  }

  private playFoley(cue: FoleyCue): boolean {
    const ctx = this.context!, buffer = this.foleyBuffers.get(cue);
    // Deliberately do not await a load here: the next intentional action can use it.
    if (!buffer || !this.canAdd('effects')) return false;
    const playing = [...this.voices].filter(voice => voice.foley);
    if (playing.length >= MAX_FOLEY_VOICES) {
      const oldest = playing[0];
      try { oldest.source.stop(); } catch { /* Already ended. */ }
      this.cleanVoice(oldest);
    }
    let source: AudioBufferSourceNode | undefined;
    let voice: Voice | undefined;
    try {
      source = ctx.createBufferSource();
      source.buffer = buffer;
      const envelope = ctx.createGain(), at = ctx.currentTime;
      source.connect(envelope);
      envelope.connect(this.effectsBus!);
      envelope.gain.setValueAtTime(EPSILON, at);
      envelope.gain.linearRampToValueAtTime(0.8, at + 0.006);
      envelope.gain.setValueAtTime(0.8, at + Math.max(0.006, buffer.duration - 0.025));
      envelope.gain.linearRampToValueAtTime(EPSILON, at + buffer.duration);
      voice = { source, envelope, nodes: [envelope], bus: 'effects', end: at + buffer.duration, foley: true };
      const tracked = voice;
      this.voices.add(tracked);
      this.updateGain('music');
      source.onended = () => this.cleanVoice(tracked);
      source.start(at);
      source.stop(tracked.end);
      return true;
    } catch {
      if (voice) this.cleanVoice(voice); else source?.disconnect();
      return false;
    }
  }

  private isActive(): boolean {
    return !this.disposed && this.active && (typeof document === 'undefined' || !document.hidden);
  }

  private createContext(): boolean {
    if (typeof window === 'undefined') return false;
    const Constructor = window.AudioContext || (window as SafariWindow).webkitAudioContext;
    if (!Constructor) return false;
    let ctx: AudioContext | null = null;
    try {
      ctx = new Constructor();
      this.context = ctx;
      this.musicBus = ctx.createGain();
      this.effectsBus = ctx.createGain();
      this.output = ctx.createDynamicsCompressor();
      this.output.threshold.value = -14;
      this.output.knee.value = 18;
      this.output.ratio.value = 3;
      this.output.attack.value = 0.006;
      this.output.release.value = 0.15;
      this.musicBus.connect(this.output);
      this.effectsBus.connect(this.output);
      this.output.connect(ctx.destination);
      this.musicBus.gain.value = 0;
      this.effectsBus.gain.value = 0;
      const length = Math.ceil(ctx.sampleRate * 0.5);
      this.noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const channel = this.noiseBuffer.getChannelData(0);
      // Seeded noise: repeatable and no work in the realtime audio callback.
      let seed = 137;
      for (let i = 0; i < channel.length; i++) {
        seed = (seed * 16807) % 2147483647;
        channel[i] = (seed / 2147483647) * 2 - 1;
      }
      ctx.addEventListener('statechange', this.onStateChange);
      if (typeof document !== 'undefined') document.addEventListener('visibilitychange', this.onVisibility);
      return true;
    } catch {
      try { if (ctx) void ctx.close().catch(() => {}); } catch { /* Unsupported browser. */ }
      this.context = null;
      this.musicBus = null;
      this.effectsBus = null;
      this.output = null;
      this.noiseBuffer = null;
      return false;
    }
  }

  private resume(fromGesture = false): Promise<boolean> {
    const ctx = this.context;
    if (!ctx || !this.isActive() || (!fromGesture && !this.gestureRequested)) return Promise.resolve(false);
    // Invoke resume synchronously, before the first promise continuation, for iOS.
    let resumed: Promise<void>;
    // Even when currently running, queue resume after any pending suspend.
    try { resumed = ctx.resume(); }
    catch { return Promise.resolve(false); }
    return resumed.then(() => {
      if (this.context !== ctx || !this.isActive()) {
        if (this.context === ctx) this.reconcileActivity();
        return false;
      }
      if (ctx.state !== 'running') return false;
      this.unlocked = true;
      this.updateGain('music');
      this.updateGain('effects');
      this.startScheduler();
      return true;
    }).catch(() => false);
  }

  private onVisibility = (): void => { this.reconcileActivity(); };
  private onStateChange = (): void => {
    if (this.context?.state !== 'running' || !this.isActive()) {
      this.effectsGeneration++;
      this.stopScheduler();
      this.stopVoices();
      if (this.context?.state === 'running') this.reconcileActivity();
    } else if (this.unlocked) {
      this.startScheduler();
    }
  };

  private reconcileActivity(): void {
    const ctx = this.context;
    if (!this.isActive()) {
      this.effectsGeneration++;
      this.stopScheduler();
      this.stopVoices();
      this.lastEffect = -Infinity;
      if (ctx && ctx.state !== 'closed') {
        try { void ctx.suspend().catch(() => {}); } catch { /* Browser interruption. */ }
      }
    } else if (this.gestureRequested) {
      void this.resume();
    }
  }

  private updateGain(bus: Bus): void {
    const ctx = this.context;
    const gain = (bus === 'music' ? this.musicBus : this.effectsBus)?.gain;
    if (!ctx || !gain || ctx.state === 'closed' || this.disposed) return;
    const target = bus === 'music'
      ? (this.musicEnabled ? this.musicVolume * ([...this.voices].some(voice => voice.foley) ? FOLEY_MUSIC_DUCK : 1) : 0)
      : (this.effectsEnabled ? this.effectsVolume : 0);
    gain.cancelScheduledValues(ctx.currentTime);
    gain.setTargetAtTime(target, ctx.currentTime, 0.035);
  }

  private startScheduler(): void {
    const ctx = this.context;
    if (this.scheduler !== null || !ctx || !this.unlocked || !this.isActive()
      || ctx.state !== 'running' || !this.musicEnabled || this.musicVolume <= 0) return;
    // Every restart begins a fresh bar; missed wall time is never replayed.
    this.nextStep = Math.ceil(this.nextStep / 8) * 8 % 128;
    this.nextTime = ctx.currentTime + 0.065;
    this.scheduler = setInterval(this.schedule, 35);
    this.schedule();
  }

  private stopScheduler(): void {
    if (this.scheduler !== null) clearInterval(this.scheduler);
    this.scheduler = null;
  }

  private schedule = (): void => {
    const ctx = this.context;
    if (!ctx || ctx.state !== 'running' || !this.isActive()) {
      this.stopScheduler();
      return;
    }
    if (this.nextTime < ctx.currentTime - 0.09) {
      this.nextStep = Math.ceil(this.nextStep / 8) * 8 % 128;
      this.nextTime = ctx.currentTime + 0.045;
    }
    let scheduled = 0;
    while (this.nextTime < ctx.currentTime + 0.14 && scheduled++ < 3) {
      this.musicStep(this.nextStep, this.nextTime);
      const swing = this.nextStep % 2 === 0 ? 1 + SWING : 1 - SWING;
      this.nextTime += EIGHTH * swing;
      this.nextStep = (this.nextStep + 1) % 128;
    }
  };

  private musicStep(index: number, at: number): void {
    const bar = HARMONY[Math.floor(index / 8)];
    const step = index % 8;
    if (step === 0 || step === 5) {
      bar.chord.forEach((note, voice) => this.tone('music', note, at + voice * 0.009,
        step === 0 ? 1.04 : 0.63, step === 0 ? 0.052 : 0.034, 'keys', (voice - 1.5) * 0.23));
    }
    if (step === 0 || step === 4) {
      this.tone('music', bar.bass + (step === 4 ? 7 : 0), at, 0.56, 0.17, 'bass', -0.08);
      this.kick(at, step === 0 ? 0.1 : 0.06);
    }
    if (step % 2 === 0) this.percussion('music', at + 0.018, 'hat', 0.027, 0.3);
    if (step === 2 || step === 6) this.percussion('music', at + 0.014, 'brush', 0.036, -0.25);
    if (step === 7 && Math.floor(index / 8) % 4 === 3) {
      this.percussion('music', at, 'hat', 0.018, 0.2);
    }
    const melody = bar.melody[step];
    if (melody) this.tone('music', melody, at + 0.017, 0.48, 0.055, 'bell', 0.18);
  }

  private canAdd(bus: Bus): boolean {
    const now = this.context?.currentTime ?? 0;
    for (const voice of this.voices) if (voice.end < now) this.cleanVoice(voice);
    if (this.voices.size >= MAX_VOICES) return false;
    if (bus === 'music') {
      let count = 0;
      for (const voice of this.voices) if (voice.bus === 'music') count++;
      return count < MAX_MUSIC_VOICES;
    }
    return true;
  }

  private tone(bus: Bus, note: number, at: number, duration: number,
    level: number, timbre: Timbre, pan = 0): void {
    const ctx = this.context;
    if (!ctx || !this.canAdd(bus)) return;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    osc.type = timbre === 'bass' || timbre === 'bell' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(midi(note), at);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(timbre === 'bass' ? 480 : timbre === 'keys' ? 1600 : 3400, at);
    filter.Q.value = 0.4;
    const attack = timbre === 'keys' ? 0.022 : timbre === 'bass' ? 0.012 : 0.006;
    this.attachVoice(osc, filter, bus, at, duration, level, attack, pan);
  }

  private percussion(bus: Bus, at: number, kind: 'hat' | 'brush' | 'step', level: number, pan: number): void {
    const ctx = this.context;
    if (!ctx || !this.noiseBuffer || !this.canAdd(bus)) return;
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = kind === 'hat' ? 'highpass' : 'bandpass';
    filter.frequency.value = kind === 'hat' ? 6200 : kind === 'brush' ? 1600 : 330;
    filter.Q.value = kind === 'step' ? 0.7 : 0.45;
    this.attachVoice(source, filter, bus, at, kind === 'brush' ? 0.19 : 0.075, level, 0.003, pan);
  }

  private kick(at: number, level: number): void {
    const ctx = this.context;
    if (!ctx || !this.canAdd('music')) return;
    const source = ctx.createOscillator();
    source.type = 'sine';
    source.frequency.setValueAtTime(105, at);
    source.frequency.exponentialRampToValueAtTime(48, at + 0.095);
    this.attachVoice(source, null, 'music', at, 0.16, level, 0.004, 0);
  }

  private attachVoice(source: AudioScheduledSourceNode, filter: BiquadFilterNode | null,
    bus: Bus, at: number, duration: number, level: number, attack: number, pan: number): void {
    const ctx = this.context!;
    const envelope = ctx.createGain();
    const destination = bus === 'music' ? this.musicBus! : this.effectsBus!;
    const nodes: AudioNode[] = [envelope];
    let tail: AudioNode = source;
    if (filter) { source.connect(filter); tail = filter; nodes.push(filter); }
    tail.connect(envelope);
    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      envelope.connect(panner);
      panner.connect(destination);
      nodes.push(panner);
    } else envelope.connect(destination);
    envelope.gain.setValueAtTime(EPSILON, at);
    envelope.gain.linearRampToValueAtTime(level, at + attack);
    envelope.gain.exponentialRampToValueAtTime(Math.max(EPSILON, level * 0.2), at + duration * 0.65);
    envelope.gain.exponentialRampToValueAtTime(EPSILON, at + duration);
    const voice: Voice = { source, envelope, nodes, bus, end: at + duration + 0.035 };
    this.voices.add(voice);
    source.onended = () => this.cleanVoice(voice);
    source.start(at);
    source.stop(voice.end);
  }

  private cleanVoice(voice: Voice): void {
    this.voices.delete(voice);
    voice.source.onended = null;
    voice.source.disconnect();
    voice.nodes.forEach((node) => node.disconnect());
    // Recompute from today's setting, never restore a volume captured before mute.
    if (voice.foley) this.updateGain('music');
  }

  private stopVoices(bus?: Bus, fade = false): void {
    const now = this.context?.currentTime ?? 0;
    for (const voice of this.voices) {
      if (bus && voice.bus !== bus) continue;
      try {
        if (fade && this.context?.state === 'running') {
          voice.envelope.gain.cancelScheduledValues(now);
          voice.envelope.gain.setTargetAtTime(EPSILON, now, 0.008);
          voice.end = now + 0.035;
          voice.source.stop(voice.end);
        } else {
          voice.source.stop(now);
          this.cleanVoice(voice);
        }
      } catch { this.cleanVoice(voice); }
    }
  }
}

let singleton: CrosswalkAudio | undefined;
/** Construction is SSR-safe: no browser APIs are touched before unlock(). */
export function getAudio(): CrosswalkAudio {
  if (!singleton || singleton.isDisposed) singleton = new CrosswalkAudio();
  return singleton;
}
