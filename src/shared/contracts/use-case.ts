/**
 * Use-case contracts (WBS 0.7).
 *
 * A use case is the domain layer's unit of behaviour (create deck, grade a card…).
 * It takes typed input and returns a {@link Result} — success or a typed
 * {@link AppError} — never throwing across the boundary (WBS 0.6). Use cases are
 * pure orchestration over repository contracts; they import no UI and no DB engine
 * (ADR 0001 domain rule).
 */

import type { Result } from '../result';

/**
 * An async use case: `execute(input)` resolves to a {@link Result}. Use `void` for
 * `Input` when the use case needs no argument. Most use cases are async because they
 * orchestrate the (async) repositories.
 */
export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Result<Output>>;
}

/** Function form of {@link UseCase}, for use cases with no dependencies to inject. */
export type UseCaseFn<Input, Output> = (input: Input) => Promise<Result<Output>>;

/**
 * A synchronous use case — pure computation with no I/O (e.g. SRS interval math,
 * validation). Returns a {@link Result} directly.
 */
export interface SyncUseCase<Input, Output> {
  execute(input: Input): Result<Output>;
}
