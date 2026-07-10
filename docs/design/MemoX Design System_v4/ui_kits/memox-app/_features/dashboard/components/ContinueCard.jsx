/* MemoX — Dashboard local: ContinueCard (one due-deck row in "Continue studying"). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54 || {};
const { MxCard } = NS;

function ContinueCard({ deck, index }) {
  return (
    <MxCard padding="sm" interactive node={'dashboard/deck-' + index}><window.DeckRow {...deck} /></MxCard>
  );
}

window.MemoXDashboard = window.MemoXDashboard || {};
window.MemoXDashboard.ContinueCard = ContinueCard;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const ContinueCard = (window.MemoXDashboard || {}).ContinueCard;
