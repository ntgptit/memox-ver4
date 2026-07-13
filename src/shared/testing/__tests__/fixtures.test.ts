/**
 * Unit tests for the shared test fixtures (WBS 11.1).
 */

import { sequentialIds, fixedClock, tickingClock } from '@/shared/testing/fixtures';

describe('shared fixtures (WBS 11.1)', () => {
  it('sequentialIds yields prefixed, incrementing ids', () => {
    const ids = sequentialIds('c');
    expect([ids(), ids(), ids()]).toEqual(['c1', 'c2', 'c3']);
  });

  it('fixedClock returns the same time every call', () => {
    const clock = fixedClock(42);
    expect([clock(), clock()]).toEqual([42, 42]);
  });

  it('tickingClock advances by the step each call', () => {
    const clock = tickingClock(100, 10);
    expect([clock(), clock(), clock()]).toEqual([100, 110, 120]);
  });
});
