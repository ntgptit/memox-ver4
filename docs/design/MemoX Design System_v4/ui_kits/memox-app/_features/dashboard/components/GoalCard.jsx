/* MemoX — Dashboard local: GoalCard (daily goal + progress ring). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54 || {};
const { MxCard } = NS;

function GoalRing({ pct }) {
  return (
    <window.Ring pct={pct}>
      <div style={{ fontWeight: 'var(--memox-font-weight-extrabold)', fontSize: 'var(--memox-font-size-base)' }}>{pct}%</div>
    </window.Ring>
  );
}

function GoalCard({ pct, met }) {
  return (
    <MxCard node="dashboard/goal" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--memox-space-4)' }}>
      <GoalRing pct={pct} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 'var(--memox-font-weight-extrabold)', fontSize: 'var(--memox-font-size-md)' }}>Daily goal</div>
        <div style={{ fontSize: 'var(--memox-font-size-base)', color: 'var(--memox-text-secondary)', marginTop: 'var(--memox-space-1)' }}>{met ? '20/20 min · complete' : '14/20 min'}</div>
        <div style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-tertiary)', marginTop: 'var(--memox-space-1)' }}>Met when minutes OR words reached</div>
      </div>
    </MxCard>
  );
}

window.MemoXDashboard = window.MemoXDashboard || {};
window.MemoXDashboard.GoalCard = GoalCard;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const GoalCard = (window.MemoXDashboard || {}).GoalCard;
