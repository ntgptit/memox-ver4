/* Shared: DeckPlaySheet — the "how do you want to study?" chooser, opened from a deck /
   subdeck "Study" (bolt) action on any deck surface (Library, Subdeck List, Flashcard List).
   Branches the study entry into the full adaptive Study session (review → match → guess →
   recall → fill) or the à-la-carte Single mode picker. This is the ONLY entry into Mode
   Picker, so it is shared to keep one chooser contract across every deck surface. */
(function () {
function DeckPlaySheet({ title = 'Korean TOPIK I' }) {
  const { Scrim, Sheet, MenuItem } = window;
  const chevron = <span className="material-symbols-rounded" style={{ color: 'var(--memox-text-tertiary)' }}>chevron_right</span>;
  return (
    <Scrim align="end" node="deck-play/scrim">
      <Sheet title={'Study ' + title} node="deck-play/sheet">
        <MenuItem icon="bolt" tone="var(--memox-primary)" label="Study session" node="deck-play/session" />
        <MenuItem icon="sports_esports" label="Single mode" trailing={chevron} node="deck-play/single-mode" />
      </Sheet>
    </Scrim>
  );
}
window.DeckPlaySheet = DeckPlaySheet;
})();

export const DeckPlaySheet = window.DeckPlaySheet;
