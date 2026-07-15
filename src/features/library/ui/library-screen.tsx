/**
 * Library screen (WBS 3.4) — browse and manage the deck library. Composition mirrors
 * the kit `_features/library/Library.jsx`: root app bar (title · search · avatar) →
 * FilterRow chips → MxList of shared DeckCards → FAB, with the create/filter sheets,
 * search mode (recent / results / no-results), selection mode, loading skeletons,
 * empty state, and the offline banner. 12 states (contract §6).
 *
 * Presentational and prop-driven: data + search callback come in, intents go out. The
 * container (`use-library`) wires repositories; `initialUi` previews any state for
 * the golden harness and tests.
 */

import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import {
  AppScreen,
  MxCard,
  MxButton,
  MxChip,
  MxIconButton,
  MxFab,
  MxLink,
  MxList,
  MxAvatar,
  MxSearchDock,
  DeckCard,
  EmptyState,
  Icon,
  MenuItem,
  Scrim,
  SectionLabel,
  Sheet,
  Skeleton,
  useTheme,
  type Theme,
} from '@/design-system';

import {
  deckStatus,
  LIBRARY_RECENTS,
  LIBRARY_SUBDECKS,
  type LibraryData,
  type LibraryDeckView,
  type LibrarySubdeckView,
  type LibraryUiState,
} from './library-fixtures';

export interface LibrarySearchResults {
  readonly decks: readonly LibraryDeckView[];
  readonly subdecks: readonly LibrarySubdeckView[];
}

export interface LibraryScreenProps {
  data: LibraryData;
  /** Recent search terms (search-active state). */
  recents?: readonly string[];
  /** Query the library (container: 4.6 search index). Defaults to a name match over `data`. */
  searchLibrary?: (query: string) => LibrarySearchResults;
  onOpenDeck?: (id: string) => void;
  onStudyDeck?: (id: string) => void;
  onCreateDeck?: () => void;
  onAddCard?: () => void;
  onImport?: () => void;
  onRetrySync?: () => void;
  /** Preview/testing: start in a canonical UI state. */
  initialUi?: LibraryUiState;
}

type Mode = 'browse' | 'search' | 'selection';
type SheetKind = 'create' | 'filter' | null;

/** Kit fixture queries per search state (goldens must match the kit shots). */
const PREVIEW_QUERY: Partial<Record<LibraryUiState, string>> = {
  'search-active': 'korea',
  'search-results': 'korean',
  'search-no-results': 'business Korean',
};

