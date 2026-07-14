/**
 * Flashcard-editor controller (WBS 4.4) — form values + the full submit
 * lifecycle: validation (domain FieldIssues), duplicate conflict (View existing
 * / Add anyway), submitting/failure/success, keep-adding reset, and the
 * DEP-TTS pronunciation intent (transient audio-generating state).
 */

import { useCallback, useState } from 'react';

import { isErr, type AppError, type Result } from '@/shared';

import { BLANK_VALUES, type EditorValues } from './flashcard-editor-fixtures';
import type { FieldErrors } from './flashcard-editor-screen';

export type EditorPhase =
  | 'idle'
  | 'duplicate'
  | 'audio-generating'
  | 'submitting'
  | 'submit-error'
  | 'submit-success';

export interface FlashcardEditorDeps {
  /** Persist the card; `force` skips the duplicate rejection (Add anyway). */
  save: (values: EditorValues, force: boolean) => Promise<Result<unknown, AppError>>;
  /** Speak the term (expo-speech; resolves when playback has been started). */
  speak: (term: string, lang: string) => Promise<void>;
}

export interface FlashcardEditorController {
  values: EditorValues;
  phase: EditorPhase;
  errors: FieldErrors | undefined;
  dirty: boolean;
  change: (patch: Partial<EditorValues>) => void;
  save: () => void;
  addAnyway: () => void;
  playAudio: (lang: string) => void;
  /** Reset to a blank form (keep-adding flow). */
  reset: () => void;
}

/** Map a domain validation error's field issues onto the two form fields. */
function toFieldErrors(error: AppError): FieldErrors | undefined {
  if (error.kind !== 'validation') return undefined;
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    if (issue.field === 'term') out.term = issue.message;
    if (issue.field === 'meaning') out.meaning = issue.message;
  }
  return out.term !== undefined || out.meaning !== undefined ? out : undefined;
}

export function useFlashcardEditor(initial: EditorValues, deps: FlashcardEditorDeps): FlashcardEditorController {
  const [values, setValues] = useState<EditorValues>(initial);
  const [phase, setPhase] = useState<EditorPhase>('idle');
  const [errors, setErrors] = useState<FieldErrors | undefined>(undefined);
  const [dirty, setDirty] = useState(false);

  const change = useCallback((patch: Partial<EditorValues>) => {
    setValues((v) => ({ ...v, ...patch }));
    setDirty(true);
    setErrors(undefined);
    setPhase((p) => (p === 'duplicate' || p === 'submit-error' ? 'idle' : p));
  }, []);

  const submit = useCallback(
    (force: boolean) => {
      setPhase('submitting');
      setErrors(undefined);
      void deps.save(values, force).then((r) => {
        if (!isErr(r)) {
          setPhase('submit-success');
          return;
        }
        if (r.error.kind === 'validation') {
          setErrors(toFieldErrors(r.error));
          setPhase('idle');
          return;
        }
        if (r.error.kind === 'conflict') {
          setPhase('duplicate');
          return;
        }
        setPhase('submit-error');
      });
    },
    [deps, values],
  );

  const save = useCallback(() => submit(false), [submit]);
  const addAnyway = useCallback(() => submit(true), [submit]);

  const playAudio = useCallback(
    (lang: string) => {
      if (values.term.trim() === '') return;
      setPhase('audio-generating');
      void deps
        .speak(values.term, lang)
        .catch(() => {})
        .finally(() => setPhase((p) => (p === 'audio-generating' ? 'idle' : p)));
    },
    [deps, values.term],
  );

  const reset = useCallback(() => {
    setValues(BLANK_VALUES);
    setDirty(false);
    setErrors(undefined);
    setPhase('idle');
  }, []);

  return { values, phase, errors, dirty, change, save, addAnyway, playAudio, reset };
}
