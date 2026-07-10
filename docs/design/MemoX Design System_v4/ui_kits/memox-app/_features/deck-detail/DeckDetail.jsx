/* MemoX — Deck detail (tree node: sub-decks + cards). States: loaded · search · no-results · empty · add-menu · new-subdeck · card-actions · delete-confirm · reset-confirm · deck-menu · deck-delete-confirm · move · loading · error
   Feature-local components: components/{DeckHeader,FlashcardRow,SubDeckCard,DeckMenu,DeleteConfirmDialog}.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxCard, MxButton, MxIconButton, MxSearchDock, MxChip, MxFab } = NS;

const FILTERS = ['All', 'New', 'Due', 'Mastered'];

// A deck is a tree node: it may hold sub-decks AND cards at the same time.
const SUBDECKS = [
  { icon: 'stacks', tone: 'accent', name: 'Beginner Grammar', meta: '3 decks · 412 words', due: 28, progress: 64 },
  { icon: 'style', tone: null, name: 'Topic: Family', meta: '180 words · mastered', due: 0, progress: 100 },
];

const CARDS = [
  { term: '안녕하세요', meaning: 'Hello (formal)', status: 'due' },
  { term: '감사합니다', meaning: 'Thank you', status: 'mastered' },
  { term: '사랑', meaning: 'love; affection', status: 'new' },
  { term: '공부하다', meaning: 'to study', status: 'due' },
  { term: '맛있다', meaning: 'delicious (food)', status: 'mastered' },
  { term: '어렵다', meaning: 'difficult, hard', status: 'new', hidden: true },
];

// Edge-data fixtures (contract step 6-7)
const MIN_CARDS = [CARDS[0]];
const DENSE_CARDS = Array.from({ length: 16 }, (_, i) => CARDS[i % CARDS.length]);
const LONG_CARDS = [
  { term: '전화번호부에 등록되지 않은 사람', meaning: 'a person who is not registered in the phone directory; someone whose contact details are unavailable — used when explaining why a call could not be completed', status: 'due' },
  ...CARDS.slice(1),
];

const SectionLabel = window.SectionLabel;

function DeckDetail({ state = 'loaded' }) {
  const { DeckHeader, FlashcardRow, SubDeckCard, DeckMenu, DeleteConfirmDialog } = window.MemoXDeckDetail;
  const fab = <MxFab icon="add" label="Add" node="deck-detail/add" />;

  if (state === 'empty') {
    return (
      <MxScaffold node="deck-detail/screen" appBar={<DeckHeader />}>
        <window.EmptyState node="deck-detail/empty" icon="playing_cards" title="Empty deck"
          text="Add words, import in bulk, or create a sub-deck to organize this topic."
          action={<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)', width: 'var(--memox-size-3xl)' }}>
            <MxButton variant="primary" icon="add" block node="deck-detail/empty-add">Add words</MxButton>
            <MxButton variant="ghost" icon="library_add" block node="deck-detail/empty-subdeck">New sub-deck</MxButton>
            <MxButton variant="ghost" icon="upload_file" block node="deck-detail/empty-import">Import from file</MxButton>
          </div>} />
      </MxScaffold>
    );
  }

  if (state === 'loading') {
    const S = window.Skeleton;
    return (
      <MxScaffold node="deck-detail/screen" appBar={<DeckHeader />}>
        <S h={48} r={999} />
        {[0, 1, 2, 3, 4].map((i) => (
          <MxCard key={i} padding="sm"><div style={{ display: 'flex', gap: 'var(--memox-space-4)', alignItems: 'center' }}><div style={{ flex: 1 }}><S w="40%" h={16} /><S w="62%" h={10} style={{ marginTop: 'var(--memox-space-2)' }} /></div><S w={56} h={22} r={999} /></div></MxCard>
        ))}
      </MxScaffold>
    );
  }

  if (state === 'error') {
    return (
      <MxScaffold node="deck-detail/screen" appBar={<DeckHeader />}>
        <window.EmptyState node="deck-detail/error" icon="cloud_off" tone="error" title="Couldn't load this deck"
          text="Something went wrong. Check your connection and try again."
          action={<MxButton variant="primary" icon="refresh" node="deck-detail/retry">Retry</MxButton>} />
      </MxScaffold>
    );
  }

  if (state === 'search') {
    return (
      <MxScaffold node="deck-detail/screen" appBar={<DeckHeader />}>
        <MxSearchDock value="하" focused node="deck-detail/search-dock"
          trailing={<MxIconButton icon="close" size="sm" node="deck-detail/search-clear" />} />
        <div data-mx-node="deck-detail/filters" style={{ display: 'flex', gap: 'var(--memox-space-2)', overflowX: 'auto', paddingBottom: 'var(--memox-space-1)' }}>
          {FILTERS.map((f, i) => <MxChip key={f} label={f} selected={i === 0} node={'deck-detail/filter-' + i} />)}
        </div>
        {CARDS.filter((c) => c.term.includes('하') || c.meaning.includes('study')).map((c, i) => (
          <MxCard key={i} padding="sm" interactive node={'deck-detail/result-' + i}><FlashcardRow {...c} /></MxCard>
        ))}
      </MxScaffold>
    );
  }

  if (state === 'no-results') {
    return (
      <MxScaffold node="deck-detail/screen" appBar={<DeckHeader />}>
        <MxSearchDock value="xyz" focused node="deck-detail/search-dock"
          trailing={<MxIconButton icon="close" size="sm" node="deck-detail/search-clear" />} />
        <div data-mx-node="deck-detail/filters" style={{ display: 'flex', gap: 'var(--memox-space-2)', overflowX: 'auto', paddingBottom: 'var(--memox-space-1)' }}>
          {FILTERS.map((f, i) => <MxChip key={f} label={f} selected={i === 0} node={'deck-detail/nr-filter-' + i} />)}
        </div>
        <window.EmptyState node="deck-detail/no-results" icon="search_off" tone="warning" title="No cards found"
          text={'Nothing matched “xyz”. Try another term or check the spelling.'} />
      </MxScaffold>
    );
  }

  const cards = state === 'min-data' ? MIN_CARDS : state === 'dense-data' ? DENSE_CARDS : state === 'long-text' ? LONG_CARDS : CARDS;
  const base = (
    <MxScaffold node="deck-detail/screen" appBar={<DeckHeader />} fab={fab}>
      <MxSearchDock placeholder="Search in deck" node="deck-detail/search-dock"
        trailing={<MxIconButton icon="swap_vert" size="sm" node="deck-detail/sort" />} />
      <SectionLabel>SUB-DECKS</SectionLabel>
      {SUBDECKS.map((d, i) => (
        <SubDeckCard key={'s' + i} deck={d} index={i} />
      ))}
      <SectionLabel>CARDS</SectionLabel>
      {cards.map((c, i) => (
        <MxCard key={i} padding="sm" interactive node={'deck-detail/card-' + i}><FlashcardRow {...c} /></MxCard>
      ))}
    </MxScaffold>
  );

  if (state === 'new-subdeck') {
    return (
      <React.Fragment>
        {base}
        <window.Scrim align="center" node="deck-detail/subdeck-scrim">
          <window.Dialog icon="library_add" title="New sub-deck" node="deck-detail/subdeck-dialog"
            text={<window.DialogInput label="Deck name" placeholder="e.g. Irregular Verbs" />}
            actions={<React.Fragment>
              <div style={{ flex: 1 }} />
              <MxButton variant="ghost" node="deck-detail/subdeck-cancel">Cancel</MxButton>
              <MxButton variant="primary" node="deck-detail/subdeck-ok">Create</MxButton>
            </React.Fragment>} />
        </window.Scrim>
      </React.Fragment>
    );
  }

  if (state === 'add-menu') {
    return (
      <React.Fragment>
        {base}
        <window.Scrim node="deck-detail/add-scrim">
          <window.Sheet title="Add to Korean Basics" node="deck-detail/add-sheet">
            <window.MenuItem icon="add" label="Add word" node="deck-detail/add-word" />
            <window.MenuItem icon="library_add" label="New sub-deck" node="deck-detail/add-subdeck" />
            <window.MenuItem icon="upload_file" label="Import cards" node="deck-detail/add-import" />
          </window.Sheet>
        </window.Scrim>
      </React.Fragment>
    );
  }

  if (state === 'card-actions') {
    return (
      <React.Fragment>
        {base}
        <window.Scrim node="deck-detail/actions-scrim">
          <window.Sheet title="안녕하세요" node="deck-detail/actions-sheet">
            <window.MenuItem icon="edit" label="Edit card" node="deck-detail/action-edit" />
            <window.MenuItem icon="visibility_off" label="Hide card" node="deck-detail/action-hide" />
            <window.MenuItem icon="delete" label="Delete card" danger node="deck-detail/action-delete" />
          </window.Sheet>
        </window.Scrim>
      </React.Fragment>
    );
  }

  if (state === 'delete-confirm') {
    return (
      <React.Fragment>
        {base}
        <DeleteConfirmDialog />
      </React.Fragment>
    );
  }

  if (state === 'reset-confirm') {
    return (
      <React.Fragment>
        {base}
        <window.ConfirmDialog align="center" scrimNode="deck-detail/reset-scrim"
          icon="restart_alt" tone="error" title="Reset progress?"
          text="Reset all cards in this deck back to New? Their Leitner box and due dates will be cleared."
          dialogNode="deck-detail/reset-dialog"
          actions={<React.Fragment>
            <MxButton variant="ghost" block node="deck-detail/reset-cancel">Cancel</MxButton>
            <MxButton variant="primary" danger block node="deck-detail/reset-ok">Reset</MxButton>
          </React.Fragment>} />
      </React.Fragment>
    );
  }

  if (state === 'deck-menu') {
    return (
      <React.Fragment>
        {base}
        <DeckMenu />
      </React.Fragment>
    );
  }

  if (state === 'deck-delete-confirm') {
    return (
      <React.Fragment>
        {base}
        <window.ConfirmDialog align="center" scrimNode="deck-detail/deck-delete-scrim"
          icon="delete" tone="error" title="Delete this deck?"
          text="Deleting removes all sub-decks, cards and review state inside. This can't be undone."
          dialogNode="deck-detail/deck-delete-dialog"
          actions={<React.Fragment>
            <MxButton variant="ghost" block node="deck-detail/deck-delete-cancel">Cancel</MxButton>
            <MxButton variant="primary" danger block node="deck-detail/deck-delete-ok">Delete</MxButton>
          </React.Fragment>} />
      </React.Fragment>
    );
  }

  if (state === 'move') {
    const DEST = [
      { icon: 'home', name: 'Library (root)', node: 'deck-detail/move-root' },
      { icon: 'stacks', name: 'TOPIK Prep', node: 'deck-detail/move-1' },
      { icon: 'stacks', name: 'Korean Basics (current)', muted: true, node: 'deck-detail/move-self' },
      { icon: 'style', name: '— Beginner Grammar (sub-deck)', muted: true, node: 'deck-detail/move-child' },
    ];
    return (
      <React.Fragment>
        {base}
        <window.Scrim node="deck-detail/move-scrim">
          <window.Sheet title="Move to" node="deck-detail/move-sheet">
            {DEST.map((d) => (
              <window.ListRow key={d.node} icon={d.icon} title={d.name} muted={d.muted} node={d.node}
                trailing={d.muted ? null : <MxIconButton icon="radio_button_unchecked" node={d.node + '-pick'} />} />
            ))}
            <div style={{ marginTop: 'var(--memox-space-2)' }}><MxButton variant="primary" block node="deck-detail/move-apply">Move</MxButton></div>
          </window.Sheet>
        </window.Scrim>
      </React.Fragment>
    );
  }

  return base;
}

window.DeckDetail = DeckDetail;
})();
