/* MemoX — Contextual App Bar reference. Demonstrates the shared MxContextualAppBar in
   real screen compositions across every variant + state. Not an app destination — a
   component gallery screen proving the shared bar works in context.
   States: root-top · root-scrolled · root-unread · root-long · root-large · root-standard
   · nested · nested-overflow · search · selection · focused */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxContextualAppBar, MxBottomNav, MxIconButton, MxAvatar, MxCard } = NS;

const NAV = [
  { id: 'home', label: 'Today', icon: 'today' },
  { id: 'library', label: 'Library', icon: 'style' },
  { id: 'stats', label: 'Stats', icon: 'insights' },
  { id: 'me', label: 'Profile', icon: 'person' },
];

// A little placeholder body so the bar is shown IN composition, not isolated.
function Body({ heading, sub }) {
  return (
    <React.Fragment>
      {heading ? <div style={{ fontSize: 'var(--memox-font-size-2xl)', fontWeight: 'var(--memox-font-weight-extrabold)', letterSpacing: 'var(--memox-letter-spacing-tight)' }}>{heading}</div> : null}
      {sub ? <div style={{ fontSize: 'var(--memox-font-size-base)', color: 'var(--memox-text-secondary)' }}>{sub}</div> : null}
      {[0, 1, 2].map((i) => <MxCard key={i} padding="sm"><div style={{ height: 'var(--memox-size-md, 44px)' }} /></MxCard>)}
    </React.Fragment>
  );
}

const AV = <MxAvatar name="Linh Tran" size="sm" />;
const nav = <MxBottomNav items={NAV} value="home" node="shell/bottom-nav" />;

function AppBar({ state = 'root-top' }) {
  // Root contextual — at top vs scrolled (the two required visual states).
  if (state === 'root-top' || state === 'root-scrolled' || state === 'root-unread' || state === 'root-long' || state === 'root-large') {
    const collapsed = state === 'root-scrolled';
    const ctx = state === 'root-long' ? 'Wednesday · 30 September · week 39' : 'Saturday · 27 Jun';
    const bar = (
      <MxContextualAppBar variant="root-contextual" collapsed={collapsed} node="app-bar/root"
        context={ctx} title="Today"
        notification={state === 'root-unread' ? { count: 3 } : { dot: true }}
        avatar={AV} />
    );
    return (
      <MxScaffold node="app-bar/screen" appBar={bar} bottomNav={nav}>
        <Body heading={collapsed ? null : 'Good evening, Linh'} sub={collapsed ? null : 'Continue studying'} />
      </MxScaffold>
    );
  }

  if (state === 'root-standard') {
    const bar = (
      <MxContextualAppBar variant="root-standard" node="app-bar/std" title="Library"
        actions={<MxIconButton icon="search" size="sm" node="app-bar/search-open" ariaLabel="Search" />}
        avatar={AV} />
    );
    return <MxScaffold node="app-bar/screen" appBar={bar} bottomNav={nav}><Body sub="Your decks and subdecks" /></MxScaffold>;
  }

  if (state === 'nested' || state === 'nested-overflow') {
    const long = state === 'nested-overflow';
    const bar = (
      <MxContextualAppBar variant="nested" node="app-bar/nested"
        title={long ? 'TOPIK II — Advanced Vocabulary Workbook' : 'Korean Basics'}
        actions={<React.Fragment>
          <MxIconButton icon="search" size="sm" node="app-bar/n-search" ariaLabel="Search in deck" />
          <MxIconButton icon="more_vert" size="sm" node="app-bar/n-more" ariaLabel="More options" />
        </React.Fragment>} />
    );
    return <MxScaffold node="app-bar/screen" appBar={bar}><Body sub="Deck detail content" /></MxScaffold>;
  }

  if (state === 'search') {
    const bar = (
      <MxContextualAppBar variant="search" node="app-bar/search"
        search={{ value: '', placeholder: 'Search decks and cards' }}
        actions={<MxIconButton icon="close" size="sm" node="app-bar/s-clear" ariaLabel="Clear search" />} />
    );
    return <MxScaffold node="app-bar/screen" appBar={bar}><Body sub="Recent searches" /></MxScaffold>;
  }

  if (state === 'selection') {
    const bar = (
      <MxContextualAppBar variant="selection" node="app-bar/select" count={3}
        actions={<React.Fragment>
          <MxIconButton icon="select_all" size="sm" node="app-bar/sel-all" ariaLabel="Select all" />
          <MxIconButton icon="more_vert" size="sm" node="app-bar/sel-more" ariaLabel="More actions" />
        </React.Fragment>} />
    );
    return <MxScaffold node="app-bar/screen" appBar={bar}><Body sub="3 of 12 cards selected" /></MxScaffold>;
  }

  // focused
  const bar = (
    <MxContextualAppBar variant="focused" node="app-bar/focused" title="Card 7 of 20"
      leading={<MxIconButton icon="close" size="sm" node="app-bar/f-close" ariaLabel="Exit session" />} />
  );
  return <MxScaffold node="app-bar/screen" appBar={bar}><Body sub="Study session in progress" /></MxScaffold>;
}

window.AppBar = AppBar;
})();

export const AppBar = window.AppBar;