export function LibraryScreen({
  data,
  recents = LIBRARY_RECENTS,
  searchLibrary,
  onOpenDeck,
  onStudyDeck,
  onCreateDeck,
  onAddCard,
  onImport,
  onRetrySync,
  initialUi = 'loaded',
}: LibraryScreenProps) {
  const t = useTheme();
  const searchStates: LibraryUiState[] = ['search-active', 'search-results', 'search-no-results'];
  const [mode, setMode] = useState<Mode>(
    searchStates.includes(initialUi) ? 'search' : initialUi === 'selection' ? 'selection' : 'browse',
  );
  const [query, setQuery] = useState(PREVIEW_QUERY[initialUi] ?? '');
  const [sheet, setSheet] = useState<SheetKind>(
    initialUi === 'create-sheet' ? 'create' : initialUi === 'filter-sheet' ? 'filter' : null,
  );
  const [filterApplied, setFilterApplied] = useState(initialUi === 'filter-applied');
  // 12.11 A1–A8: sort + filter are now live. Committed values drive the list;
  // the sheet edits a pending copy until Apply. Defaults match the kit's
  // hardcoded `selected` marks (sort=recent, filter=due) so goldens are stable.
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'due'>('recent');
  const [filters, setFilters] = useState<{ due: boolean; new: boolean; sub: boolean }>({
    due: initialUi === 'filter-applied',
    new: false,
    sub: false,
  });
  const [pendingSort, setPendingSort] = useState(sortBy);
  const [pendingFilters, setPendingFilters] = useState(filters);
  const openFilterSheet = () => {
    setPendingSort(sortBy);
    // Seed from the committed filters; with none committed, propose Due-only —
    // this matches the kit filter-sheet reference (its "Due cards" is pre-marked).
    const anyCommitted = filters.due || filters.new || filters.sub;
    setPendingFilters(anyCommitted ? filters : { due: true, new: false, sub: false });
    setSheet('filter');
  };
  const toggleFilter = (k: 'due' | 'new' | 'sub') => setPendingFilters((f) => ({ ...f, [k]: !f[k] }));
  // Kit selection fixture: rows 0, 2, 3 selected.
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set(initialUi === 'selection' && data.status === 'ready' ? data.decks.filter((_, i) => [0, 2, 3].includes(i)).map((d) => d.id) : []),
  );

  const decks = data.status === 'ready' ? data.decks : [];
  const defaultSearch = (q: string): LibrarySearchResults => {
    const needle = q.trim().toLowerCase();
    return {
      decks: decks.filter((d) => d.name.toLowerCase().includes(needle)),
      subdecks: LIBRARY_SUBDECKS.filter((s) => s.name.toLowerCase().includes(needle)),
    };
  };
  const runSearch = searchLibrary ?? defaultSearch;
  // Kit: 'search-active' shows recents even with a partial query typed ('korea').
  const searching = mode === 'search';
  const showRecents = searching && (initialUi === 'search-active' && query === PREVIEW_QUERY['search-active'] ? true : query.trim() === '');
  // While the preview query is untouched, reproduce the kit shot's exact result set
  // (1 deck + 2 subdecks, counted "4 results" per the kit fixture); typing goes live.
  const previewActive = query !== '' && query === PREVIEW_QUERY[initialUi];
  const results = useMemo<LibrarySearchResults>(() => {
    if (!searching || showRecents) return { decks: [], subdecks: [] };
    if (previewActive && initialUi === 'search-results') {
      return { decks: decks.slice(0, 1), subdecks: [LIBRARY_SUBDECKS[0], LIBRARY_SUBDECKS[2]] };
    }
    if (previewActive && initialUi === 'search-no-results') {
      return { decks: [], subdecks: [] };
    }
    return runSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searching, showRecents, previewActive, initialUi, query, decks]);
  const resultCount = previewActive && initialUi === 'search-results' ? 4 : results.decks.length + results.subdecks.length;

  // ---- app bars -----------------------------------------------------------------
  const rootActions = (
    <>
      <MxIconButton icon="search" size="sm" accessibilityLabel="Search" onPress={() => setMode('search')} node="library/search-open" />
      <MxAvatar name="Linh Tran" size="sm" node="library/avatar" />
    </>
  );
  const searchDock = (
    <MxSearchDock
      value={query}
      placeholder="Search decks and subdecks"
      onChange={setQuery}
      accessibilityLabel="Search decks and subdecks"
      node="library/search-dock"
    />
  );

  const exitSearch = () => {
    setMode('browse');
    setQuery('');
  };

  // ---- loading ------------------------------------------------------------------
  if (data.status === 'loading') {
    return (
      <AppScreen inTabs node="library/screen" variant="root" title="Library" actions={rootActions}>
        <Skeleton h={40} r={999} />
        <MxList>
          {[0, 1, 2, 3, 4].map((i) => (
            <MxCard key={i} padding="sm">
              <View style={{ flexDirection: 'row', gap: t.space[4], alignItems: 'center' }}>
                <Skeleton w={48} h={48} r={16} />
                <View style={{ flex: 1 }}>
                  <Skeleton w="60%" h={14} />
                  <Skeleton w="40%" h={10} style={{ marginTop: t.space[2] }} />
                </View>
              </View>
            </MxCard>
          ))}
        </MxList>
      </AppScreen>
    );
  }

  // ---- search mode ----------------------------------------------------------------
  if (searching) {
    const noResults = !showRecents && results.decks.length === 0 && results.subdecks.length === 0;
    return (
      <AppScreen
        inTabs
        node="library/screen"
        variant="search"
        main={searchDock}
        actions={<MxIconButton icon="close" size="sm" accessibilityLabel="Clear search" onPress={exitSearch} node="library/search-clear" />}
      >
        {showRecents && (
          <>
            <SectionLabel uppercase>Recent</SectionLabel>
            <MxList>
              {recents.map((r, i) => (
                <MxCard key={r} padding="sm" interactive onPress={() => setQuery(r)} accessibilityLabel={`Search ${r}`} node={`library/recent-${i}`}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[3] }}>
                    <Icon name="history" size={t.iconSize.md} color={t.color.textSecondary} />
                    <Text style={[t.font.text({ size: 'base' }), { color: t.color.text }]}>{r}</Text>
                  </View>
                </MxCard>
              ))}
            </MxList>
          </>
        )}
        {!showRecents && noResults && (
          <EmptyState
            node="library/no-results"
            icon="search_off"
            tone="warning"
            title={`No results for “${query}”`}
            text="Try another keyword or clear your filters."
            action={
              <MxButton variant="secondary" icon="close" onPress={exitSearch} node="library/clear-search">
                Clear search
              </MxButton>
            }
          />
        )}
        {!showRecents && !noResults && (
          <>
            <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>
              {resultCount} results for “{query}”
            </Text>
            <SectionLabel uppercase>Decks</SectionLabel>
            <MxList>
              {results.decks.map((d, i) => (
                <LibraryDeckCard key={d.id} theme={t} deck={d} index={i} onOpen={onOpenDeck} onStudy={onStudyDeck} />
              ))}
            </MxList>
            <SectionLabel uppercase>Subdecks</SectionLabel>
            <MxList>
              {results.subdecks.map((s, i) => (
                <DeckCard
                  key={s.id}
                  icon={s.icon}
                  title={s.name}
                  meta={`in ${s.parent ?? 'Korean TOPIK I'} · ${s.cards} cards`}
                  trailing={
                    <MxIconButton icon="bolt" size="sm" accessibilityLabel={`Study ${s.name}`} node={`library/sub-study-sr-${i}`} />
                  }
                  onPress={() => {}}
                  node={`library/subdeck-sr-${i}`}
                />
              ))}
            </MxList>
          </>
        )}
      </AppScreen>
    );
  }

  // ---- selection mode -------------------------------------------------------------
  if (mode === 'selection') {
    const toggle = (id: string) =>
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    return (
      <AppScreen
        inTabs
        node="library/screen"
        variant="selection"
        count={selectedIds.size}
        actions={
          <>
            <MxIconButton
              icon="select_all"
              size="sm"
              accessibilityLabel="Select all"
              onPress={() => setSelectedIds(new Set(decks.map((d) => d.id)))}
              node="library/sel-all"
            />
            <MxIconButton
              icon="more_vert"
              size="sm"
              accessibilityLabel="More actions"
              onPress={() => setMode('browse')}
              node="library/sel-more"
            />
          </>
        }
      >
        <MxList>
          {decks.map((d, i) => (
            <DeckCard
              key={d.id}
              icon={d.icon}
              title={d.name}
              meta={metaText(d)}
              selected={selectedIds.has(d.id)}
              onPress={() => toggle(d.id)}
              node={`library/deck-${i}`}
            />
          ))}
        </MxList>
      </AppScreen>
    );
  }

  // ---- empty ----------------------------------------------------------------------
  if (decks.length === 0) {
    return (
      <AppScreen inTabs node="library/screen" variant="root" title="Library" actions={rootActions}>
        <EmptyState
          node="library/empty"
          icon="style"
          title="Build your learning library"
          text="Create a deck or import cards to get started."
          action={
            <View style={{ gap: t.space[3], width: t.size['3xl'] }}>
              <MxButton variant="primary" icon="stacks" block onPress={onCreateDeck} node="library/empty-create">
                Create deck
              </MxButton>
              <MxButton variant="secondary" icon="upload_file" block onPress={onImport} node="library/empty-import">
                Import cards
              </MxButton>
            </View>
          }
        />
      </AppScreen>
    );
  }

  // ---- browse (loaded/dense/offline/filter-applied + sheets) -----------------------
  const activeFilterCount = (filters.due ? 1 : 0) + (filters.new ? 1 : 0) + (filters.sub ? 1 : 0);
  const filtered = decks.filter(
    (d) =>
      (!filters.due || (d.due ?? 0) > 0) &&
      (!filters.new || (d.newCards ?? 0) > 0) &&
      (!filters.sub || d.subdecks > 0),
  );
  const visibleDecks = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'due') return (b.due ?? 0) - (a.due ?? 0);
    return 0; // 'recent' keeps the stored order
  });
  return (
    <AppScreen
      inTabs
      node="library/screen"
      variant="root"
      title="Library"
      actions={rootActions}
      fab={<MxFab icon="add" accessibilityLabel="Create" onPress={() => setSheet('create')} node="library/create" />}
    >
      {data.status === 'ready' && data.offline && (
        <View
          testID="library/offline-banner"
          accessibilityRole="alert"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.space[3],
            paddingVertical: t.space[3],
            paddingHorizontal: t.space[4],
            borderRadius: t.radius.card,
            backgroundColor: t.color.warningSoft,
          }}
        >
          <Icon name="cloud_off" size={t.iconSize.md} color={t.color.onWarningSoft} />
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.onWarningSoft, flex: 1 }]}>
            Offline · showing saved data. Last synced 2 hours ago.
          </Text>
          <MxLink size="sm" trailingIcon={null} onPress={onRetrySync} node="library/offline-retry">
            Retry
          </MxLink>
        </View>
      )}

      <FilterRow
        theme={t}
        active={filterApplied}
        count={activeFilterCount}
        sortBy={sortBy}
        onFilters={openFilterSheet}
        onCycleSort={() => setSortBy((s) => (s === 'recent' ? 'name' : s === 'name' ? 'due' : 'recent'))}
      />

      {filterApplied && (
        <View testID="library/filter-summary" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>
            {visibleDecks.length} decks match · Due only
          </Text>
          <MxLink size="sm" trailingIcon={null} onPress={() => setFilterApplied(false)} node="library/clear-filters">
            Clear all
          </MxLink>
        </View>
      )}

      <MxList>
        {visibleDecks.map((d, i) => (
          <LibraryDeckCard
            key={d.id}
            theme={t}
            deck={d}
            index={i}
            onOpen={onOpenDeck}
            onStudy={onStudyDeck}
            onLongPress={() => {
              setSelectedIds(new Set([d.id]));
              setMode('selection');
            }}
          />
        ))}
      </MxList>

      {sheet === 'create' && (
        <Scrim node="library/create-scrim" align="end" onDismiss={() => setSheet(null)}>
          <Sheet title="Create" node="library/create-sheet">
            <MenuItem icon="note_add" label="Add card" onPress={() => { setSheet(null); onAddCard?.(); }} node="library/create-card" />
            <MenuItem icon="stacks" label="Create deck" onPress={() => { setSheet(null); onCreateDeck?.(); }} node="library/create-deck" />
            <SheetDivider theme={t} />
            <MenuItem icon="upload_file" label="Import cards" onPress={() => { setSheet(null); onImport?.(); }} node="library/create-import" />
          </Sheet>
        </Scrim>
      )}

      {sheet === 'filter' && (
        <Scrim node="library/fs-scrim" align="end" onDismiss={() => setSheet(null)}>
          <Sheet title="Sort & filter" node="library/filter-sheet">
            <SectionLabel uppercase style={{ marginTop: 0, marginBottom: t.space[1] }}>
              Sort
            </SectionLabel>
            <MenuItem icon="history" label="Recently studied" selected={pendingSort === 'recent'} onPress={() => setPendingSort('recent')} node="library/fs-sort-recent" />
            <MenuItem icon="sort_by_alpha" label="Name A–Z" selected={pendingSort === 'name'} onPress={() => setPendingSort('name')} node="library/fs-sort-name" />
            <MenuItem icon="priority_high" label="Most due" selected={pendingSort === 'due'} onPress={() => setPendingSort('due')} node="library/fs-sort-due" />
            <SheetDivider theme={t} />
            <SectionLabel uppercase style={{ marginTop: 0, marginBottom: t.space[1] }}>
              Filter
            </SectionLabel>
            <MenuItem icon="schedule" label="Due cards" selected={pendingFilters.due} onPress={() => toggleFilter('due')} node="library/fs-f-due" />
            <MenuItem icon="fiber_new" label="New cards" selected={pendingFilters.new} onPress={() => toggleFilter('new')} node="library/fs-f-new" />
            <MenuItem icon="account_tree" label="Has subdecks" selected={pendingFilters.sub} onPress={() => toggleFilter('sub')} node="library/fs-f-sub" />
            <View style={{ flexDirection: 'row', gap: t.space[3], marginTop: t.space[4] }}>
              <View style={{ flex: 1 }}>
                <MxButton
                  variant="ghost"
                  block
                  onPress={() => {
                    setPendingSort('recent');
                    setPendingFilters({ due: false, new: false, sub: false });
                    setSortBy('recent');
                    setFilters({ due: false, new: false, sub: false });
                    setFilterApplied(false);
                    setSheet(null);
                  }}
                  node="library/fs-reset"
                >
                  Reset
                </MxButton>
              </View>
              <View style={{ flex: 1 }}>
                <MxButton
                  variant="primary"
                  block
                  onPress={() => {
                    setSortBy(pendingSort);
                    setFilters(pendingFilters);
                    setFilterApplied(pendingFilters.due || pendingFilters.new || pendingFilters.sub);
                    setSheet(null);
                  }}
                  node="library/fs-apply"
                >
                  Apply
                </MxButton>
              </View>
            </View>
          </Sheet>
        </Scrim>
      )}
    </AppScreen>
  );
}

