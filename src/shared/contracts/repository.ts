/**
 * Repository contracts (WBS 0.7).
 *
 * Engine-independent interfaces the data layer (`features/<feature>/data`, WBS 3.2/4.2/5.2)
 * implements over `expo-sqlite` (ADR 0005), and the domain layer depends on. No SQL,
 * no `expo-sqlite`, no UI leaks above this contract — swapping the DB engine changes
 * only the implementations, never these shapes.
 */

import type { Result } from '../result';

/**
 * Generic entity repository. Reads return a {@link Result} so "not found" is a typed
 * failure, not a null to forget. Feature repositories EXTEND this with their own
 * entity-specific queries; they do not replace it.
 */
export interface Repository<T, ID = string> {
  getById(id: ID): Promise<Result<T>>;
  list(): Promise<Result<T[]>>;
  save(entity: T): Promise<Result<T>>;
  remove(id: ID): Promise<Result<void>>;
}

/**
 * Transaction boundary (ADR 0005 `tx(work)`): runs `work` atomically and rolls back
 * on any throw, so multi-table writes commit all-or-nothing. Implemented once by the
 * DB client and shared by every repository.
 */
export interface Transactional {
  tx<T>(work: () => Promise<T>): Promise<T>;
}

/**
 * Reactive read source (ADR 0003): a repository signals when its data changes so the
 * `useSyncExternalStore`-based hooks (WBS *.3 UI) re-render. `subscribe` returns an
 * unsubscribe function.
 */
export interface Observable {
  subscribe(onChange: () => void): () => void;
}
