/**
 * Contract conformance test (WBS 0.7).
 *
 * Proves the contracts are implementable and compose with the Result kernel: a fake
 * in-memory repository implements `Repository` + `Observable`, and a `UseCase`
 * orchestrates it — the exact shape the feature domains (3.1/4.1/5.1) and data
 * layers (3.2/4.2/5.2) follow, with no UI/DB imports here.
 */

import { ok, err, isOk, isErr } from '@/shared/result';
import { notFoundError, conflictError } from '@/shared/errors';
import type { Repository, Observable, UseCase } from '@/shared/contracts';

interface Deck {
  id: string;
  title: string;
}

class FakeDeckRepository implements Repository<Deck>, Observable {
  private decks = new Map<string, Deck>();
  private listeners = new Set<() => void>();

  subscribe(onChange: () => void): () => void {
    this.listeners.add(onChange);
    return () => this.listeners.delete(onChange);
  }

  private emit(): void {
    this.listeners.forEach((l) => l());
  }

  async getById(id: string) {
    const deck = this.decks.get(id);
    return deck ? ok(deck) : err(notFoundError('Deck'));
  }

  async list() {
    return ok([...this.decks.values()]);
  }

  async save(entity: Deck) {
    if (this.decks.has(entity.id)) {
      return err(conflictError('Deck already exists.'));
    }
    this.decks.set(entity.id, entity);
    this.emit();
    return ok(entity);
  }

  async remove(id: string) {
    this.decks.delete(id);
    this.emit();
    return ok(undefined);
  }
}

/** A use case orchestrating the repository contract. */
class CreateDeck implements UseCase<Deck, Deck> {
  constructor(private readonly repo: Repository<Deck>) {}
  execute(input: Deck) {
    return this.repo.save(input);
  }
}

describe('contracts conformance (WBS 0.7)', () => {
  it('a use case succeeds through the repository contract', async () => {
    const repo = new FakeDeckRepository();
    const result = await new CreateDeck(repo).execute({ id: 'd1', title: 'Spanish' });
    expect(isOk(result)).toBe(true);
  });

  it('surfaces a typed conflict failure instead of throwing', async () => {
    const repo = new FakeDeckRepository();
    const create = new CreateDeck(repo);
    await create.execute({ id: 'd1', title: 'Spanish' });
    const dup = await create.execute({ id: 'd1', title: 'Spanish again' });
    expect(isErr(dup)).toBe(true);
    if (isErr(dup)) {
      expect(dup.error.kind).toBe('conflict');
    }
  });

  it('getById returns a typed not-found for a missing entity', async () => {
    const repo = new FakeDeckRepository();
    const result = await repo.getById('missing');
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.kind).toBe('not-found');
    }
  });

  it('Observable notifies subscribers on change and unsubscribes cleanly', async () => {
    const repo = new FakeDeckRepository();
    let changes = 0;
    const unsub = repo.subscribe(() => {
      changes += 1;
    });
    await repo.save({ id: 'd1', title: 'Spanish' });
    expect(changes).toBe(1);
    unsub();
    await repo.save({ id: 'd2', title: 'German' });
    expect(changes).toBe(1); // no further notifications after unsubscribe
  });
});
