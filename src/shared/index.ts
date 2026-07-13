/**
 * Shared kernel (WBS 0.6 / 0.7) — public surface.
 *
 * Cross-cutting types with no feature/UI/DB imports (ADR 0001): the `Result` kernel,
 * the app error model + user-facing mapping, and (WBS 0.7) the repository/use-case
 * contracts. Domain and data layers import from here.
 */

export * from './result';
export * from './errors';
export * from './contracts';
