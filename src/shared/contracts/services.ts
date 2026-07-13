/**
 * Ambient service ports (WBS 0.7, extended for 3.1).
 *
 * The domain stays pure (no `Date.now`/random) by depending on these injected
 * services instead. The app wires real implementations; tests wire deterministic
 * fakes. Kept in the shared contracts so every feature domain reuses one shape.
 */

/** Produces a unique entity id (e.g. a UUID). Injected into create use cases. */
export type IdGenerator = () => string;

/** Returns the current time as epoch milliseconds. Injected wherever `createdAt`/`updatedAt` is set. */
export type Clock = () => number;
