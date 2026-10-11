export type AudioPreferences = {music:boolean;effects:boolean;musicVolume:number;effectsVolume:number};
export const defaultAudioPreferences: AudioPreferences = {music:true,effects:true,musicVolume:.24,effectsVolume:.55};
export const AUDIO_PREFERENCES_KEY = 'cw_audio_v1';
export function readAudioPreferences(storage: Pick<Storage, 'getItem'>): AudioPreferences {
  try {
    const saved = JSON.parse(storage.getItem(AUDIO_PREFERENCES_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return {...defaultAudioPreferences};
    const volume = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value)
      ? Math.max(0, Math.min(1, value)) : fallback;
    return {
      music: typeof saved.music === 'boolean' ? saved.music : true,
      effects: typeof saved.effects === 'boolean' ? saved.effects : true,
      musicVolume: volume(saved.musicVolume, .24), effectsVolume: volume(saved.effectsVolume, .55),
    };
  } catch { return {...defaultAudioPreferences}; }
}
