/**
 * Application error model + user-facing mapping (WBS 0.6).
 *
 * `AppError` is the discriminated error type every use case returns in a failed
 * {@link Result}. `toUserFacingError` maps it to the {@link UserFacingError} shape a
 * screen renders in its recoverable-error state (construction contract §6) — a
 * title, a human message, and whether a retry is worth offering. Keeping the
 * developer error and the user-facing text separate means messages are localizable
 * and screens never inspect the error `kind` themselves.
 *
 * Pure, no React/DB imports (ADR 0001 shared-kernel rule).
 */

/** A single field-level problem, for the form validation-error state. */
export interface FieldIssue {
  field: string;
  message: string;
}

/** Bad user input — drives the form validation-error state (per-field). */
export interface ValidationError {
  kind: 'validation';
  message: string;
  issues: FieldIssue[];
}

/** A requested entity does not exist. */
export interface NotFoundError {
  kind: 'not-found';
  message: string;
  entity: string;
}

/** The write violates an invariant (e.g. duplicate deck/card — WBS 4.1). */
export interface ConflictError {
  kind: 'conflict';
  message: string;
}

/** A persistence/database failure (transient — worth a retry). */
export interface StorageError {
  kind: 'storage';
  message: string;
  cause?: unknown;
}

/** An unclassified failure — the catch-all so nothing throws past the boundary. */
export interface UnexpectedError {
  kind: 'unexpected';
  message: string;
  cause?: unknown;
}

/**
 * The app error union. Additive: capability errors (network/auth) arrive with
 * their features (DEP-CLOUD / DEP-AUTH) as new members, not by widening these.
 */
export type AppError =
  | ValidationError
  | NotFoundError
  | ConflictError
  | StorageError
  | UnexpectedError;

// --- constructors (use these, don't build the objects inline) ------------------

export function validationError(issues: FieldIssue[], message = 'Please fix the highlighted fields.'): ValidationError {
  return { kind: 'validation', message, issues };
}

export function notFoundError(entity: string, message = `${entity} not found.`): NotFoundError {
  return { kind: 'not-found', message, entity };
}

export function conflictError(message: string): ConflictError {
  return { kind: 'conflict', message };
}

export function storageError(message = 'Could not save your changes.', cause?: unknown): StorageError {
  return { kind: 'storage', message, cause };
}

export function unexpectedError(message = 'Something went wrong.', cause?: unknown): UnexpectedError {
  return { kind: 'unexpected', message, cause };
}

// --- user-facing mapping -------------------------------------------------------

/** What a screen renders in its recoverable-error state. `retryable` gates the retry CTA. */
export interface UserFacingError {
  title: string;
  message: string;
  retryable: boolean;
}

/**
 * Map an {@link AppError} to the user-facing contract. Storage failures are
 * retryable (transient); validation/not-found/conflict are not (the input or state
 * must change first); unexpected offers a retry as a best effort.
 */
export function toUserFacingError(error: AppError): UserFacingError {
  switch (error.kind) {
    case 'validation':
      return { title: 'Check your details', message: error.message, retryable: false };
    case 'not-found':
      return { title: 'Not found', message: error.message, retryable: false };
    case 'conflict':
      return { title: 'Already exists', message: error.message, retryable: false };
    case 'storage':
      return { title: 'Save failed', message: error.message, retryable: true };
    case 'unexpected':
      return { title: 'Something went wrong', message: error.message, retryable: true };
  }
}
