/* MemoX — Game-picker local: GameOption (one game choice row). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxCard, MxIconTile } = NS;

function GameOption({ g, disabled }) {
  return (
    <MxCard interactive padding="sm" node={'game-picker/game-' + g.id} style={{ opacity: disabled ? 'var(--memox-opacity-half)' : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-4)' }}>
        <MxIconTile icon={g.icon} tone="accent" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 'var(--memox-font-weight-bold)', fontSize: 'var(--memox-font-size-base)' }}>{g.name}</div>
          <div style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)', marginTop: 'var(--memox-space-1)' }}>{g.desc}</div>
        </div>
        <span className="material-symbols-rounded" style={{ color: 'var(--memox-text-tertiary)' }}>chevron_right</span>
      </div>
    </MxCard>
  );
}

window.MemoXGamePicker = window.MemoXGamePicker || {};
window.MemoXGamePicker.GameOption = GameOption;
})();

/* ESM export so the design-system compiler indexes this kit composite. */
export const GameOption = (window.MemoXGamePicker || {}).GameOption;
