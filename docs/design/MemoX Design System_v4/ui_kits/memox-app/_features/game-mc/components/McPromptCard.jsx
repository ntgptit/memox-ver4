/* MemoX — Game-mc local: McPromptCard (prompt term + audio/edit controls).
   NOTE: kept inline (not promoted to a shared card): its MxCard/MxIconButton carry
   literal node ids the static parity generator must see. Hoisting them behind a
   shared component with dynamic node props would drop them from the contract. */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxCard, MxIconButton } = NS;

function McPromptCard() {
  return (
    <MxCard node="game-mc/prompt" style={{ alignItems: 'center', textAlign: 'center', gap: 'var(--memox-space-3)', padding: 'var(--memox-space-6)' }}>
      <div style={{ fontSize: 'var(--memox-font-size-4xl)', fontWeight: 'var(--memox-font-weight-extrabold)', letterSpacing: 'var(--memox-letter-spacing-tight)' }}>학교</div>
      <div style={{ display: 'flex', gap: 'var(--memox-space-2)' }}>
        <MxIconButton icon="volume_up" node="game-mc/audio" />
        <MxIconButton icon="edit" size="sm" node="game-mc/edit" />
      </div>
    </MxCard>
  );
}

window.MemoXGameMC = window.MemoXGameMC || {};
window.MemoXGameMC.McPromptCard = McPromptCard;
})();

/* ESM export so the design-system compiler indexes this kit composite. */
export const McPromptCard = (window.MemoXGameMC || {}).McPromptCard;
