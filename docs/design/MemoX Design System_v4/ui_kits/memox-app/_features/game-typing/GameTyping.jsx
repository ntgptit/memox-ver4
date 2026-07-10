/* MemoX — Game: Typing. States: waiting · typing · hint · correct · wrong · complete
   Feature-local components: components/{CharCompare,InputBox}.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxAppBar, MxCard, MxIconButton, MxButton } = NS;
const { CharCompare, InputBox } = window.MemoXGameTyping;

const Note = window.Note;

const INPUT = {
  waiting: { content: null, placeholder: 'Type the Korean word…' },
  typing: { content: '친' },
  hint: { content: '친 _' },
  correct: { content: '친구', tone: 'correct' },
  wrong: { content: <CharCompare />, tone: 'wrong' },
};

function GameTyping({ state = 'waiting' }) {
  const bar = (
    <MxAppBar node="game-typing/appbar" title="Typing"
      leading={<MxIconButton icon="arrow_back" node="game-typing/back" />}
      trailing={<MxIconButton icon="more_horiz" node="game-typing/options" />} />
  );

  if (state === 'complete') {
    return (
      <MxScaffold node="game-typing/screen" appBar={bar}>
        <window.ProgressHeader done={20} total={20} node="game-typing/progress" />
        <window.EmptyState node="game-typing/complete" icon="celebration" tone="success" title="Round complete!"
          text="You typed the words correctly."
          action={<MxButton variant="primary" icon="arrow_forward" node="game-typing/next">Next round</MxButton>} />
      </MxScaffold>
    );
  }

  const inp = INPUT[state] || INPUT.waiting;
  let controls;
  if (state === 'correct') {
    controls = <MxButton variant="primary" icon="arrow_forward" block node="game-typing/next">Next</MxButton>;
  } else if (state === 'wrong') {
    controls = (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--memox-space-3)' }}>
        <MxButton variant="outline" block node="game-typing/accept">Correct</MxButton>
        <MxButton variant="primary" block node="game-typing/retry">Retry</MxButton>
      </div>
    );
  } else {
    controls = (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--memox-space-3)' }}>
        <MxButton variant="ghost" icon="lightbulb" block node="game-typing/hint">Help</MxButton>
        <MxButton variant="primary" block disabled={state === 'waiting'} node="game-typing/check">Check</MxButton>
      </div>
    );
  }

  return (
    <MxScaffold node="game-typing/screen" appBar={bar}>
      <window.ProgressHeader done={16} total={20} node="game-typing/progress" />

      <MxCard node="game-typing/meaning" style={{ alignItems: 'center', textAlign: 'center', gap: 'var(--memox-space-2)', padding: 'var(--memox-space-6)' }}>
        <window.SectionLabel style={{ margin: 0 }}>MEANING</window.SectionLabel>
        <div style={{ fontSize: 'var(--memox-font-size-2xl)', fontWeight: 'var(--memox-font-weight-extrabold)' }}>friend</div>
      </MxCard>

      <div style={{ fontSize: 'var(--memox-font-size-sm)', fontWeight: 'var(--memox-font-weight-bold)', color: 'var(--memox-text-secondary)' }}>Type the term (Korean)</div>
      <InputBox {...inp} />

      {state === 'hint' ? <Note icon="lightbulb" tone="warning" text="Hint: 2 characters, starts with 친" /> : null}
      {state === 'wrong' ? (
        <div style={{ textAlign: 'center', fontSize: 'var(--memox-font-size-base)', color: 'var(--memox-text-secondary)' }}>
          Answer: <b style={{ color: 'var(--memox-success)' }}>친구</b>
        </div>
      ) : null}

      {controls}
    </MxScaffold>
  );
}

window.GameTyping = GameTyping;
})();
