import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Returns true only on the client after hydration, and false on the server.
 * This completely avoids hydration mismatches without triggering setState in effects.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Checks if SpeechRecognition is supported in the client browser
 */
export function useSpeechRecognitionSupported(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === 'undefined') return false;
      return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    },
    () => false
  );
}
