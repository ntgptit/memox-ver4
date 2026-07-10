/* MemoX — Flashcard List. Primary objective: browse, study and manage the flashcards in
   the deepest (final) deck. CARDS ONLY — never a SUBDECKS section, never Create subdeck.
   Nested screen: back + deck title + search + More(→ Deck Settings). Card filters
   (All/New/Due/Mastered). Add-card FAB → opens Flashcard Editor for create/edit.
   Reuses shared StatusCardRow for every card row. */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxContextualAppBar, MxCard, MxIconButton, MxFab, MxButton, MxLink, MxSearchDock, MxChip } = NS;
const { Scrim, Sheet, MenuItem, SectionLabel, EmptyState, Skeleton, ConfirmDialog } = window;

function FlashcardList({ state = 'loaded' }) {
  const FL = window.MemoXFlashcardList;
  const { CARDS, MIN, DENSE, LONG, FILTERS, TRAIL, summary, AddCardSheet } = FL;
  const Breadcrumb = window.Breadcrumb;
  const MxList = NS.MxList; // the shared 12px-gap card list — same spacing as decks

  const fab = <MxFab icon="add" node="flashcard-list/add" ariaLabel="Add card" />;
  const nestedBar = (
    <MxContextualAppBar variant="nested" node="flashcard-list/appbar" title="Numbers & counting"
      actions={<React.Fragment>
        <MxIconButton icon="search" size="sm" node="flashcard-list/search-open" ariaLabel="Search cards" />
        <MxIconButton icon="more_vert" size="sm" node="flashcard-list/more" ariaLabel="Deck settings" />
      </React.Fragment>} />
  );
  // CARDS section label with the study aggregate as a compact muted annotation.
  const cardHead = (arr) => <SectionLabel>CARDS <span style={{ fontWeight: 'var(--memox-font-weight-medium)', letterSpacing: 'normal', color: 'var(--memox-text-tertiary)' }}>· {summary(arr)}</span></SectionLabel>;
  const filterRow = (sel) => (
    <div data-mx-node="flashcard-list/filters" style={{ display: 'flex', gap: 'var(--memox-space-2)', overflowX: 'auto', paddingBottom: 'var(--memox-space-1)' }}>
      {FILTERS.map((f, i) => <MxChip key={f} label={f} selected={i === sel} node={'flashcard-list/filter-' + i} />)}
    </div>
  );
  const crumbs = <Breadcrumb items={TRAIL} node="flashcard-list/breadcrumb" />;
  const cardRow = (c, i) => <MxCard key={i} padding="sm" interactive node={'flashcard-list/card-' + i}><window.StatusCardRow {...c} tightTerm clampMeaning /></MxCard>;
  const cardList = (arr) => <MxList>{arr.map((c, i) => cardRow(c, i))}</MxList>;

  /* loading */
  if (state === 'loading') {
    return (
      <MxScaffold node="flashcard-list/screen" appBar={nestedBar} fab={fab}>
        <Skeleton h={44} r={999} />
        {[0, 1, 2, 3, 4].map((i) => <MxCard key={i} padding="sm"><div style={{ display: 'flex', gap: 'var(--memox-space-4)', alignItems: 'center' }}><div style={{ flex: 1 }}><Skeleton w="45%" h={16} /><Skeleton w="65%" h={10} style={{ marginTop: 'var(--memox-space-2)' }} /></div><Skeleton w={56} h={22} r={999} /></div></MxCard>)}
      </MxScaffold>
    );
  }

  /* empty — final deck with no cards yet */
  if (state === 'empty') {
    return (
      <MxScaffold node="flashcard-list/screen" appBar={nestedBar} fab={fab}>
        <EmptyState node="flashcard-list/empty" icon="playing_cards" title="No cards yet"
          text="Add your first card or import a set to start studying this deck."
          action={<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)', width: 'var(--memox-size-3xl)' }}>
            <MxButton variant="primary" icon="note_add" block node="flashcard-list/empty-add">Add card</MxButton>
            <MxButton variant="secondary" icon="upload_file" block node="flashcard-list/empty-import">Import cards</MxButton>
          </div>} />
      </MxScaffold>
    );
  }

  /* offline / error */
  if (state === 'offline') {
    return (
      <MxScaffold node="flashcard-list/screen" appBar={nestedBar} fab={fab}>
        {crumbs}
        <div data-mx-node="flashcard-list/offline-banner" style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-3)', padding: 'var(--memox-space-3) var(--memox-space-4)', borderRadius: 'var(--memox-radius-card)', background: 'var(--memox-warning-soft)', color: 'var(--memox-on-warning-soft)' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 'var(--memox-icon-size-md)' }}>cloud_off</span>
          <div style={{ flex: 1, fontSize: 'var(--memox-font-size-sm)' }}>Offline · showing saved cards. Last synced 2 hours ago.</div>
          <MxLink size="sm" trailingIcon={null} node="flashcard-list/offline-retry">Retry</MxLink>
        </div>
        {filterRow(0)}{cardHead(CARDS)}{cardList(CARDS)}
      </MxScaffold>
    );
  }
  if (state === 'error') {
    return (
      <MxScaffold node="flashcard-list/screen" appBar={nestedBar}>
        <EmptyState node="flashcard-list/error" icon="cloud_off" tone="error" title="Couldn't load cards"
          text="Something went wrong. Check your connection and try again."
          action={<MxButton variant="primary" icon="refresh" node="flashcard-list/retry">Retry</MxButton>} />
      </MxScaffold>
    );
  }

  /* search / no-results — CARDS only, placeholder "Search cards" */
  if (state === 'search' || state === 'no-results') {
    const q = state === 'search' ? '하' : 'zzz';
    const bar = (
      <MxContextualAppBar variant="search" node="flashcard-list/appbar"
        search={{ value: q, placeholder: 'Search cards' }}
        actions={<MxIconButton icon="close" size="sm" node="flashcard-list/search-clear" ariaLabel="Clear search" />} />
    );
    if (state === 'no-results') {
      return <MxScaffold node="flashcard-list/screen" appBar={bar}>{filterRow(0)}<EmptyState node="flashcard-list/no-results" icon="search_off" tone="warning" title="No cards found" text={'Nothing matched “zzz”. Try another term.'} /></MxScaffold>;
    }
    const hits = CARDS.filter((c) => c.term.includes('하') || c.meaning.includes('study'));
    return <MxScaffold node="flashcard-list/screen" appBar={bar}>{filterRow(0)}<SectionLabel>CARDS</SectionLabel>{cardList(hits)}</MxScaffold>;
  }

  /* filter-applied — Due filter active */
  if (state === 'filter-applied') {
    const due = CARDS.filter((c) => c.status === 'due');
    return (
      <MxScaffold node="flashcard-list/screen" appBar={nestedBar} fab={fab}>
        {crumbs}
        {filterRow(2)}
        <div style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)' }}>{due.length} due cards</div>
        <SectionLabel>CARDS</SectionLabel>{cardList(due)}
      </MxScaffold>
    );
  }

  /* selection — cards only */
  if (state === 'selection') {
    const bar = (
      <MxContextualAppBar variant="selection" node="flashcard-list/appbar" count={2}
        actions={<React.Fragment>
          <MxIconButton icon="select_all" size="sm" node="flashcard-list/sel-all" ariaLabel="Select all" />
          <MxIconButton icon="more_vert" size="sm" node="flashcard-list/sel-more" ariaLabel="More actions" />
        </React.Fragment>} />
    );
    const sel = [true, false, true, false, false, false];
    return (
      <MxScaffold node="flashcard-list/screen" appBar={bar}>
        <SectionLabel>CARDS</SectionLabel>
        <MxList>{CARDS.map((c, i) => (
          <MxCard key={i} padding="sm" interactive variant={sel[i] ? 'primary-soft' : undefined} node={'flashcard-list/sel-card-' + i}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--memox-space-4)' }}>
              <span className="material-symbols-rounded" style={{ flexShrink: 0, fontSize: 'var(--memox-icon-size-lg)', color: sel[i] ? 'var(--memox-accent)' : 'var(--memox-text-tertiary)' }}>{sel[i] ? 'check_circle' : 'radio_button_unchecked'}</span>
              <div style={{ flex: 1, minWidth: 0 }}><window.StatusCardRow {...c} tightTerm clampMeaning /></div>
            </div>
          </MxCard>
        ))}</MxList>
      </MxScaffold>
    );
  }

  const cards = state === 'minimum-data' ? MIN : state === 'dense' ? DENSE : state === 'long-text' ? LONG : CARDS;
  const base = (
    <MxScaffold node="flashcard-list/screen" appBar={nestedBar} fab={fab}>
      {crumbs}
      {filterRow(0)}
      {cardHead(cards)}
      {cardList(cards)}
    </MxScaffold>
  );

  /* add-sheet — card-only create */
  if (state === 'add-sheet') return <React.Fragment>{base}<AddCardSheet /></React.Fragment>;

  /* card-actions — a single card's action sheet; Edit opens the Flashcard Editor */
  if (state === 'card-actions') {
    return (
      <React.Fragment>{base}
        <Scrim align="end" node="flashcard-list/actions-scrim">
          <Sheet title="안녕하세요" node="flashcard-list/actions-sheet">
            <MenuItem icon="edit" label="Edit card" node="flashcard-list/action-edit" />
            <MenuItem icon="drive_file_move" label="Move card" node="flashcard-list/action-move" />
            <MenuItem icon="visibility_off" label="Hide card" node="flashcard-list/action-hide" />
            <MenuItem icon="delete" label="Delete card" danger node="flashcard-list/action-delete" />
          </Sheet>
        </Scrim>
      </React.Fragment>
    );
  }

  /* delete-confirm — delete a single card */
  if (state === 'delete-confirm') {
    return (
      <React.Fragment>{base}
        <ConfirmDialog align="center" scrimNode="flashcard-list/delete-scrim"
          icon="delete" tone="error" title="Delete this card?"
          text="The card “안녕하세요” will be removed from this deck. This can't be undone."
          dialogNode="flashcard-list/delete-dialog"
          actions={<React.Fragment>
            <MxButton variant="ghost" block node="flashcard-list/delete-cancel">Cancel</MxButton>
            <MxButton variant="primary" danger block node="flashcard-list/delete-ok">Delete</MxButton>
          </React.Fragment>} />
      </React.Fragment>
    );
  }

  return base;
}

window.FlashcardList = FlashcardList;
})();

export const FlashcardList = window.FlashcardList;
