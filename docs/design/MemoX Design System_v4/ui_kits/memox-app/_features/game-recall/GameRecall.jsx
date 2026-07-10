/* MemoX — Game: Recall. States: before-reveal · revealed · forgot · remembered · complete
   Feature-local components: components/{TermCard,MeaningPanel}.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxAppBar, MxIconButton, MxButton } = NS;
const { RecallTermCard, MeaningPanel } = window.MemoXGameRecall;

const Note = window.Note;

function GameRecall({ state = 'before-reveal' }) {
  const revealed = state === 'revealed' || state === 'forgot' || state === 'remembered';
  const bar = (
    <MxAppBar node="game-recall/appbar" title="Recall"
      leading={<MxIconButton icon="arrow_back" node="game-recall/back" />}
      trailing={<MxIconButton icon="more_horiz" node="game-recall/options" />} />
  );

  if (state === 'complete') {
    return (
      <MxScaffold node="game-recall/screen" appBar={bar}>
        <window.ProgressHeader done={20} total={20} node="game-recall/progress" />
        <window.EmptyState node="game-recall/complete" icon="celebration" tone="success" title="Round complete!"
          text="You've reviewed the words in this round."
          action={<MxButton variant="primary" icon="arrow_forward" node="game-recall/next">Next round</MxButton>} />
      </MxScaffold>
    );
  }

  return (
    <MxScaffold node="game-recall/screen" appBar={bar}>
      <window.ProgressHeader done={12} total={20} node="game-recall/progress" />

      <RecallTermCard />

      <MeaningPanel revealed={revealed} />

      {state === 'forgot' ? <Note icon="replay" tone="warning" text="You'll see this word again this round." /> : null}
      {state === 'remembered' ? <Note icon="check_circle" tone="success" text="Nice! Moving to the next card." /> : null}

      {state === 'before-reveal' ? (
        <MxButton variant="primary" icon="visibility" block size="lg" node="game-recall/reveal">Show</MxButton>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--memox-space-3)' }}>
          <MxButton variant={state === 'forgot' ? 'primary' : 'ghost'} danger={state === 'forgot'} block node="game-recall/forgot">Forgot</MxButton>
          <MxButton variant="primary" block node="game-recall/remembered">Got it</MxButton>
        </div>
      )}
    </MxScaffold>
  );
}

window.GameRecall = GameRecall;
})();
