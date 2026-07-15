/**
 * Import controller (WBS 9.1) — the source → mapping → preview/dup-warning →
 * importing → done/import-error machine: paste + file entry, parse failures,
 * duplicate warning, progress, import failure + retry, and column swap.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';

import { ok, err, storageError } from '@/shared';
import type { Card } from '@/features/flashcards/domain';

import { useImport, type ImportDeps } from '../use-import';

const asCards = (terms: string[]) => terms.map((term) => ({ term }) as Card);

function makeDeps(over: Partial<ImportDeps> = {}): ImportDeps {
  return {
    pickFile: async () => 'a\tb\nc\td',
    listExisting: async () => [],
    importRows: async (rows, onProgress) => {
      rows.forEach((_, i) => onProgress(i + 1, rows.length));
      return ok({ imported: rows.length });
    },
    deckName: 'TOPIK I — Vocabulary',
    ...over,
  };
}

describe('useImport — paste flow', () => {
  it('pasted text → mapping → preview → importing → done, with real counts', async () => {
    const { result } = renderHook(() => useImport(makeDeps()));
    act(() => result.current.changePasted('사랑\tlove\n학교\tschool'));
    act(() => result.current.pickSource(2));
    expect(result.current.ui).toBe('mapping');
    expect(result.current.data.tableRows).toEqual([
      ['Term', 'Meaning'],
      ['사랑', 'love'],
      ['학교', 'school'],
    ]);

    act(() => result.current.continueToPreview());
    await waitFor(() => expect(result.current.ui).toBe('preview'));
    expect(result.current.data.total).toBe(2);

    act(() => result.current.runImport());
    await waitFor(() => expect(result.current.ui).toBe('done'));
    expect(result.current.data.total).toBe(2);
  });

  it('an empty paste box does not leave source', () => {
    const { result } = renderHook(() => useImport(makeDeps()));
    act(() => result.current.pickSource(2));
    expect(result.current.ui).toBe('source');
  });

  it('existing terms trigger the dup warning with the dup count', async () => {
    const deps = makeDeps({ listExisting: async () => asCards(['사랑']) });
    const { result } = renderHook(() => useImport(deps));
    act(() => result.current.changePasted('사랑\tlove\n학교\tschool'));
    act(() => result.current.pickSource(2));
    act(() => result.current.continueToPreview());
    await waitFor(() => expect(result.current.ui).toBe('dup-warning'));
    expect(result.current.data.dups).toBe(1);
  });

  it('a malformed line fails into import-error with its row number', async () => {
    const { result } = renderHook(() => useImport(makeDeps()));
    act(() => result.current.changePasted('사랑\tlove\nbroken'));
    act(() => result.current.pickSource(2));
    act(() => result.current.continueToPreview());
    await waitFor(() => expect(result.current.ui).toBe('import-error'));
    expect(result.current.data.errorText).toContain('row 2');
  });
});

describe('useImport — file flow', () => {
  it('a picked file lands in mapping with its parsed rows', async () => {
    const { result } = renderHook(() => useImport(makeDeps()));
    act(() => result.current.pickSource(0));
    await waitFor(() => expect(result.current.ui).toBe('mapping'));
    expect(result.current.data.tableRows[1]).toEqual(['a', 'b']);
  });

  it('a cancelled picker stays on source', async () => {
    const deps = makeDeps({ pickFile: async () => null });
    const { result } = renderHook(() => useImport(deps));
    act(() => result.current.pickSource(0));
    await new Promise((r) => setTimeout(r, 0));
    expect(result.current.ui).toBe('source');
  });

  it('an unreadable file fails into import-error', async () => {
    const deps = makeDeps({
      pickFile: async () => {
        throw new Error('boom');
      },
    });
    const { result } = renderHook(() => useImport(deps));
    act(() => result.current.pickSource(1));
    await waitFor(() => expect(result.current.ui).toBe('import-error'));
  });
});

describe('useImport — import lifecycle', () => {
  async function toPreview(deps: ImportDeps) {
    const rendered = renderHook(() => useImport(deps));
    act(() => rendered.result.current.changePasted('사랑\tlove\n학교\tschool'));
    act(() => rendered.result.current.pickSource(2));
    act(() => rendered.result.current.continueToPreview());
    await waitFor(() => expect(rendered.result.current.ui).toBe('preview'));
    return rendered;
  }

  it('a failed import lands in import-error and retry re-runs it to done', async () => {
    let fail = true;
    const deps = makeDeps({
      importRows: async (rows) => {
        if (fail) return err(storageError('Could not save your changes.'));
        return ok({ imported: rows.length });
      },
    });
    const { result } = await toPreview(deps);
    act(() => result.current.runImport());
    await waitFor(() => expect(result.current.ui).toBe('import-error'));

    fail = false;
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.ui).toBe('done'));
  });

  it('progress ticks drive the importing counts', async () => {
    let release: (() => void) | null = null;
    const deps = makeDeps({
      importRows: async (rows, onProgress) => {
        onProgress(1, rows.length);
        await new Promise<void>((r) => {
          release = r;
        });
        return ok({ imported: rows.length });
      },
    });
    const { result } = await toPreview(deps);
    act(() => result.current.runImport());
    await waitFor(() => expect(result.current.data.progressDone).toBe(1));
    expect(result.current.ui).toBe('importing');
    expect(result.current.data.progressPct).toBe(50);
    act(() => release?.());
    await waitFor(() => expect(result.current.ui).toBe('done'));
  });
});

describe('useImport — mapping controls', () => {
  it('swapMapping flips the columns and pickSeparator re-parses', () => {
    const { result } = renderHook(() => useImport(makeDeps()));
    act(() => result.current.changePasted('사랑,love'));
    act(() => result.current.pickSeparator(1));
    act(() => result.current.pickSource(2));
    expect(result.current.data.tableRows[1]).toEqual(['사랑', 'love']);
    act(() => result.current.swapMapping());
    expect(result.current.data.tableRows[1]).toEqual(['love', '사랑']);
  });
});
