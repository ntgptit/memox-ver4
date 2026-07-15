/**
 * Library use cases (WBS 3.1): create/rename/delete deck, create/move/delete subdeck.
 * Pure orchestration over the repository ports; each returns a {@link Result} and the
 * tree-mutating ones enforce the subdeck invariants. Factory functions inject ports +
 * services for testability.
 */

import { isErr, type UseCase, type IdGenerator, type Clock } from '@/shared';
import { makeDeck, renameDeck, reorganiseDeck, moveDeck, type Deck, type DeckOrganisation } from './deck';
import { makeSubdeck, moveSubdeck as moveSubdeckEntity, type Subdeck } from './subdeck';
import type { DeckRepository, SubdeckRepository } from './ports';

export interface LibraryDeps {
  decks: DeckRepository;
  subdecks: SubdeckRepository;
  ids: IdGenerator;
  clock: Clock;
}

// --- decks ---------------------------------------------------------------------

export interface CreateDeckInput {
  title: string;
  languagePairId: string;
  organisation: DeckOrganisation;
}

export function createDeck(deps: Pick<LibraryDeps, 'decks' | 'ids' | 'clock'>): UseCase<CreateDeckInput, Deck> {
  return {
    async execute(input) {
      const built = makeDeck({
        id: deps.ids(),
        title: input.title,
        languagePairId: input.languagePairId,
        organisation: input.organisation,
        createdAt: deps.clock(),
      });
      return built.ok ? deps.decks.save(built.value) : built;
    },
  };
}

export interface RenameDeckInput {
  deckId: string;
  title: string;
}

export function renameDeckUseCase(deps: Pick<LibraryDeps, 'decks' | 'clock'>): UseCase<RenameDeckInput, Deck> {
  return {
    async execute(input) {
      const found = await deps.decks.getById(input.deckId);
      if (isErr(found)) {
        return found;
      }
      const renamed = renameDeck(found.value, input.title, deps.clock());
      return renamed.ok ? deps.decks.save(renamed.value) : renamed;
    },
  };
}

export function deleteDeck(deps: Pick<LibraryDeps, 'decks'>): UseCase<string, void> {
  return {
    execute(deckId) {
      return deps.decks.remove(deckId);
    },
  };
}

export interface MoveDeckInput {
  deckId: string;
  languagePairId: string;
}

/** Move a deck to another language pair (deck-settings, WBS 4.5). */
export function moveDeckUseCase(deps: Pick<LibraryDeps, 'decks' | 'clock'>): UseCase<MoveDeckInput, Deck> {
  return {
    async execute(input) {
      const found = await deps.decks.getById(input.deckId);
      if (isErr(found)) {
        return found;
      }
      const moved = moveDeck(found.value, input.languagePairId, deps.clock());
      return moved.ok ? deps.decks.save(moved.value) : moved;
    },
  };
}

export interface SetDeckContentInput {
  deckId: string;
  title: string;
  organisation: DeckOrganisation;
}

/**
 * Name + organise a new deck in one step (deck-content-choice, WBS 3.6): rename the
 * deck (validates the title) and set its organisation, then persist. A blank title
 * short-circuits with a validation error before any write.
 */
export function setDeckContentUseCase(deps: Pick<LibraryDeps, 'decks' | 'clock'>): UseCase<SetDeckContentInput, Deck> {
  return {
    async execute(input) {
      const found = await deps.decks.getById(input.deckId);
      if (isErr(found)) {
        return found;
      }
      const now = deps.clock();
      const renamed = renameDeck(found.value, input.title, now);
      if (isErr(renamed)) {
        return renamed;
      }
      return deps.decks.save(reorganiseDeck(renamed.value, input.organisation, now));
    },
  };
}

// --- subdecks ------------------------------------------------------------------

export interface CreateSubdeckInput {
  deckId: string;
  parentId: string | null;
  title: string;
  position: number;
}

export function createSubdeck(deps: Pick<LibraryDeps, 'decks' | 'subdecks' | 'ids'>): UseCase<CreateSubdeckInput, Subdeck> {
  return {
    async execute(input) {
      // No orphan: the owning deck must exist before a subdeck can be created.
      const deck = await deps.decks.getById(input.deckId);
      if (isErr(deck)) {
        return deck;
      }
      const built = makeSubdeck({
        id: deps.ids(),
        deckId: input.deckId,
        parentId: input.parentId,
        title: input.title,
        position: input.position,
      });
      return built.ok ? deps.subdecks.save(built.value) : built;
    },
  };
}

export interface RenameSubdeckInput {
  subdeckId: string;
  title: string;
}

/** Rename a subdeck (12.11 B3) — re-validates the title via the entity rules. */
export function renameSubdeckUseCase(deps: Pick<LibraryDeps, 'subdecks'>): UseCase<RenameSubdeckInput, Subdeck> {
  return {
    async execute(input) {
      const found = await deps.subdecks.getById(input.subdeckId);
      if (isErr(found)) {
        return found;
      }
      const built = makeSubdeck({ ...found.value, title: input.title });
      return built.ok ? deps.subdecks.save(built.value) : built;
    },
  };
}

export interface MoveSubdeckInput {
  subdeckId: string;
  newParentId: string | null;
}

export function moveSubdeckUseCase(deps: Pick<LibraryDeps, 'subdecks'>): UseCase<MoveSubdeckInput, Subdeck> {
  return {
    async execute(input) {
      const found = await deps.subdecks.getById(input.subdeckId);
      if (isErr(found)) {
        return found;
      }
      const tree = await deps.subdecks.listByDeck(found.value.deckId);
      if (isErr(tree)) {
        return tree;
      }
      const moved = moveSubdeckEntity(found.value, input.newParentId, tree.value);
      return moved.ok ? deps.subdecks.save(moved.value) : moved;
    },
  };
}

export function deleteSubdeck(deps: Pick<LibraryDeps, 'subdecks'>): UseCase<string, void> {
  return {
    execute(subdeckId) {
      return deps.subdecks.remove(subdeckId);
    },
  };
}
