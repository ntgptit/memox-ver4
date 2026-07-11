/* MemoX — Review local: TermCard (term + audio control; "Playing…" in audio state). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54 || {};
const { MxCard, MxIconButton } = NS;

function TermCard({ state }) {
  return (
    <MxCard node="review-mode/term" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 'var(--memox-space-3)', padding: 'var(--memox-space-6)' }}>
      <div style={{ fontSize: 'var(--memox-font-size-3xl)', fontWeight: 'var(--memox-font-weight-bold)', letterSpacing: 'var(--memox-letter-spacing-tight)' }}>학교</div>
      <MxIconButton icon={state === 'audio' ? 'graphic_eq' : 'volume_up'} node="review-mode/audio" />
      {state === 'audio' ? <div style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-primary)', fontWeight: 'var(--memox-font-weight-semibold)' }}>Playing…</div> : null}
    </MxCard>
  );
}

window.MemoXReviewMode = window.MemoXReviewMode || {};
window.MemoXReviewMode.TermCard = TermCard;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const TermCard = (window.MemoXReviewMode || {}).TermCard;
