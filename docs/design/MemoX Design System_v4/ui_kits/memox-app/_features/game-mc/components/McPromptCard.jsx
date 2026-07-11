/* MemoX — Game-mc local: McPromptCard (prompt term + audio/edit controls).
   NOTE: kept inline (not promoted to a shared card): its MxCard/MxIconButton carry
   literal node ids the static parity generator must see. Hoisting them behind a
   shared component with dynamic node props would drop them from the contract. */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxCard, MxIconButton } = NS;

function McPromptCard() {
  return (
    <MxCard node="game-mc/prompt" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 'calc(var(--memox-size-2xl) + var(--memox-space-6))', padding: 'var(--memox-space-6)' }}>
      <div style={{ fontSize: 'var(--memox-font-size-4xl)', fontWeight: 'var(--memox-font-weight-bold)', letterSpacing: 'var(--memox-letter-spacing-tight)' }}>학교</div>
      {/* Utility controls tucked into the two right corners so the term stays the sole focus */}
      <div style={{ position: 'absolute', top: 'var(--memox-space-4)', right: 'var(--memox-space-4)' }}>
        <MxIconButton icon="edit" size="sm" node="game-mc/edit" ariaLabel="Edit card" />
      </div>
      <div style={{ position: 'absolute', bottom: 'var(--memox-space-4)', right: 'var(--memox-space-4)' }}>
        <MxIconButton icon="volume_up" node="game-mc/audio" ariaLabel="Play pronunciation" />
      </div>
    </MxCard>
  );
}

window.MemoXGameMC = window.MemoXGameMC || {};
window.MemoXGameMC.McPromptCard = McPromptCard;
})();

/* ESM export so the design-system compiler indexes this kit composite. */
export const McPromptCard = (window.MemoXGameMC || {}).McPromptCard;
