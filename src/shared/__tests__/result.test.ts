/**
 * Unit tests for the Result kernel (WBS 0.6).
 */

import { ok, err, isOk, isErr, map, mapError, flatMap, unwrapOr } from '@/shared/result';
import { storageError } from '@/shared/errors';

describe('Result kernel (WBS 0.6)', () => {
  it('constructs and narrows Ok', () => {
    const r = ok(42);
    expect(isOk(r)).toBe(true);
    expect(isErr(r)).toBe(false);
    if (isOk(r)) {
      expect(r.value).toBe(42);
    }
  });

  it('constructs and narrows Err', () => {
    const r = err(storageError());
    expect(isErr(r)).toBe(true);
    if (isErr(r)) {
      expect(r.error.kind).toBe('storage');
    }
  });

  it('map transforms Ok and passes Err through untouched', () => {
    expect(map(ok(2), (n) => n * 3)).toEqual(ok(6));
    const e = err(storageError());
    expect(map(e, (n: number) => n * 3)).toBe(e);
  });

  it('mapError transforms Err and passes Ok through untouched', () => {
    const mapped = mapError(err('boom'), (msg) => `wrapped:${msg}`);
    expect(mapped).toEqual(err('wrapped:boom'));
    expect(mapError(ok(1), (x: string) => x)).toEqual(ok(1));
  });

  it('flatMap chains fallible steps and short-circuits on the first Err', () => {
    const parse = (s: string) => (s === 'bad' ? err('nope') : ok(s.length));
    expect(flatMap(ok('abc'), parse)).toEqual(ok(3));
    expect(flatMap(ok('bad'), parse)).toEqual(err('nope'));
    expect(flatMap(err('early'), parse)).toEqual(err('early'));
  });

  it('unwrapOr returns the value or the fallback', () => {
    expect(unwrapOr(ok(5), 0)).toBe(5);
    expect(unwrapOr(err('x') as ReturnType<typeof err<string>>, 0)).toBe(0);
  });
});
