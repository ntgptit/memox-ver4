/* MemoX — Game: Matching. States: playing · selected · correct · wrong · almost · complete
   Feature-local component: components/Tile.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxAppBar, MxIconButton, MxButton } = NS;
const { Tile } = window.MemoXGameMatching;

const LEFT = ['time', 'love', 'friend', 'food', 'school'];
const RIGHT = ['사랑', '학교', '음식', '시간', '친구'];

function toneFor(state, side, i) {
  if (state === 'selected') return side === 'L' && i === 1 ? 'selected' : undefined;
  if (state === 'correct') return (side === 'L' && i === 1) || (side === 'R' && i === 0) ? 'correct' : undefined;
  if (state === 'wrong') return (side === 'L' && i === 1) || (side === 'R' && i === 1) ? 'wrong' : undefined;
  if (state === 'almost') {
    const matched = side === 'L' ? [0, 3, 4] : [0, 2, 3];
    return matched.includes(i) ? 'matched' : undefined;
  }
  return undefined;
}

const DONE = { playing: 0, selected: 0, correct: 4, wrong: 0, almost: 12, complete: 20 }; const TOTAL = 20;

function GameMatching({ state = 'playing' }) {
  const bar = (
    <MxAppBar node="game-matching/appbar" title="Matching"
      leading={<MxIconButton icon="arrow_back" node="game-matching/back" />}
      trailing={<MxIconButton icon="more_horiz" node="game-matching/options" />} />
  );

  if (state === 'complete') {
    return (
      <MxScaffold node="game-matching/screen" appBar={bar}>
        <window.ProgressHeader done={20} total={20} node="game-matching/progress" />
        <window.EmptyState node="game-matching/complete" icon="celebration" tone="success" title="Round complete!"
          text="You matched 5/5 pairs. Keep the momentum."
          action={<MxButton variant="primary" icon="arrow_forward" node="game-matching/next">Next round</MxButton>} />
      </MxScaffold>
    );
  }

  return (
    <MxScaffold node="game-matching/screen" appBar={bar}>
      <window.ProgressHeader done={DONE[state] || 0} total={TOTAL} node="game-matching/progress" />
      {/* A tight, chunky "game board" (big cards, small 8px gaps) VERTICALLY CENTERED for a
          balanced layout — equal breathing above and below, not jammed to one edge. The wrapper
          fills the remaining body height and reclaims the body's bottom-nav padding (this screen
          has no bottom nav) so the tall cards fit one screen without scrolling. */}
      <div style={{ flex: '1 1 0', minHeight: 0, marginBottom: 'calc(-1 * var(--memox-bottom-nav-height))', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--memox-space-2)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-2)' }}>
            {LEFT.map((t, i) => <Tile key={i} text={t} tone={toneFor(state, 'L', i)} node={'game-matching/left-' + i} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-2)' }}>
            {RIGHT.map((t, i) => <Tile key={i} text={t} tone={toneFor(state, 'R', i)} node={'game-matching/right-' + i} />)}
          </div>
        </div>
      </div>
    </MxScaffold>
  );
}

window.GameMatching = GameMatching;
})();
