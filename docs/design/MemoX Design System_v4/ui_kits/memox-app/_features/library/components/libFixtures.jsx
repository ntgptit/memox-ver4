/* Library fixtures + status helpers (domain: Deck › Subdeck › Card). */
(function () {
const DECKS = [
  { icon: 'translate', tone: 'accent', name: 'Korean TOPIK I', cards: 486, due: 48, subdecks: 5, progress: 64 },
  { icon: 'menu_book', tone: 'accent', name: 'Basic Grammar', cards: 180, new: 23, subdecks: 0, progress: 40 },
  { icon: 'record_voice_over', tone: 'accent', name: 'Daily Conversation', cards: 150, upToDate: true, subdecks: 3, progress: 100 },
  { icon: 'history_edu', tone: 'accent', name: 'Hanja Roots', cards: 320, due: 12, subdecks: 0, progress: 72 },
  { icon: 'travel_explore', tone: 'accent', name: 'Travel Phrases', cards: 96, new: 8, subdecks: 2, progress: 30 },
  { icon: 'work', tone: 'accent', name: 'Business Korean', cards: 210, upToDate: true, subdecks: 0, progress: 100 },
];
const DENSE = Array.from({ length: 22 }, (_, i) => {
  const b = DECKS[i % DECKS.length];
  return {
    ...b,
    name: i < 2 ? 'Advanced Idiomatic Expressions & Formal Register Workbook' : b.name + (i >= DECKS.length ? ' · set ' + (i - DECKS.length + 2) : ''),
    cards: i === 1 ? 1280 : b.cards, due: i === 0 ? 128 : b.due,
  };
});
const SUBDECKS = [
  { name: 'Greetings & introductions', cards: 42, due: 8, progress: 82 },
  { name: 'Numbers & counting', cards: 55, upToDate: true, progress: 100 },
  { name: 'Family & relationships', cards: 38, new: 6, progress: 24 },
  { name: 'Food & dining', cards: 47, due: 15, progress: 51 },
  { name: 'Directions & transport', cards: 35, upToDate: true, progress: 100 },
];

// Semantic status text: Due→warning, New→info(accent), Up-to-date→success.
function Status({ d }) {
  if (d.due > 0) return <span style={{ color: 'var(--memox-on-warning-soft)', fontWeight: 'var(--memox-font-weight-semibold)' }}>{d.due > 99 ? '99+' : d.due} due</span>;
  if (d.new > 0) return <span style={{ color: 'var(--memox-accent)', fontWeight: 'var(--memox-font-weight-semibold)' }}>{d.new} new</span>;
  return <span style={{ color: 'var(--memox-on-success-soft)', fontWeight: 'var(--memox-font-weight-semibold)' }}>Up to date</span>;
}
// Exactly TWO metadata groups (§7): card count · status.
function deckMeta(d) {
  return <React.Fragment>{d.cards.toLocaleString()} cards · <Status d={d} /></React.Fragment>;
}

window.MemoXLibrary = Object.assign(window.MemoXLibrary || {}, { DECKS, DENSE, SUBDECKS, Status, deckMeta });
})();

export const libFixtures = window.MemoXLibrary;
