/**
 * Subdeck entity + structural invariants (WBS 3.1).
 *
 * A subdeck lives inside exactly one deck and may nest under another subdeck of the
 * SAME deck (`parentId`). The invariants here keep the tree well-formed — no orphan
 * (every subdeck references a real deck), no cross-deck parent, and no cycle when
 * moving. Pure domain (WBS 0.6 Results, no UI/DB).
 */

import { ok, err, validationError, notFoundError, conflictError, type Result } from '@/shared';

export interface Subdeck {
  readonly id: string;
  readonly deckId: string;
  /** Parent subdeck within the same deck, or null for a top-level subdeck. */
  readonly parentId: string | null;
  readonly title: string;
  readonly position: number;
}

export interface MakeSubdeckInput {
  id: string;
  deckId: string;
  parentId: string | null;
  title: string;
  position: number;
}

/** Validate + construct a Subdeck. Title + owning deck are required. */
export function makeSubdeck(input: MakeSubdeckInput): Result<Subdeck> {
  const title = input.title.trim();
  if (title.length === 0) {
    return err(validationError([{ field: 'title', message: 'Give the subdeck a name.' }]));
  }
  if (input.deckId.length === 0) {
    return err(validationError([{ field: 'deckId', message: 'A subdeck must belong to a deck.' }]));
  }
  return ok({
    id: input.id,
    deckId: input.deckId,
    parentId: input.parentId,
    title,
    position: input.position,
  });
}

/**
 * Is `candidateAncestorId` an ancestor of (or equal to) `subdeckId`, walking `parentId`
 * up through `all`? Used to reject moves that would create a cycle.
 */
export function isAncestor(
  candidateAncestorId: string,
  subdeckId: string,
  all: readonly Subdeck[],
): boolean {
  const byId = new Map(all.map((s) => [s.id, s]));
  let current: string | null = subdeckId;
  while (current !== null) {
    if (current === candidateAncestorId) {
      return true;
    }
    current = byId.get(current)?.parentId ?? null;
  }
  return false;
}

/**
 * Validate moving `subdeck` under `newParentId` (or null = top level) among `siblingsAndTree`
 * (all subdecks of the same deck). Rejects: unknown parent, cross-deck parent, and cycles
 * (moving a subdeck under itself or one of its descendants). Returns the moved Subdeck.
 */
export function moveSubdeck(
  subdeck: Subdeck,
  newParentId: string | null,
  tree: readonly Subdeck[],
): Result<Subdeck> {
  if (newParentId === null) {
    return ok({ ...subdeck, parentId: null });
  }
  if (newParentId === subdeck.id) {
    return err(conflictError('A subdeck cannot be nested under itself.'));
  }
  const parent = tree.find((s) => s.id === newParentId);
  if (parent === undefined) {
    return err(notFoundError('Subdeck', 'The target subdeck no longer exists.'));
  }
  if (parent.deckId !== subdeck.deckId) {
    return err(conflictError('A subdeck can only move within its own deck.'));
  }
  // Moving under a descendant would create a cycle.
  if (isAncestor(subdeck.id, newParentId, tree)) {
    return err(conflictError('A subdeck cannot be nested under one of its own subdecks.'));
  }
  return ok({ ...subdeck, parentId: newParentId });
}

/**
 * Assert a subdeck is not orphaned: its `deckId` must exist and, if nested, its
 * `parentId` must be another subdeck of the SAME deck. Returns the subdeck unchanged
 * on success. (WBS 3.1 invariant: no orphan subdeck.)
 */
export function assertNotOrphan(
  subdeck: Subdeck,
  deckExists: boolean,
  tree: readonly Subdeck[],
): Result<Subdeck> {
  if (!deckExists) {
    return err(notFoundError('Deck', 'This subdeck points at a deck that does not exist.'));
  }
  if (subdeck.parentId !== null) {
    const parent = tree.find((s) => s.id === subdeck.parentId);
    if (parent === undefined || parent.deckId !== subdeck.deckId) {
      return err(conflictError('This subdeck points at a parent outside its deck.'));
    }
  }
  return ok(subdeck);
}
