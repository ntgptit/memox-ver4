/* MemoX — Review. States: browsing · editing · audio · end
   Feature-local components: components/{MeaningCard,TermCard}.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxAppBar, MxIconButton, MxButton } = NS;
const { MeaningCard, TermCard } = window.MemoXReview;

function Review({ state = 'browsing' }) {
  const editing = state === 'editing';
  const bar = (
    <MxAppBar node="review/appbar" title="Review"
      leading={<MxIconButton icon="arrow_back" node="review/back" />}
      trailing={<React.Fragment>
        <MxIconButton icon="format_size" node="review/text-size" />
        <MxIconButton icon="more_vert" node="review/options" />
      </React.Fragment>} />
  );

  if (state === 'loading') {
    const S = window.Skeleton;
    return (
      <MxScaffold node="review/screen" appBar={bar}>
        <S h={12} r={999} />
        <S h={220} r={20} style={{ marginTop: 'var(--memox-space-4)' }} />
        <S h={260} r={20} style={{ marginTop: 'var(--memox-space-4)' }} />
      </MxScaffold>
    );
  }

  if (state === 'error') {
    return (
      <MxScaffold node="review/screen" appBar={bar}>
        <window.EmptyState node="review/error" icon="cloud_off" tone="error" title="Couldn't load review"
          text="Something went wrong loading your cards. Check your connection and try again."
          action={<MxButton variant="primary" icon="refresh" node="review/retry">Try again</MxButton>} />
      </MxScaffold>
    );
  }

  if (state === 'end') {
    return (
      <MxScaffold node="review/screen" appBar={bar}>
        <window.EmptyState node="review/end" icon="done_all" tone="success" title="All reviewed"
          text="You've gone through every card in this deck."
          action={<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)', width: 'var(--memox-size-3xl)' }}>
            <MxButton variant="primary" icon="school" block node="review/study-now">Study now</MxButton>
            <MxButton variant="ghost" icon="arrow_back" block node="review/back-deck">Back to deck</MxButton>
          </div>} />
      </MxScaffold>
    );
  }

  return (
    <MxScaffold node="review/screen" appBar={bar}>
      <window.ProgressHeader done={7} total={20} node="review/progress" />

      <MeaningCard editing={editing} />

      <TermCard state={state} />

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--memox-space-4)', color: 'var(--memox-text-tertiary)' }}>
        <MxIconButton icon="chevron_left" node="review/prev" />
        <span style={{ fontSize: 'var(--memox-font-size-sm)' }}>Swipe to continue</span>
        <MxIconButton icon="chevron_right" node="review/next" />
      </div>
    </MxScaffold>
  );
}

window.Review = Review;
})();