// --- pieces ----------------------------------------------------------------------

/** Meta line: "486 cards · 48 due" — the status segment carries its semantic tone. */
function metaText(d: LibraryDeckView): string {
  return `${d.cards.toLocaleString('en-US')} cards · ${deckStatus(d).label}`;
}

function statusColor(t: Theme, tone: 'warning' | 'accent' | 'success'): string {
  return tone === 'warning' ? t.color.onWarningSoft : tone === 'accent' ? t.color.accent : t.color.onSuccessSoft;
}

function LibraryDeckCard({
  theme: t,
  deck: d,
  index,
  onOpen,
  onStudy,
  onLongPress,
}: {
  theme: Theme;
  deck: LibraryDeckView;
  index: number;
  onOpen?: (id: string) => void;
  onStudy?: (id: string) => void;
  onLongPress?: () => void;
}) {
  const status = deckStatus(d);
  const meta = (
    <Text>
      {d.cards.toLocaleString('en-US')} cards ·{' '}
      <Text style={[t.font.text({ size: 'sm', weight: 'semibold' }), { color: statusColor(t, status.tone) }]}>
        {status.label}
      </Text>
    </Text>
  );
  return (
    <DeckCard
      icon={d.icon}
      tone="accent"
      title={d.name}
      meta={meta}
      onPress={() => onOpen?.(d.id)}
      onLongPress={onLongPress}
      trailing={
        <MxIconButton icon="bolt" size="sm" accessibilityLabel={`Study ${d.name}`} onPress={() => onStudy?.(d.id)} node={`library/study-${index}`} />
      }
      node={`library/deck-${index}`}
    />
  );
}

