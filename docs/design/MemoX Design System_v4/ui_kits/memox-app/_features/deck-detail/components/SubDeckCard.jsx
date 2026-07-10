/* MemoX — Deck-detail local: SubDeckCard (one sub-deck node in the SUB-DECKS list). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54 || {};
const { MxCard } = NS;

function SubDeckCard({ deck, index }) {
  return (
    <MxCard padding="sm" interactive node={'deck-detail/subdeck-' + index}><window.DeckRow {...deck} /></MxCard>
  );
}

window.MemoXDeckDetail = window.MemoXDeckDetail || {};
window.MemoXDeckDetail.SubDeckCard = SubDeckCard;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const SubDeckCard = (window.MemoXDeckDetail || {}).SubDeckCard;
