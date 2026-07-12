MxList — the one vertical list wrapper for any stack of cards or rows (decks, subdecks, flashcards, search results). It owns the standard 12px inter-card gap (`--memox-space-3`) so every list in the app spaces its items identically. Always wrap a card list in this instead of dropping cards straight into the scroll body, whose section gap is the larger 24px.

```jsx
<MxList node="library/decks">
  {decks.map((d) => <DeckCard key={d.id} deck={d} />)}
</MxList>
```

Pass `gap` (any spacing token) to override the default, e.g. `gap="var(--memox-space-2)"` for a denser list. Never hard-code a pixel gap.
