/**
 * Export controller (WBS 9.2) — the config → exporting → done/export-error
 * machine: config edits feed the build, progress ticks, build/deliver failures
 * land in export-error, retry re-runs, and share/save act on the written uri.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';

import { ok, err, storageError } from '@/shared';

import { useExport, type ExportDeps } from '../use-export';

function makeDeps(over: Partial<ExportDeps> = {}): ExportDeps {
  return {
    build: async (_config, onProgress) => {
      onProgress(2, 2);
      return ok({ text: 'Term\tMeaning\n사랑\tlove', count: 2 });
    },
    deliver: async () => 'file:///cache/deck.csv',
    share: async () => {},
    save: async () => {},
    ...over,
  };
}

describe('useExport — lifecycle', () => {
  it('runExport passes the edited config to build and lands in done with the real count', async () => {
    let seen: unknown = null;
    const deps = makeDeps({
      build: async (config, onProgress) => {
        seen = config;
        onProgress(1, 1);
        return ok({ text: 'x', count: 320 });
      },
    });
    const { result } = renderHook(() => useExport(deps));
    act(() => result.current.pickScope('subtree'));
    act(() => result.current.pickFormat(1));
    act(() => result.current.pickSeparator(2));
    act(() => result.current.toggleSrs(false));
    act(() => result.current.runExport());
    expect(result.current.ui).toBe('exporting');
    await waitFor(() => expect(result.current.ui).toBe('done'));
    expect(seen).toEqual({ scope: 'subtree', format: 'xlsx', separator: 'semicolon', includeSrs: false });
    expect(result.current.data.total).toBe(320);
  });

  it('progress ticks drive the exporting percentage', async () => {
    let release: (() => void) | null = null;
    const deps = makeDeps({
      build: async (_c, onProgress) => {
        onProgress(7, 10);
        await new Promise<void>((r) => {
          release = r;
        });
        return ok({ text: 'x', count: 10 });
      },
    });
    const { result } = renderHook(() => useExport(deps));
    act(() => result.current.runExport());
    await waitFor(() => expect(result.current.data.progressPct).toBe(70));
    expect(result.current.ui).toBe('exporting');
    act(() => release?.());
    await waitFor(() => expect(result.current.ui).toBe('done'));
  });

  it('a failed build lands in export-error and retry re-runs to done', async () => {
    let fail = true;
    const deps = makeDeps({
      build: async () => (fail ? err(storageError('no space')) : ok({ text: 'x', count: 1 })),
    });
    const { result } = renderHook(() => useExport(deps));
    act(() => result.current.runExport());
    await waitFor(() => expect(result.current.ui).toBe('export-error'));

    fail = false;
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.ui).toBe('done'));
  });

  it('a throwing deliver lands in export-error', async () => {
    const deps = makeDeps({
      deliver: async () => {
        throw new Error('disk');
      },
    });
    const { result } = renderHook(() => useExport(deps));
    act(() => result.current.runExport());
    await waitFor(() => expect(result.current.ui).toBe('export-error'));
  });
});

describe('useExport — done actions', () => {
  it('share/save forward the written uri; a clipboard export (null uri) is a no-op', async () => {
    const share = jest.fn(async () => {});
    const save = jest.fn(async () => {});
    const { result } = renderHook(() => useExport(makeDeps({ share, save })));
    act(() => result.current.runExport());
    await waitFor(() => expect(result.current.ui).toBe('done'));
    act(() => result.current.share());
    act(() => result.current.save());
    expect(share).toHaveBeenCalledWith('file:///cache/deck.csv');
    expect(save).toHaveBeenCalledWith('file:///cache/deck.csv');

    const share2 = jest.fn(async () => {});
    const { result: r2 } = renderHook(() =>
      useExport(makeDeps({ share: share2, deliver: async () => null })),
    );
    act(() => r2.current.runExport());
    await waitFor(() => expect(r2.current.ui).toBe('done'));
    act(() => r2.current.share());
    expect(share2).not.toHaveBeenCalled();
  });
});
