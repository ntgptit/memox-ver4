/* Shared: StudyPromptCard — the study prompt term centred in a card, with the audio + edit
   controls tucked into the two right corners so the term stays the sole focus. Used by the
   Guess prompt (compact) and the Recall hero (fill). `nodePrefix` keeps each screen's own
   data-mx-node ids: <prefix>/prompt · <prefix>/edit · <prefix>/audio. */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxCard, MxIconButton } = NS;

function StudyPromptCard({ term, nodePrefix, fill }) {
  const sizing = fill ? { flex: 1 } : { minHeight: 'calc(var(--memox-size-2xl) + var(--memox-space-6))' };
  return (
    <MxCard node={nodePrefix + '/prompt'} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'var(--memox-space-6)', ...sizing }}>
      <div style={{ fontSize: 'var(--memox-font-size-3xl)', fontWeight: 'var(--memox-font-weight-bold)', letterSpacing: 'var(--memox-letter-spacing-tight)' }}>{term}</div>
      <div style={{ position: 'absolute', top: 'var(--memox-space-4)', right: 'var(--memox-space-4)' }}>
        <MxIconButton icon="edit" size="sm" node={nodePrefix + '/edit'} ariaLabel="Edit card" />
      </div>
      <div style={{ position: 'absolute', bottom: 'var(--memox-space-4)', right: 'var(--memox-space-4)' }}>
        <MxIconButton icon="volume_up" node={nodePrefix + '/audio'} ariaLabel="Play pronunciation" />
      </div>
    </MxCard>
  );
}

window.StudyPromptCard = StudyPromptCard;
})();

export const StudyPromptCard = window.StudyPromptCard;
