import type { EnsembleOption } from './ensemble-story-types.ts';

/** A finite personal consequence, never a second claim on a shared item/job. */
export type EnsembleAftermathOption = EnsembleOption & {
  afterChoices?: string[];
  sourceSignalsAny?: string[];
  sourceSignalsNone?: string[];
};
export type EnsembleAftermathDefinition = {
  storyId: string;
  sourceStoryId: string;
  sourceSignals: string[];
  stages: { id: string; title: string; prompt: string; choices: EnsembleAftermathOption[] }[];
};
