/**
 * Result<T, E> — the typed success/failure kernel (WBS 0.6).
 *
 * Every use case (WBS 3.1/4.1/5.1…) returns a `Result` instead of throwing, so the
 * failure path is part of the type and each screen can render its recoverable-error
 * state (construction contract §6) from a typed value. `E` defaults to {@link AppError}
 * (the app error model in `./errors`).
 *
 * Pure, no React/DB imports (ADR 0001 shared-kernel rule).
 */

import type { AppError } from './errors';

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

export type Result<T, E = AppError> = Ok<T> | Err<E>;

/** Wrap a success value. */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/** Wrap a failure. */
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/** Type guard: the result succeeded (narrows to {@link Ok}). */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

/** Type guard: the result failed (narrows to {@link Err}). */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

/** Transform the success value, leaving a failure untouched. */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

/** Transform the error, leaving a success untouched. */
export function mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return result.ok ? result : err(fn(result.error));
}

/** Chain a fallible step; short-circuits on the first failure. */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}

/** Extract the value or a fallback if the result failed. */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}
