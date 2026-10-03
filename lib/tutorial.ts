/** Device-local guidance only. Never stored in, or applied to, a game snapshot. */
export const TUTORIAL_VERSION = 1;
export const TUTORIAL_STORAGE_KEY = 'cw_tutorial_v1';
export const tutorialSteps = ['welcome', 'resources', 'travel', 'activity', 'paths', 'neighbors', 'weather', 'week', 'finish'] as const;
export type TutorialStep = typeof tutorialSteps[number];
export type TutorialState = {version: 1; room: string; step: TutorialStep; status: 'active' | 'skipped' | 'completed'};
export type TutorialEvent = 'next' | 'arrived' | 'acted' | 'forecast-read' | 'bills-reviewed' | 'skip' | 'replay';
export function startTutorial(room: string): TutorialState { return {version: TUTORIAL_VERSION, room, step: 'welcome', status: 'active'}; }
export function restoreTutorial(raw: string | null, room: string, offer = true): TutorialState {
  const initial = () => offer ? startTutorial(room) : {...startTutorial(room), status: 'skipped' as const};
  try {
    const saved = JSON.parse(raw || 'null');
    if (saved?.version !== TUTORIAL_VERSION || !tutorialSteps.includes(saved.step) || !['active', 'skipped', 'completed'].includes(saved.status)) return initial();
    if (saved.status !== 'active') return {...saved, room};
    if (saved.room !== room) return initial();
    // A dialog is not persisted. Return to the travel prompt to reopen any destination.
    return {...saved, step: saved.step === 'activity' ? 'travel' : saved.step};
  } catch { return initial(); }
}
export function advanceTutorial(state: TutorialState, event: TutorialEvent): TutorialState {
  if (event === 'replay') return {...startTutorial(state.room), step: 'resources'};
  if (state.status !== 'active') return state;
  if (event === 'skip') return {...state, status: 'skipped'};
  const expected: Partial<Record<TutorialEvent, TutorialStep>> = {arrived: 'travel', acted: 'activity', 'forecast-read': 'weather', 'bills-reviewed': 'week'};
  if (event !== 'next' && expected[event] !== state.step) return state;
  const index = tutorialSteps.indexOf(state.step);
  return index === tutorialSteps.length - 1 ? {...state, status: 'completed'} : {...state, step: tutorialSteps[index + 1]};
}
