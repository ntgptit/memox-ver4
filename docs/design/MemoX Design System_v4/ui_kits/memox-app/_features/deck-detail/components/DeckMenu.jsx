/* MemoX — Deck-detail local: DeckMenu (deck-level actions bottom sheet). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54 || {};

function DeckMenu() {
  return (
    <window.Scrim node="deck-detail/deck-scrim">
      <window.Sheet title="Korean Basics" node="deck-detail/deck-sheet">
        <window.MenuItem icon="edit" label="Rename" node="deck-detail/deck-rename" />
        <window.MenuItem icon="drive_file_move" label="Move" node="deck-detail/deck-move" />
        <window.MenuItem icon="restart_alt" label="Reset progress" node="deck-detail/deck-reset" />
        <window.MenuItem icon="delete" label="Delete deck" danger node="deck-detail/deck-delete" />
      </window.Sheet>
    </window.Scrim>
  );
}

window.MemoXDeckDetail = window.MemoXDeckDetail || {};
window.MemoXDeckDetail.DeckMenu = DeckMenu;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const DeckMenu = (window.MemoXDeckDetail || {}).DeckMenu;