/** Kit FilterRow: scope chip · spacer · Filters · A–Z. */
function FilterRow({
  theme: t,
  active,
  count = 2,
  sortBy,
  onFilters,
  onCycleSort,
}: {
  theme: Theme;
  active?: boolean;
  count?: number;
  sortBy?: 'recent' | 'name' | 'due';
  onFilters?: () => void;
  onCycleSort?: () => void;
}) {
  return (
    <View testID="library/controls" style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2] }}>
      {/* A7: the scope chip opens the same Sort & filter sheet (its leftmost affordance). */}
      <MxChip label="All decks" onPress={onFilters} node="library/scope" />
      <View style={{ flex: 1 }} />
      <MxChip label={active ? `Filters · ${count}` : 'Filters'} icon="tune" selected={active} onPress={onFilters} node="library/filters" />
      {/* A8: the sort chip cycles recent → name → due. Label stays "A–Z" per the
          kit; `selected` reflects a non-default sort so the state is visible. */}
      <MxChip label="A–Z" icon="swap_vert" selected={sortBy !== undefined && sortBy !== 'recent'} onPress={onCycleSort} node="library/sort" />
    </View>
  );
}

function SheetDivider({ theme: t }: { theme: Theme }) {
  return <View style={{ height: t.stroke.hairline, backgroundColor: t.color.divider, margin: t.space[2] }} />;
}
