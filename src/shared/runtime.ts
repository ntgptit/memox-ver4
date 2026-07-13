/**
 * Runtime service implementations (WBS 0.7 ports → concrete impls).
 *
 * The domain depends only on the {@link IdGenerator} / {@link Clock} ports and stays
 * pure; this is the impure edge the app wires in. Kept OUT of the pure `@/shared`
 * barrel — import it directly (`@/shared/runtime`) so domain code can't reach it.
 */

import type { IdGenerator, Clock } from './contracts/services';

/** Wall-clock time in epoch milliseconds. */
export const systemClock: Clock = () => Date.now();

/**
 * Collision-resistant local id: millisecond timestamp + random suffix, base36. Good
 * enough for a single-user offline store (no coordination needed); the timestamp
 * prefix also keeps ids roughly sortable by creation. Not a cryptographic UUID.
 */
export const randomId: IdGenerator = () => {
  const time = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 0xffffffff).toString(36);
  return `${time}-${rand}`;
};
