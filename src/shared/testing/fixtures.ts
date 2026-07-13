/**
 * Shared test fixtures (WBS 11.1) — TEST-ONLY.
 *
 * The reusable building blocks every slice's tests draw on, so the fixture
 * convention is one place, not re-invented per file. Deterministic by design (no
 * `Date.now`/random), matching the injected {@link IdGenerator}/{@link Clock} ports
 * the domain uses (WBS 3.1+). Not imported by app code.
 */

import type { IdGenerator, Clock } from '@/shared';

/** A deterministic id generator: `id1`, `id2`, … (override the prefix per aggregate). */
export function sequentialIds(prefix = 'id'): IdGenerator {
  let n = 0;
  return () => `${prefix}${(n += 1)}`;
}

/** A fixed clock returning the same epoch-ms on every call. */
export function fixedClock(now = 1_000): Clock {
  return () => now;
}

/** An advancing clock: each call returns `start`, `start+step`, `start+2·step`, … */
export function tickingClock(start = 1_000, step = 1_000): Clock {
  let t = start - step;
  return () => (t += step);
}
