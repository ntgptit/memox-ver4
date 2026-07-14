/**
 * Flashcard-editor controller (WBS 4.4) — submit lifecycle via renderHook:
 * success, validation errors mapped per-field, duplicate conflict + Add-anyway
 * force path, storage failure + retry, keep-adding reset, and the transient
 * audio-generating phase.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';

import { ok, err, validationError, conflictError, storageError } from '@/shared';

import { useFlashcardEditor, type FlashcardEditorDeps } from '../use-flashcard-editor';
import { FILLED_VALUES } from '../flashcard-editor-fixtures';

function makeDeps(over: Partial<FlashcardEditorDeps> = {}): FlashcardEditorDeps {
  return {
    save: async () => ok(undefined),
    speak: async () => {},
    ...over,
  };
}

describe('useFlashcardEditor — submit lifecycle', () => {
  it('save success → submit-success', async () => {
    const { result } = renderHook(() => useFlashcardEditor(FILLED_VALUES, makeDeps()));
    act(() => result.current.save());
    expect(result.current.phase).toBe('submitting');
    await waitFor(() => expect(result.current.phase).toBe('submit-success'));
  });

  it('validation error maps onto term/meaning fields and returns to idle', async () => {
    const deps = makeDeps({
      save: async () =>
        err(
          validationError([
            { field: 'term', message: 'Enter the word or phrase.' },
            { field: 'meaning', message: 'Enter the meaning.' },
          ]),
        ),
    });
    const { result } = renderHook(() => useFlashcardEditor(FILLED_VALUES, deps));
    act(() => result.current.save());
    await waitFor(() => expect(result.current.errors).toBeDefined());
    expect(result.current.errors).toEqual({ term: 'Enter the word or phrase.', meaning: 'Enter the meaning.' });
    expect(result.current.phase).toBe('idle');
  });

  it('conflict → duplicate; addAnyway forces the save through', async () => {
    let forced = false;
    const deps = makeDeps({
      save: async (_v, force) => {
        forced = force;
        return force ? ok(undefined) : err(conflictError('duplicate'));
      },
    });
    const { result } = renderHook(() => useFlashcardEditor(FILLED_VALUES, deps));
    act(() => result.current.save());
    await waitFor(() => expect(result.current.phase).toBe('duplicate'));
    act(() => result.current.addAnyway());
    await waitFor(() => expect(result.current.phase).toBe('submit-success'));
    expect(forced).toBe(true);
  });

  it('storage failure → submit-error; editing again clears it', async () => {
    const deps = makeDeps({ save: async () => err(storageError('nope')) });
    const { result } = renderHook(() => useFlashcardEditor(FILLED_VALUES, deps));
    act(() => result.current.save());
    await waitFor(() => expect(result.current.phase).toBe('submit-error'));
    act(() => result.current.change({ term: '감사합니다' }));
    expect(result.current.phase).toBe('idle');
    expect(result.current.values.term).toBe('감사합니다');
    expect(result.current.dirty).toBe(true);
  });

  it('reset returns to a blank pristine form (keep-adding flow)', async () => {
    const { result } = renderHook(() => useFlashcardEditor(FILLED_VALUES, makeDeps()));
    act(() => result.current.save());
    await waitFor(() => expect(result.current.phase).toBe('submit-success'));
    act(() => result.current.reset());
    expect(result.current.values.term).toBe('');
    expect(result.current.dirty).toBe(false);
    expect(result.current.phase).toBe('idle');
  });

  it('playAudio: transient audio-generating, then back to idle; no-op when blank', async () => {
    let resolveSpeak: () => void = () => {};
    const deps = makeDeps({ speak: () => new Promise<void>((r) => (resolveSpeak = r)) });
    const { result } = renderHook(() => useFlashcardEditor(FILLED_VALUES, deps));
    act(() => result.current.playAudio('ko'));
    expect(result.current.phase).toBe('audio-generating');
    act(() => resolveSpeak());
    await waitFor(() => expect(result.current.phase).toBe('idle'));

    const blank = renderHook(() => useFlashcardEditor({ ...FILLED_VALUES, term: ' ' }, makeDeps()));
    act(() => blank.result.current.playAudio('ko'));
    expect(blank.result.current.phase).toBe('idle');
  });
});
