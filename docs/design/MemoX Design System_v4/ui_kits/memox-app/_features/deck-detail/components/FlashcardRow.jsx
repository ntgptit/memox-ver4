/* MemoX — Deck-detail local: FlashcardRow (term + meaning + status badge).
   Composes the shared window.StatusCardRow (_shared/StatusCardRow.jsx); deck-detail
   tightens the term + ellipsis-clips the meaning. */
(function () {

function FlashcardRow(props) {
  return <window.StatusCardRow {...props} tightTerm truncateMeaning />;
}

window.MemoXDeckDetail = window.MemoXDeckDetail || {};
window.MemoXDeckDetail.FlashcardRow = FlashcardRow;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const FlashcardRow = (window.MemoXDeckDetail || {}).FlashcardRow;
