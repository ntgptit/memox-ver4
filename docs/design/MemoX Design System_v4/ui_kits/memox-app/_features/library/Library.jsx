/* MemoX — Library. States: loaded · search-active · pair-picker · sort-menu · overflow-menu · play-sheet · new-deck · drawer · empty · loading · error
   Feature-local components: components/{LibraryHeader,ContextBar,PairPickerSheet,SortSheet,OverflowMenuSheet,PlaySheet}.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxBottomNav, MxCard, MxIconButton, MxSearchDock, MxFab, MxButton } = NS;
const LIB = window.MemoXLibrary;
const { LibraryHeader, ContextBar, PairPickerSheet, SortSheet, OverflowMenuSheet, PlaySheet } = LIB;

const NAV = [
  { id: 'home', label: 'Today', icon: 'today' },
  { id: 'library', label: 'Library', icon: 'style' },
  { id: 'add', label: 'Add', icon: 'add_circle' },
  { id: 'stats', label: 'Stats', icon: 'insights' },
  { id: 'me', label: 'Profile', icon: 'person' },
];

const TREE = [
  { icon: 'stacks', tone: 'accent', name: 'Korean Basics', meta: '3 decks · 412 words', due: 28, progress: 64 },
  { icon: 'stacks', tone: null, name: 'TOPIK Prep', meta: '5 decks · 980 words', due: 120, progress: 42 },
  { icon: 'style', tone: 'success', name: 'TOPIK I — Vocabulary', meta: '320 words · 48 due', due: 48, progress: 72 },
  { icon: 'style', tone: 'warning', name: 'Irregular Verbs', meta: '64 words · 41 hidden', due: 12, progress: 38 },
  { icon: 'style', tone: null, name: 'Daily Conversation', meta: '150 words · mastered', due: 0, progress: 100 },
];

// Edge-data fixtures (contract step 6-7): minimum, dense, and long-text.
const MIN = [TREE[0]];
const DENSE = Array.from({ length: 12 }, (_, i) => ({ ...TREE[i % TREE.length], name: TREE[i % TREE.length].name + (i >= TREE.length ? ' ' + (Math.floor(i / TREE.length) + 1) : '') }));
const LONG = [
  { icon: 'style', tone: 'accent', name: 'TOPIK II — Advanced Vocabulary & Idiomatic Expressions, Hanja Roots and Formal Register (2024 Workbook)', meta: '1,280 words · 340 due · shared with study group · last reviewed Tuesday', due: 340, progress: 57 },
  ...TREE.slice(1),
];

function Tree({ decks = TREE }) {
  return decks.map((d, i) => (
    <MxCard key={i} padding="sm" interactive node={'library/node-' + i}><window.DeckRow {...d} /></MxCard>
  ));
}

function base(decks) {
  return (
    <MxScaffold node="library/screen" appBar={<LibraryHeader />} bottomNav={<MxBottomNav items={NAV} value="library" node="shell/bottom-nav" />} fab={<MxFab icon="add" label="New" node="library/create" />}>
      <ContextBar />
      <Tree decks={decks} />
    </MxScaffold>
  );
}

function overlay(sheet, align) {
  return <React.Fragment>{base()}<window.Scrim align={align} node="library/scrim">{sheet}</window.Scrim></React.Fragment>;
}

function Library({ state = 'loaded' }) {
  const nav = <MxBottomNav items={NAV} value="library" node="shell/bottom-nav" />;

  if (state === 'loading') {
    const S = window.Skeleton;
    return (
      <MxScaffold node="library/screen" appBar={<LibraryHeader />} bottomNav={nav}>
        <S h={48} r={999} />
        {[0, 1, 2, 3].map((i) => (
          <MxCard key={i} padding="sm"><div style={{ display: 'flex', gap: 'var(--memox-space-4)', alignItems: 'center' }}><S w={48} h={48} r={16} /><div style={{ flex: 1 }}><S w="55%" h={14} /><S w="38%" h={10} style={{ marginTop: 'var(--memox-space-2)' }} /></div></div></MxCard>
        ))}
      </MxScaffold>
    );
  }

  if (state === 'empty') {
    return (
      <MxScaffold node="library/screen" appBar={<LibraryHeader />} bottomNav={nav}>
        <ContextBar />
        <window.EmptyState node="library/empty" icon="style" title="Your library is empty"
          text="Decks and words you add will show up here. Start with a deck or import a CSV."
          action={<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)', width: 'var(--memox-size-3xl)' }}>
            <MxButton variant="primary" icon="style" block node="library/empty-deck">Create deck</MxButton>
            <MxButton variant="ghost" icon="add" block node="library/empty-add">Add words</MxButton>
          </div>} />
      </MxScaffold>
    );
  }

  if (state === 'error') {
    return (
      <MxScaffold node="library/screen" appBar={<LibraryHeader />} bottomNav={nav}>
        <window.EmptyState node="library/error" icon="cloud_off" tone="error" title="Couldn't load your library"
          text="Something went wrong loading data. Check your connection and try again."
          action={<MxButton variant="primary" icon="refresh" node="library/retry">Retry</MxButton>} />
      </MxScaffold>
    );
  }

  if (state === 'search-active') {
    return (
      <MxScaffold node="library/screen" appBar={<LibraryHeader />} bottomNav={nav}>
        <MxSearchDock focused placeholder="Search by word or meaning" node="library/search-dock"
          trailing={<MxIconButton icon="close" size="sm" node="library/search-clear" />} />
        <window.SectionLabel>RECENT</window.SectionLabel>
        <MxCard padding="sm">
          {['안녕하세요', '학교', '공부하다'].map((r, i) => (
            <window.ListRow key={r} icon="history" title={r} last={i === 2} node={'library/recent-' + i} />
          ))}
        </MxCard>
      </MxScaffold>
    );
  }

  if (state === 'pair-picker') {
    return overlay(<PairPickerSheet />);
  }

  if (state === 'sort-menu') {
    return overlay(<SortSheet />);
  }

  if (state === 'overflow-menu') {
    return overlay(<OverflowMenuSheet />);
  }

  if (state === 'play-sheet') {
    return overlay(<PlaySheet />);
  }

  if (state === 'new-deck') {
    return (
      <React.Fragment>{base()}
        <window.Scrim align="center" node="library/create-scrim">
          <window.Dialog icon="stacks" title="New deck" node="library/create-dialog"
            text={<window.DialogInput label="Deck name" placeholder="e.g. Korean Basics" />}
            actions={<React.Fragment>
              <div style={{ flex: 1 }} />
              <MxButton variant="ghost" node="library/create-cancel">Cancel</MxButton>
              <MxButton variant="primary" node="library/create-ok">Create</MxButton>
            </React.Fragment>} />
        </window.Scrim>
      </React.Fragment>
    );
  }

  if (state === 'drawer') {
    return <React.Fragment>{base()}<window.Drawer state="open" /></React.Fragment>;
  }

  if (state === 'min-data') return base(MIN);
  if (state === 'dense-data') return base(DENSE);
  if (state === 'long-text') return base(LONG);

  return base();
}

window.Library = Library;
})();
