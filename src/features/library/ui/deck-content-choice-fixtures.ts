/**
 * Deck-content-choice (WBS 3.6) — preview fixtures. The screen has one canonical state
 * (default); these seed the golden preview + tests with the empty-name default and a
 * named/long-name edge. Display data only.
 */

export const DECK_CONTENT_CHOICE_FIXTURES = {
  /** Brand-new deck, name not yet entered. */
  default: { deckName: '' },
  /** Deck already carries a name (e.g. renamed from Library). */
  named: { deckName: 'TOPIK I Grammar' },
  /** Long name — overflow/wrap edge. */
  longText: { deckName: 'Advanced Business Korean — Reports, Meetings & Negotiation' },
} satisfies Record<string, { deckName: string }>;

export type DeckContentChoiceFixtureKey = keyof typeof DECK_CONTENT_CHOICE_FIXTURES;
