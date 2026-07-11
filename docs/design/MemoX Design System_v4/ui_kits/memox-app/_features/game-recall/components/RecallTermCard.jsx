/* MemoX — Game-recall local: RecallTermCard (prompt term + audio/edit controls).
   NOTE: kept inline (not promoted to a shared card): its MxCard/MxIconButton carry
   literal node ids the static parity generator must see. Hoisting them behind a
   shared component with dynamic node props would drop them from the contract. */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxCard, MxIconButton } = NS;

function RecallTermCard() {
  return (
    <MxCard node="game-recall/term" style={{ alignItems: 'center', textAlign: 'center', gap: 'var(--memox-space-3)', padding: 'var(--memox-space-6)' }}>
      <div style={{ fontSize: 'var(--memox-font-size-4xl)', fontWeight: 'var(--memox-font-weight-bold)', letterSpacing: 'var(--memox-letter-spacing-tight)' }}>친구</div>
      <div style={{ display: 'flex', gap: 'var(--memox-space-2)' }}>
        <MxIconButton icon="volume_up" node="game-recall/audio" />
        <MxIconButton icon="edit" size="sm" node="game-recall/edit" />
      </div>
    </MxCard>
  );
}

window.MemoXGameRecall = window.MemoXGameRecall || {};
window.MemoXGameRecall.RecallTermCard = RecallTermCard;
})();

/* ESM export so the design-system compiler indexes this kit composite. */
export const RecallTermCard = (window.MemoXGameRecall || {}).RecallTermCard;
