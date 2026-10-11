/** Short, licensed recordings. Attribution and editing notes live beside the files. */
export const FOLEY_FILES = {
  sip: '/audio/foley/sip.wav',
  pageTurn: '/audio/foley/page-turn.wav',
  cook: '/audio/foley/cook.wav',
  repair: '/audio/foley/repair.wav',
  footsteps: '/audio/foley/footsteps.wav',
  water: '/audio/foley/water.wav',
  write: '/audio/foley/write.wav',
  coin: '/audio/foley/coin.wav',
} as const;
export type FoleyCue = keyof typeof FOLEY_FILES;
export function isFoleyCue(cue: string): cue is FoleyCue {
  return Object.prototype.hasOwnProperty.call(FOLEY_FILES, cue);
}
