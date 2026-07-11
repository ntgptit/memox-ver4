/* MemoX — Study-result local: StreakGoalCard (streak + today's goal progress). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxCard, MxBadge } = NS;

function StreakGoalCard({ met }) {
  // met → goal reached/exceeded: green celebration treatment; otherwise the neutral
  // primary-soft streak card. Fill uses a vibrant token so the achieved portion always
  // reads stronger than the track (fixes the washed-out dark-mode bar).
  const accent = met ? 'var(--memox-success)' : 'var(--memox-primary)';
  const tint = met ? { background: 'var(--memox-success-soft)', color: 'var(--memox-on-success-soft)' } : {};
  return (
    <MxCard node="study-result/goal" variant={met ? undefined : 'primary-soft'} style={{ gap: 'var(--memox-space-3)', ...tint }}>
      {met ? (
        <div style={{ display: 'flex' }}>
          <MxBadge tone="success" soft node="study-result/goal-badge">
            <span className="material-symbols-rounded" style={{ fontSize: 'var(--memox-icon-size-sm)', verticalAlign: 'text-bottom', marginRight: 'var(--memox-space-1)' }}>celebration</span>
            Daily goal completed!
          </MxBadge>
        </div>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-4)' }}>
        <span className="material-symbols-rounded" style={{ fontSize: 'var(--memox-icon-size-lg)', color: accent }}>local_fire_department</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 'var(--memox-font-weight-extrabold)', fontSize: 'var(--memox-font-size-md)' }}>{met ? '13 days' : '12 days'}</div>
          <div style={{ fontSize: 'var(--memox-font-size-sm)', opacity: 'var(--memox-opacity-label-soft)' }}>day streak{met ? ' · +1 today' : ''}</div>
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--memox-font-size-sm)', marginBottom: 'var(--memox-space-2)', opacity: 'var(--memox-opacity-label)' }}>
          <span>Today's goal</span><span>{met ? '22/20 min' : '14/20 min'}</span>
        </div>
        <window.ProgressBar value={met ? 100 : 70} height={8} tone={accent} node="study-result/goal-bar" />
      </div>
    </MxCard>
  );
}

window.MemoXStudyResult = window.MemoXStudyResult || {};
window.MemoXStudyResult.StreakGoalCard = StreakGoalCard;
})();

/* ESM export so the design-system compiler indexes this kit composite. */
export const StreakGoalCard = (window.MemoXStudyResult || {}).StreakGoalCard;
