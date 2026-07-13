/**
 * LanguagePair entity (WBS 3.1).
 *
 * A learning↔native pair (e.g. Spanish↔English). Pure domain — no UI/DB imports.
 * `makeLanguagePair` is the only constructor and validates input, returning a typed
 * {@link ValidationError} instead of throwing (WBS 0.6).
 */

import { ok, err, validationError, type Result, type FieldIssue } from '@/shared';

export interface LanguagePair {
  readonly id: string;
  readonly learning: string;
  readonly native: string;
  readonly createdAt: number;
}

export interface MakeLanguagePairInput {
  id: string;
  learning: string;
  native: string;
  createdAt: number;
}

/** Validate + construct a LanguagePair. Learning/native must be non-empty and distinct. */
export function makeLanguagePair(input: MakeLanguagePairInput): Result<LanguagePair> {
  const learning = input.learning.trim();
  const native = input.native.trim();
  const issues: FieldIssue[] = [];

  if (learning.length === 0) {
    issues.push({ field: 'learning', message: 'Choose a language to learn.' });
  }
  if (native.length === 0) {
    issues.push({ field: 'native', message: 'Choose your language.' });
  }
  if (learning.length > 0 && learning.toLowerCase() === native.toLowerCase()) {
    issues.push({ field: 'native', message: 'The two languages must be different.' });
  }

  if (issues.length > 0) {
    return err(validationError(issues));
  }
  return ok({ id: input.id, learning, native, createdAt: input.createdAt });
}
