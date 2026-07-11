/* MemoX — Game picker ("Single game"). States: default · scope-dropdown · not-enough
   Feature-local components: components/{GameOption,ScopeCard,ScopeSheet}.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxAppBar, MxButton, MxIconButton } = NS;
const { GameOption, ScopeCard, ScopeSheet } = window.MemoXGamePicker;

const GAMES = [
  { icon: 'join_inner', name: 'Match', desc: 'Match terms to meanings', id: 'match' },
  { icon: 'quiz', name: 'Guess', desc: 'Pick the right meaning', id: 'guess' },
  { icon: 'psychology', name: 'Recall', desc: 'Recall, then self-grade', id: 'recall' },
  { icon: 'keyboard', name: 'Fill', desc: 'Type the term from its meaning', id: 'fill' },
];

function GamePicker({ state = 'default' }) {
  const notEnough = state === 'not-enough';
  const bar = <MxAppBar title="Single game" node="game-picker/appbar" leading={<MxIconButton icon="arrow_back" node="game-picker/back" />} />;

  const base = (
    <MxScaffold node="game-picker/screen" appBar={bar}>
      {notEnough ? (
        <window.ActionCallout node="game-picker/not-enough" icon="info" text="This deck needs at least 4 words to play."
          action={<MxButton variant="primary" size="sm" node="game-picker/add-cards">Add words</MxButton>} />
      ) : null}

      <ScopeCard />

      {GAMES.map((g) => <GameOption key={g.id} g={g} disabled={notEnough} />)}

      <div style={{ textAlign: 'center', fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-tertiary)', padding: 'var(--memox-space-1) 0' }}>5 words per round · change in Settings</div>
    </MxScaffold>
  );

  if (state === 'scope-dropdown') {
    return (
      <React.Fragment>
        {base}
        <ScopeSheet />
      </React.Fragment>
    );
  }

  return base;
}

window.GamePicker = GamePicker;
})();
