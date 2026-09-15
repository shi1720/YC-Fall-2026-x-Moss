"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Map<string, Set<() => void>>();

function emit(key: string) {
  for (const l of listeners.get(key) ?? []) l();
}

/**
 * localStorage-backed state that is SSR-safe (server snapshot = fallback) and never calls
 * setState from an effect.
 */
export function useStoredState(key: string, fallback: string): [string, (v: string) => void] {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(cb);
      const onStorage = (e: StorageEvent) => e.key === key && cb();
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.get(key)?.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );
  const get = useCallback(() => {
    try {
      return window.localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  }, [key, fallback]);
  const value = useSyncExternalStore(subscribe, get, () => fallback);
  const set = useCallback(
    (v: string) => {
      try {
        window.localStorage.setItem(key, v);
      } catch {
        /* private mode */
      }
      emit(key);
    },
    [key],
  );
  return [value, set];
}
