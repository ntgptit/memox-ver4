/* MemoX — Game: Multiple choice. States: waiting · correct · wrong · complete
   Feature-local component: components/PromptCard.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxAppBar, MxIconButton, MxButton } = NS;
const { McPromptCard } = window.MemoXGameMC;

const CHOICES = ['school', 'hospital', 'park', 'restaurant', 'library'];

const Choice = window.ChoiceOption;

function toneFor(state, i) {
  if (state === 'correct') return i === 0 ? 'correct' : undefined;
  if (state === 'wrong') return i === 0 ? 'correct' : (i === 2 ? 'wrong' : undefined);
  return undefined;
}

function GameMultipleChoice({ state = 'waiting' }) {
  const bar = (
    <MxAppBar node="game-mc/appbar" title="Multiple choice"
      leading={<MxIconButton icon="arrow_back" node="game-mc/back" />}
      trailing={<MxIconButton icon="more_horiz" node="game-mc/options" />} />
  );

  if (state === 'complete') {
    return (
      <MxScaffold node="game-mc/screen" appBar={bar}>
        <window.ProgressHeader done={20} total={20} node="game-mc/progress" />
        <window.EmptyState node="game-mc/complete" icon="celebration" tone="success" title="Round complete!"
          text="You answered 5/5 correctly."
          action={<MxButton variant="primary" icon="arrow_forward" node="game-mc/next">Next round</MxButton>} />
      </MxScaffold>
    );
  }

  return (
    <MxScaffold node="game-mc/screen" appBar={bar}>
      <window.ProgressHeader done={8} total={20} node="game-mc/progress" />
      <McPromptCard />
      {/* 5 answer options fill the remaining body height as equal rows — taller, chunkier tap
          targets and no dead space below. reclaim the (unused) bottom-nav padding so they fit. */}
      <div style={{ flex: '1 1 0', minHeight: 0, marginBottom: 'calc(-1 * var(--memox-bottom-nav-height))', display: 'grid', gridTemplateRows: 'repeat(5, 1fr)', gap: 'var(--memox-space-3)' }}>
        {CHOICES.map((c, i) => <Choice key={i} text={c} tone={toneFor(state, i)} node={'game-mc/choice-' + i} />)}
      </div>
    </MxScaffold>
  );
}

window.GameMultipleChoice = GameMultipleChoice;
})();
