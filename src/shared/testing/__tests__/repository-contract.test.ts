/**
 * Sample REPOSITORY / INTEGRATION test contract (WBS 0.13).
 *
 * The real repositories (WBS 3.2 / 4.2 / 5.2) persist through `expo-sqlite` with the
 * `tx(work)` transaction helper (ADR 0005): a multi-step write is atomic and rolls
 * back on failure, leaving the store unchanged. Native SQLite can't run in the jest
 * (node) environment, so this sample encodes the *contract* against an in-memory
 * fake with the same `tx` shape. Real repository tests swap the fake for the SQLite
 * client and assert the identical arrange → act → assert(+rollback) behaviour.
 */

interface Deck {
  id: string;
  title: string;
}

/** Minimal store mirroring the transactional shape of ADR 0005's `tx(work)`. */
class InMemoryDeckStore {
  private decks = new Map<string, Deck>();

  list(): Deck[] {
    return [...this.decks.values()];
  }

  /** Run `work` atomically: a throw rolls the store back to its pre-tx snapshot. */
  tx<T>(work: (store: InMemoryDeckStore) => T): T {
    const snapshot = new Map(this.decks);
    try {
      return work(this);
    } catch (err) {
      this.decks = snapshot; // ROLLBACK
      throw err;
    }
  }

  insert(deck: Deck): void {
    if (this.decks.has(deck.id)) {
      throw new Error(`duplicate deck id: ${deck.id}`);
    }
    this.decks.set(deck.id, deck);
  }
}

describe('repository contract: transactional write + rollback (ADR 0005)', () => {
  it('commits a successful multi-insert transaction', () => {
    const store = new InMemoryDeckStore();
    store.tx((s) => {
      s.insert({ id: 'd1', title: 'Spanish' });
      s.insert({ id: 'd2', title: 'German' });
    });
    expect(store.list()).toHaveLength(2);
  });

  it('rolls back the whole transaction when any step fails, leaving state unchanged', () => {
    const store = new InMemoryDeckStore();
    store.insert({ id: 'd1', title: 'Spanish' });

    expect(() =>
      store.tx((s) => {
        s.insert({ id: 'd2', title: 'German' }); // would succeed alone…
        s.insert({ id: 'd1', title: 'dup' }); // …but this throws → rollback
      }),
    ).toThrow(/duplicate deck id/);

    // d2 must NOT have been committed; only the pre-tx d1 remains.
    expect(store.list()).toHaveLength(1);
    expect(store.list()[0].id).toBe('d1');
  });
});
