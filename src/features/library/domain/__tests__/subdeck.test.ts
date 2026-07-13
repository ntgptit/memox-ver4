/**
 * Unit tests for Subdeck entity + structural invariants (WBS 3.1).
 */

import { isOk, isErr } from '@/shared';
import {
  makeSubdeck,
  isAncestor,
  moveSubdeck,
  assertNotOrphan,
  type Subdeck,
} from '@/features/library/domain';

function sd(id: string, deckId: string, parentId: string | null): Subdeck {
  return { id, deckId, parentId, title: id, position: 0 };
}

describe('makeSubdeck (WBS 3.1)', () => {
  it('rejects an empty title', () => {
    expect(isErr(makeSubdeck({ id: 's1', deckId: 'd1', parentId: null, title: '  ', position: 0 }))).toBe(true);
  });

  it('rejects a subdeck with no owning deck', () => {
    expect(isErr(makeSubdeck({ id: 's1', deckId: '', parentId: null, title: 'Verbs', position: 0 }))).toBe(true);
  });

  it('constructs a valid subdeck (trimmed title)', () => {
    const r = makeSubdeck({ id: 's1', deckId: 'd1', parentId: null, title: '  Verbs ', position: 2 });
    expect(isOk(r)).toBe(true);
    if (isOk(r)) {
      expect(r.value.title).toBe('Verbs');
      expect(r.value.position).toBe(2);
    }
  });
});

describe('isAncestor (WBS 3.1)', () => {
  // s1 → s2 → s3 (s3 nested under s2 nested under s1)
  const tree = [sd('s1', 'd1', null), sd('s2', 'd1', 's1'), sd('s3', 'd1', 's2')];

  it('detects a transitive ancestor', () => {
    expect(isAncestor('s1', 's3', tree)).toBe(true);
  });

  it('is reflexive (a node is its own ancestor for cycle checks)', () => {
    expect(isAncestor('s2', 's2', tree)).toBe(true);
  });

  it('returns false for an unrelated node', () => {
    expect(isAncestor('s3', 's1', tree)).toBe(false);
  });
});

describe('moveSubdeck (WBS 3.1 invariants)', () => {
  const tree = [sd('s1', 'd1', null), sd('s2', 'd1', 's1'), sd('other', 'd2', null)];

  it('moves to top level (parentId null)', () => {
    const r = moveSubdeck(tree[1], null, tree);
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value.parentId).toBeNull();
  });

  it('rejects nesting under itself', () => {
    expect(isErr(moveSubdeck(tree[0], 's1', tree))).toBe(true);
  });

  it('rejects a cycle (moving a parent under its own descendant)', () => {
    const r = moveSubdeck(tree[0], 's2', tree); // s1 under its child s2
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('conflict');
  });

  it('rejects a parent from a different deck', () => {
    const r = moveSubdeck(tree[1], 'other', tree);
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('conflict');
  });

  it('rejects an unknown parent', () => {
    const r = moveSubdeck(tree[1], 'ghost', tree);
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('not-found');
  });
});

describe('assertNotOrphan (WBS 3.1 no-orphan invariant)', () => {
  const tree = [sd('s1', 'd1', null), sd('s2', 'd1', 's1')];

  it('fails when the owning deck does not exist', () => {
    const r = assertNotOrphan(tree[0], false, tree);
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('not-found');
  });

  it('fails when the parent belongs to another deck', () => {
    const cross = sd('s3', 'd1', 'foreign');
    const r = assertNotOrphan(cross, true, [...tree, sd('foreign', 'd2', null)]);
    expect(isErr(r)).toBe(true);
  });

  it('passes a well-formed nested subdeck', () => {
    expect(isOk(assertNotOrphan(tree[1], true, tree))).toBe(true);
  });
});
