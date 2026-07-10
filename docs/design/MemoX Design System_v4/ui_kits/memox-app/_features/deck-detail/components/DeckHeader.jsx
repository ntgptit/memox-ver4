/* MemoX — Deck-detail local: DeckHeader (app bar, shared by every state). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54 || {};
const { MxAppBar, MxIconButton } = NS;

function DeckHeader() {
  return (
    <MxAppBar title="Korean Basics" node="deck-detail/appbar"
      leading={<MxIconButton icon="arrow_back" node="deck-detail/back" />}
      trailing={<React.Fragment>
        <MxIconButton icon="volume_up" node="deck-detail/play-audio" />
        <MxIconButton icon="more_vert" node="deck-detail/menu" />
      </React.Fragment>} />
  );
}

window.MemoXDeckDetail = window.MemoXDeckDetail || {};
window.MemoXDeckDetail.DeckHeader = DeckHeader;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const DeckHeader = (window.MemoXDeckDetail || {}).DeckHeader;
