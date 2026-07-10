/* MemoX — Library. Domain: Library › Deck › Subdeck › Card (NO folders).
   13 states: loaded · dense · deck-detail · empty-library · empty-deck · search-active ·
   search-results · search-no-results · filter-applied · filter-sheet · selection ·
   loading · offline. Reuses Dashboard's design language + shared chrome
   (MxContextualAppBar, MxBottomNav, MxFab + create sheet, Scrim/Sheet, EmptyState). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxContextualAppBar, MxBottomNav, MxCard, MxBadge, MxIconTile, MxIconButton, MxFab, MxButton, MxChip, MxLink } = NS;
const { ProgressBar, Ring, Scrim, Sheet, MenuItem, SectionLabel, EmptyState, Skeleton, Note } = window;

const NAV = [
  { id: 'home', label: 'Today', icon: 'today' },
  { id: 'library', label: 'Library', icon: 'style' },
  { id: 'stats', label: 'Stats', icon: 'insights' },
  { id: 'me', label: 'Profile', icon: 'person' },
];
const AV = <NS.MxAvatar name="Linh Tran" size="sm" />;

/* ---- fixtures (deck = top level; some have subdecks) ------------------------------- */
const DECKS = [
  { icon: 'translate', tone: 'accent', name: 'Korean TOPIK I', cards: 486, due: 48, subdecks: 5, progress: 64 },
  { icon: 'menu_book', tone: 'accent', name: 'Basic Grammar', cards: 180, new: 23, subdecks: 0, progress: 40 },
  { icon: 'record_voice_over', tone: 'accent', name: 'Daily Conversation', cards: 150, upToDate: true, subdecks: 3, progress: 100 },
  { icon: 'history_edu', tone: 'accent', name: 'Hanja Roots', cards: 320, due: 12, subdecks: 0, progress: 72 },
  { icon: 'travel_explore', tone: 'accent', name: 'Travel Phrases', cards: 96, new: 8, subdecks: 2, progress: 30 },
  { icon: 'work', tone: 'accent', name: 'Business Korean', cards: 210, upToDate: true, subdecks: 0, progress: 100 },
];
const DENSE = Array.from({ length: 22 }, (_, i) => {
  const b = DECKS[i % DECKS.length];
  return {
    ...b,
    name: i < 2 ? 'Advanced Idiomatic Expressions & Formal Register Workbook' : b.name + (i >= DECKS.length ? ' · set ' + (i - DECKS.length + 2) : ''),
    cards: i === 1 ? 1280 : b.cards, due: i === 0 ? 128 : b.due,
  };
});
const SUBDECKS = [
  { name: 'Greetings & introductions', cards: 42, due: 8, progress: 82 },
  { name: 'Numbers & counting', cards: 55, upToDate: true, progress: 100 },
  { name: 'Family & relationships', cards: 38, new: 6, progress: 24 },
  { name: 'Food & dining', cards: 47, due: 15, progress: 51 },
  { name: 'Directions & transport', cards: 35, upToDate: true, progress: 100 },
];

/* ---- status helpers --------------------------------------------------------------- */
function Status({ d }) {
  if (d.due > 0) return <span style={{ color: 'var(--memox-on-warning-soft)', fontWeight: 'var(--memox-font-weight-semibold)' }}>{d.due > 99 ? '99+' : d.due} due</span>;
  if (d.new > 0) return <span style={{ color: 'var(--memox-accent)', fontWeight: 'var(--memox-font-weight-semibold)' }}>{d.new} new</span>;
  return <span style={{ color: 'var(--memox-on-success-soft)', fontWeight: 'var(--memox-font-weight-semibold)' }}>Up to date</span>;
}
function deckMeta(d) {
  // Exactly TWO metadata groups, consistent across every card (§7): card count · status.
  // Status (due/new/up-to-date) is priority #1, card count #2; subdeck count is #3 and
  // lives on the deck-detail screen, not the card, so the row never wraps or restructures.
  return <span style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{d.cards.toLocaleString()} cards · <Status d={d} /></span>;
}

