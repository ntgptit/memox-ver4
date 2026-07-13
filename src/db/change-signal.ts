/**
 * Change signal (WBS 3.2) — the reactive `Observable` primitive repositories emit on
 * writes so the `useSyncExternalStore` hooks (ADR 0003) re-render. In-memory, tiny.
 */

export interface ChangeSignal {
  subscribe(onChange: () => void): () => void;
  emit(): void;
}

export function createChangeSignal(): ChangeSignal {
  const listeners = new Set<() => void>();
  return {
    subscribe(onChange) {
      listeners.add(onChange);
      return () => {
        listeners.delete(onChange);
      };
    },
    emit() {
      listeners.forEach((l) => l());
    },
  };
}
