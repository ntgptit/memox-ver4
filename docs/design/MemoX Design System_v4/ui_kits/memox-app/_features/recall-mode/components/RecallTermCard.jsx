/* MemoX — Recall-mode local: RecallTermCard (prompt term + audio/edit controls).
   NOTE: kept inline (not promoted to a shared card): its MxCard/MxIconButton carry
   literal node ids the static parity generator must see. Hoisting them behind a
   shared component with dynamic node props would drop them from the contract. */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxCard, MxIconButton } = NS;

function RecallTermCard() {
  return (
    <MxCard node="recall-mode/term" style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 'var(--memox-space-6)' }}>
      <div style={{ fontSize: 'var(--memox-font-size-3xl)', fontWeight: 'var(--memox-font-weight-bold)', letterSpacing: 'var(--memox-letter-spacing-tight)' }}>친구</div>
      {/* Utility controls tucked into the two right corners so the term stays the sole focus */}
      <div style={{ position: 'absolute', top: 'var(--memox-space-4)', right: 'var(--memox-space-4)' }}>
        <MxIconButton icon="edit" size="sm" node="recall-mode/edit" ariaLabel="Edit card" />
      </div>
      <div style={{ position: 'absolute', bottom: 'var(--memox-space-4)', right: 'var(--memox-space-4)' }}>
        <MxIconButton icon="volume_up" node="recall-mode/audio" ariaLabel="Play pronunciation" />
      </div>
    </MxCard>
  );
}

window.MemoXRecallMode = window.MemoXRecallMode || {};
window.MemoXRecallMode.RecallTermCard = RecallTermCard;
})();

/* ESM export so the design-system compiler indexes this kit composite. */
export const RecallTermCard = (window.MemoXRecallMode || {}).RecallTermCard;