/* ---- Deck card: [visual] [title / count·status] [quick study] --------------------- */
function DeckCard({ d, index, selected, showSub }) {
  return (
    <MxCard padding="sm" interactive variant={selected ? 'primary-soft' : undefined} node={'library/deck-' + index}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-4)', minWidth: 0 }}>
        {selected != null
          ? <span className="material-symbols-rounded" style={{ fontSize: 'var(--memox-icon-size-lg)', color: selected ? 'var(--memox-accent)' : 'var(--memox-text-tertiary)' }}>{selected ? 'check_circle' : 'radio_button_unchecked'}</span>
          : <MxIconTile icon={d.icon} tone={d.tone} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 'var(--memox-font-weight-bold)', fontSize: 'var(--memox-font-size-base)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
          <div style={{ marginTop: 'var(--memox-space-1)' }}>{deckMeta(d)}</div>
        </div>
        {selected == null ? <MxIconButton icon="bolt" size="sm" node={'library/study-' + index} ariaLabel={'Study ' + d.name} /> : null}
      </div>
    </MxCard>
  );
}

/* ---- Subdeck card: [progress ring] [title / count·status] [quick study] ----------- */
function SubdeckCard({ s, index, selected }) {
  return (
    <MxCard padding="sm" interactive variant={selected ? 'primary-soft' : undefined} node={'library/subdeck-' + index}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-4)', minWidth: 0 }}>
        {selected != null
          ? <span className="material-symbols-rounded" style={{ fontSize: 'var(--memox-icon-size-lg)', color: selected ? 'var(--memox-accent)' : 'var(--memox-text-tertiary)' }}>{selected ? 'check_circle' : 'radio_button_unchecked'}</span>
          : <div style={{ flexShrink: 0 }}><Ring pct={s.progress} size={40}><span style={{ fontSize: 'var(--memox-font-size-xs)', fontWeight: 'var(--memox-font-weight-bold)' }}>{s.progress}</span></Ring></div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 'var(--memox-font-weight-semibold)', fontSize: 'var(--memox-font-size-base)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
          <div style={{ marginTop: 'var(--memox-space-1)', fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)' }}>{s.cards} cards · <Status d={s} /></div>
        </div>
        {selected == null ? <MxIconButton icon="bolt" size="sm" node={'library/sub-study-' + index} ariaLabel={'Study ' + s.name} /> : null}
      </div>
    </MxCard>
  );
}

/* ---- filter/sort control row (compact: scope · filters · sort) -------------------- */
function FilterRow({ active }) {
  return (
    <div data-mx-node="library/controls" style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-2)' }}>
      <MxChip label="All decks" node="library/scope" />
      <div style={{ flex: 1 }} />
      <MxChip label={active ? 'Filters · 2' : 'Filters'} icon="tune" selected={active} node="library/filters" />
      <MxChip label="A–Z" icon="swap_vert" node="library/sort" />
    </div>
  );
}

function CreateSheet({ deck }) {
  return (
    <Scrim align="end" node="library/create-scrim">
      <Sheet title="Create" node="library/create-sheet">
        <MenuItem icon="note_add" label="Add card" node="library/create-card" />
        {deck
          ? <MenuItem icon="library_add" label="Create subdeck" node="library/create-subdeck" />
          : <MenuItem icon="stacks" label="Create deck" node="library/create-deck" />}
        <div style={{ height: 'var(--memox-stroke-hairline)', background: 'var(--memox-divider)', margin: 'var(--memox-space-2)' }} />
        <MenuItem icon="upload_file" label={deck ? 'Import into this deck' : 'Import cards'} node="library/create-import" />
      </Sheet>
    </Scrim>
  );
}

