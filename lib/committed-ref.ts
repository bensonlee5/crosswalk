import {useCallback, useLayoutEffect, useRef} from 'react';

/** Imperative callbacks see only committed UI state, never an abandoned render.
 * This ref is for event/effect code; read render values directly from props/state.
 * Immediate request/epoch locks belong in their event handlers, not this hook. */
export function useCommittedRef<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => { ref.current = value; }, [value]);
  return ref;
}

/** Stable subscription identity with a callback replaced only after commit. */
export function useCommittedEvent<Args extends unknown[], Result>(callback: (...args: Args) => Result) {
  const committed = useCommittedRef(callback);
  return useCallback((...args: Args) => committed.current(...args), [committed]);
}
