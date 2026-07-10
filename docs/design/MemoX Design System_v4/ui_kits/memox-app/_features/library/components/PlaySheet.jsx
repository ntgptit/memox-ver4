/* MemoX — Library local: PlaySheet (per-deck study/play bottom sheet). */
(function () {

function PlaySheet() {
  return (
    <window.Sheet title="TOPIK I — Vocabulary" node="library/play-sheet">
      <window.MenuItem icon="school" label="Learn · 20 new" node="library/play-learn" />
      <window.MenuItem icon="replay" label="Review · 48 due" node="library/play-review" />
      <window.MenuItem icon="visibility" label="Browse cards" node="library/play-browse" />
      <window.MenuItem icon="sports_esports" label="Single game · due 48 / new 20" node="library/play-game" />
      <window.MenuItem icon="play_circle" label="Player" node="library/play-player" />
    </window.Sheet>
  );
}

window.MemoXLibrary = window.MemoXLibrary || {};
window.MemoXLibrary.PlaySheet = PlaySheet;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const PlaySheet = (window.MemoXLibrary || {}).PlaySheet;