function Library({ state = 'loaded' }) {
  const nav = <MxBottomNav items={NAV} value="library" node="shell/bottom-nav" />;
  const fab = <MxFab icon="add" node="library/create" ariaLabel="Create" />;
  const rootBar = (
    <MxContextualAppBar variant="root-contextual" node="library/appbar"
      context="12 decks · 48 due" title="Library"
      actions={<MxIconButton icon="search" size="sm" node="library/search-open" ariaLabel="Search" />}
      avatar={AV} />
  );

  /* LIB-12 loading */
  if (state === 'loading') {
    return (
      <MxScaffold node="library/screen" appBar={rootBar} bottomNav={nav}>
        <Skeleton h={40} r={999} />
        {[0, 1, 2, 3, 4].map((i) => (
          <MxCard key={i} padding="sm"><div style={{ display: 'flex', gap: 'var(--memox-space-4)', alignItems: 'center' }}><Skeleton w={48} h={48} r={16} /><div style={{ flex: 1 }}><Skeleton w="60%" h={14} /><Skeleton w="40%" h={10} style={{ marginTop: 'var(--memox-space-2)' }} /></div></div></MxCard>
        ))}
      </MxScaffold>
    );
  }

  /* LIB-04 empty library */
  if (state === 'empty') {
    return (
      <MxScaffold node="library/screen" appBar={rootBar} bottomNav={nav}>
        <EmptyState node="library/empty" icon="style" title="Build your learning library"
          text="Create a deck or import cards to get started."
          action={<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)', width: 'var(--memox-size-3xl)' }}>
            <MxButton variant="primary" icon="stacks" block node="library/empty-create">Create deck</MxButton>
            <MxButton variant="secondary" icon="upload_file" block node="library/empty-import">Import cards</MxButton>
          </div>} />
      </MxScaffold>
    );
  }

  /* LIB-13 offline / partial error — local data still usable */
  if (state === 'offline') {
    return (
      <MxScaffold node="library/screen" appBar={rootBar} bottomNav={nav} fab={fab}>
        <div data-mx-node="library/offline-banner" style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-3)', padding: 'var(--memox-space-3) var(--memox-space-4)', borderRadius: 'var(--memox-radius-card)', background: 'var(--memox-warning-soft)', color: 'var(--memox-on-warning-soft)' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 'var(--memox-icon-size-md)' }}>cloud_off</span>
          <div style={{ flex: 1, fontSize: 'var(--memox-font-size-sm)' }}>Offline · showing saved data. Last synced 2 hours ago.</div>
          <MxLink size="sm" trailingIcon={null} node="library/offline-retry">Retry</MxLink>
        </div>
        <FilterRow />
        {DECKS.map((d, i) => <DeckCard key={i} d={d} index={i} />)}
      </MxScaffold>
    );
  }

  /* LIB-06/07/08 search */
  if (state === 'search-active' || state === 'search-results' || state === 'search-no-results') {
    const q = state === 'search-active' ? 'korea' : state === 'search-results' ? 'korean' : 'business Korean';
    const bar = (
      <MxContextualAppBar variant="search" node="library/appbar"
        search={{ value: q, placeholder: 'Search decks and subdecks' }}
        actions={<MxIconButton icon="close" size="sm" node="library/search-clear" ariaLabel="Clear search" />} />
    );
    let body;
    if (state === 'search-active') {
      body = <React.Fragment><SectionLabel>RECENT</SectionLabel>{['korean topik', 'grammar', 'hanja'].map((r, i) => <MxCard key={i} padding="sm" interactive node={'library/recent-' + i}><div style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-3)' }}><span className="material-symbols-rounded" style={{ color: 'var(--memox-text-secondary)' }}>history</span><span>{r}</span></div></MxCard>)}</React.Fragment>;
    } else if (state === 'search-no-results') {
      body = <EmptyState node="library/no-results" icon="search_off" tone="warning" title={'No results for “business Korean”'} text="Try another keyword or clear your filters." action={<MxButton variant="secondary" icon="close" node="library/clear-search">Clear search</MxButton>} />;
    } else {
      body = (
        <React.Fragment>
          <div style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)' }}>4 results for “korean”</div>
          <SectionLabel>DECKS</SectionLabel>
          <DeckCard d={DECKS[0]} index={0} />
          <SectionLabel>SUBDECKS</SectionLabel>
          {[SUBDECKS[0], SUBDECKS[2]].map((s, i) => (
            <MxCard key={i} padding="sm" interactive node={'library/sr-sub-' + i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-4)' }}>
                <div style={{ flexShrink: 0 }}><Ring pct={s.progress} size={40}><span style={{ fontSize: 'var(--memox-font-size-xs)', fontWeight: 'var(--memox-font-weight-bold)' }}>{s.progress}</span></Ring></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 'var(--memox-font-weight-semibold)', fontSize: 'var(--memox-font-size-base)' }}>{s.name}</div>
                  {/* subdeck result shows its PARENT deck */}
                  <div style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)' }}>in Korean TOPIK I · {s.cards} cards</div>
                </div>
                <MxIconButton icon="bolt" size="sm" node={'library/sr-study-' + i} ariaLabel="Study" />
              </div>
            </MxCard>
          ))}
        </React.Fragment>
      );
    }
    return <MxScaffold node="library/screen" appBar={bar}>{body}</MxScaffold>;
  }

  /* LIB-11 selection (root: decks only) */
  if (state === 'selection') {
    const bar = (
      <MxContextualAppBar variant="selection" node="library/appbar" count={3}
        actions={<React.Fragment>
          <MxIconButton icon="select_all" size="sm" node="library/sel-all" ariaLabel="Select all" />
          <MxIconButton icon="more_vert" size="sm" node="library/sel-more" ariaLabel="More actions" />
        </React.Fragment>} />
    );
    const sel = [true, false, true, true, false, false];
    return (
      <MxScaffold node="library/screen" appBar={bar} bottomNav={nav}>
        {DECKS.map((d, i) => <DeckCard key={i} d={d} index={i} selected={sel[i]} />)}
      </MxScaffold>
    );
  }

  /* LIB-03 / LIB-05 deck detail (nested; shows subdecks) */
  if (state === 'deck-detail' || state === 'empty-deck') {
    const bar = (
      <MxContextualAppBar variant="nested" node="library/appbar" title="Korean TOPIK I"
        actions={<MxIconButton icon="more_vert" size="sm" node="library/deck-more" ariaLabel="Manage deck" />} />
    );
    const deckFab = <MxFab icon="add" node="library/deck-create" ariaLabel="Create" />;
    if (state === 'empty-deck') {
      return (
        <MxScaffold node="library/screen" appBar={bar} fab={deckFab}>
          <EmptyState node="library/empty-deck" icon="style" title="No subdecks yet"
            text="Create a subdeck to organize this deck, or add cards directly."
            action={<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)', width: 'var(--memox-size-3xl)' }}>
              <MxButton variant="primary" icon="library_add" block node="library/ed-subdeck">Create subdeck</MxButton>
              <MxButton variant="secondary" icon="note_add" block node="library/ed-card">Add card</MxButton>
            </div>} />
        </MxScaffold>
      );
    }
    return (
      <MxScaffold node="library/screen" appBar={bar} fab={deckFab}>
        <div style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)' }}>5 subdecks · 217 cards · 48 due</div>
        <SectionLabel>SUBDECKS</SectionLabel>
        {SUBDECKS.map((s, i) => <SubdeckCard key={i} s={s} index={i} />)}
      </MxScaffold>
    );
  }

  /* LIB-09 filter applied */
  if (state === 'filter-applied') {
    const matched = DECKS.filter((d) => d.due > 0);
    return (
      <MxScaffold node="library/screen" appBar={rootBar} bottomNav={nav} fab={fab}>
        <FilterRow active />
        <div data-mx-node="library/filter-summary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)' }}>{matched.length} decks match · Due only</span>
          <MxLink size="sm" trailingIcon={null} node="library/clear-filters">Clear all</MxLink>
        </div>
        {matched.map((d, i) => <DeckCard key={i} d={d} index={i} />)}
      </MxScaffold>
    );
  }

  /* LIB-10 filter/sort sheet */
  if (state === 'filter-sheet') {
    const item = (icon, label, sel, n) => <MenuItem icon={icon} label={label} selected={sel} node={'library/fs-' + n} />;
    return (
      <React.Fragment>
        <MxScaffold node="library/screen" appBar={rootBar} bottomNav={nav} fab={fab}><FilterRow />{DECKS.slice(0, 3).map((d, i) => <DeckCard key={i} d={d} index={i} />)}</MxScaffold>
        <Scrim align="end" node="library/fs-scrim">
          <Sheet title="Sort & filter" node="library/filter-sheet">
            <SectionLabel style={{ margin: '0 0 var(--memox-space-1) var(--memox-space-2)' }}>SORT</SectionLabel>
            {item('history', 'Recently studied', true, 'sort-recent')}
            {item('sort_by_alpha', 'Name A–Z', false, 'sort-name')}
            {item('priority_high', 'Most due', false, 'sort-due')}
            <div style={{ height: 'var(--memox-stroke-hairline)', background: 'var(--memox-divider)', margin: 'var(--memox-space-2)' }} />
            <SectionLabel style={{ margin: '0 0 var(--memox-space-1) var(--memox-space-2)' }}>FILTER</SectionLabel>
            {item('schedule', 'Due cards', true, 'f-due')}
            {item('fiber_new', 'New cards', false, 'f-new')}
            {item('account_tree', 'Has subdecks', false, 'f-sub')}
            <div style={{ display: 'flex', gap: 'var(--memox-space-3)', marginTop: 'var(--memox-space-4)' }}>
              <MxButton variant="ghost" block node="library/fs-reset">Reset</MxButton>
              <MxButton variant="primary" block node="library/fs-apply">Apply</MxButton>
            </div>
          </Sheet>
        </Scrim>
      </React.Fragment>
    );
  }

  /* LIB-01 loaded / LIB-02 dense */
  const decks = state === 'dense' ? DENSE : DECKS;
  return (
    <MxScaffold node="library/screen" appBar={rootBar} bottomNav={nav} fab={fab}>
      <FilterRow />
      {decks.map((d, i) => <DeckCard key={i} d={d} index={i} />)}
    </MxScaffold>
  );
}

window.Library = Library;
})();

export const Library = window.Library;
