import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * SSR-safe mounted hook using React 18/19 useSyncExternalStore.
 * Avoids cascading renders and react-hooks/set-state-in-effect lint warnings.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
