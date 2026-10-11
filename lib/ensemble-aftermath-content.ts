import type { EnsembleAftermathDefinition } from './ensemble-aftermath-types.ts';
import { ensembleAftermathAlder } from './ensemble-aftermath-alder.ts';
import { ensembleAftermathEast } from './ensemble-aftermath-east.ts';
import { ensembleAftermathWest } from './ensemble-aftermath-west.ts';

const authored: EnsembleAftermathDefinition[] = [...ensembleAftermathAlder, ...ensembleAftermathEast, ...ensembleAftermathWest];
/** These identifiers describe the visible effect, not the private alternative.
 * Equal public effects deliberately cannot distinguish inward personal paths. */
function publicEffect(storyId: string, prose: string): string {
  const text = prose.replaceAll('{{actor}}', 'participant');
  const semantic = text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 100);
  let hash = 0;
  for (const char of text) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0;
  return `public_${storyId}_${semantic}_${hash.toString(36)}`;
}
const effects = new Map(authored.flatMap(definition => definition.stages.flatMap(stage => stage.choices.flatMap(option => option.signals.map(signal => [signal, publicEffect(definition.storyId, option.narration.public)] as const)))));
const translate = (signals: string[]) => [...new Set(signals.map(signal => effects.get(signal) ?? signal))];
export const ensembleAftermath: EnsembleAftermathDefinition[] = authored.map(definition => ({
  ...definition,
  sourceSignals: translate([...definition.sourceSignals, ...authored.find(source => source.storyId === definition.sourceStoryId)!.stages.flatMap(stage => stage.choices.flatMap(option => option.signals))]),
  stages: definition.stages.map(stage => ({ ...stage, choices: stage.choices.map(option => ({ ...option,
    signals: translate(option.signals),
    ...(option.sourceSignalsAny ? { sourceSignalsAny: translate(option.sourceSignalsAny) } : {}),
    ...(option.sourceSignalsNone ? { sourceSignalsNone: translate(option.sourceSignalsNone) } : {}),
  })) })),
}));
export const aftermathByStory: Record<string, EnsembleAftermathDefinition> = Object.fromEntries(ensembleAftermath.map(definition => [definition.storyId, definition]));
