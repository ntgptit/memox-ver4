/**
 * Subdeck-list screen (WBS 3.5) — browse and manage the subdecks inside the current
 * deck. SUBDECKS ONLY — never a cards section, never Add card; the same screen is
 * reused at every tree level. Composition mirrors the kit
 * `_features/subdeck-list/SubdeckList.jsx`: nested bar (back · title · search · More)
 * → Breadcrumb → SUBDECKS section label with the deck aggregate → MxList of shared
 * SubdeckCards → Create-subdeck FAB, plus the create/actions/play sheets, search
 * mode, selection mode, loading/empty/offline/error. 13 states (contract §6).
 */

import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import {
  AppScreen,
  Breadcrumb,
  DeckPlaySheet,
  EmptyState,
  Icon,
  MenuItem,
  MxButton,
  MxCard,
  MxFab,
  MxIconButton,
  MxLink,
  MxList,
  MxSearchDock,
  Scrim,
  SectionLabel,
  Sheet,
  Skeleton,
  useTheme,
  type BreadcrumbItem,
} from '@/design-system';

import { SubdeckCard } from './subdeck-card';
import {
  subdeckSummary,
  SUBDECK_TRAIL,
  type SubdeckListData,
  type SubdeckListUiState,
  type SubdeckView,
} from './subdeck-list-fixtures';

export interface SubdeckListScreenProps {
  data: SubdeckListData;
  /** Deck title in the nested bar ("Korean TOPIK I"; deep levels show the leaf). */
  deckTitle: string;
  /** Breadcrumb trail, root → current. */
  trail?: readonly BreadcrumbItem[];
  onBack?: () => void;
  onOpenSubdeck?: (id: string) => void;
  onCreateSubdeck?: () => void;
  onImportSubdecks?: () => void;
  onDeckSettings?: () => void;
  onRenameSubdeck?: (id: string) => void;
  onMoveSubdeck?: (id: string) => void;
  onDeleteSubdeck?: (id: string) => void;
  onStartSession?: (id: string) => void;
  onSingleMode?: (id: string) => void;
  onListen?: (id: string) => void;
  onRetry?: () => void;
  /** Preview/testing: start in a canonical UI state. */
  initialUi?: SubdeckListUiState;
}

type Mode = 'browse' | 'search' | 'selection';
type SheetKind = 'create' | 'actions' | 'play' | null;

/** Kit fixture queries per search state. */
const PREVIEW_QUERY: Partial<Record<SubdeckListUiState, string>> = { search: 'gr', 'no-results': 'zzz' };

export function SubdeckListScreen({
  data,
  deckTitle,
  trail = SUBDECK_TRAIL,
  onBack,
  onOpenSubdeck,
  onCreateSubdeck,
  onImportSubdecks,
  onDeckSettings,
  onRenameSubdeck,
  onMoveSubdeck,
  onDeleteSubdeck,
  onStartSession,
  onSingleMode,
  onListen,
  onRetry,
  initialUi = 'loaded',
}: SubdeckListScreenProps) {
  const t = useTheme();
  const [mode, setMode] = useState<Mode>(
    initialUi === 'search' || initialUi === 'no-results' ? 'search' : initialUi === 'selection' ? 'selection' : 'browse',
  );
  const [query, setQuery] = useState(PREVIEW_QUERY[initialUi] ?? '');
  const [sheet, setSheet] = useState<SheetKind>(
    initialUi === 'create-sheet' ? 'create' : initialUi === 'subdeck-actions' ? 'actions' : initialUi === 'play' ? 'play' : null,
  );
  // The subdeck a sheet is about (kit fixture: "Greetings & introductions" = index 0).
  const [activeId, setActiveId] = useState<string | null>(
    data.status === 'ready' && (initialUi === 'subdeck-actions' || initialUi === 'play') ? (data.subdecks[0]?.id ?? null) : null,
  );
  // Kit selection fixture: rows 0 and 2 selected.
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        initialUi === 'selection' && data.status === 'ready'
          ? data.subdecks.filter((_, i) => [0, 2].includes(i)).map((s) => s.id)
          : [],
      ),
  );

  const subdecks = useMemo(() => (data.status === 'ready' ? data.subdecks : []), [data]);
  const active = subdecks.find((s) => s.id === activeId) ?? null;
  const searching = mode === 'search';
  // Kit search fixture matches /gr|fa/i — a live query filters by name inclusion.
  const hits = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === '') return subdecks;
    if (query === PREVIEW_QUERY.search) return subdecks.filter((s) => /gr|fa/i.test(s.name));
    return subdecks.filter((s) => s.name.toLowerCase().includes(needle));
  }, [subdecks, query]);

  const back = <MxIconButton icon="arrow_back" size="sm" accessibilityLabel="Back" onPress={onBack} node="subdeck-list/back" />;
  const nestedActions = (
    <>
      <MxIconButton icon="search" size="sm" accessibilityLabel="Search subdecks" onPress={() => setMode('search')} node="subdeck-list/search-open" />
      <MxIconButton icon="more_vert" size="sm" accessibilityLabel="Deck settings" onPress={onDeckSettings} node="subdeck-list/more" />
    </>
  );
  const fab = <MxFab icon="add" accessibilityLabel="Create subdeck" onPress={() => setSheet('create')} node="subdeck-list/create" />;

  const crumbs = <Breadcrumb items={trail} node="subdeck-list/breadcrumb" />;
  const subHead = (arr: readonly SubdeckView[]) => (
    <SectionLabel uppercase>
      Subdecks{' '}
      <Text style={[t.font.text({ size: 'sm', weight: 'medium' }), { color: t.color.textTertiary }]}>
        · {subdeckSummary(arr)}
      </Text>
    </SectionLabel>
  );
  const list = (arr: readonly SubdeckView[]) => (
    <MxList>
      {arr.map((s, i) => (
        <SubdeckCard
          key={s.id}
          subdeck={s}
          index={i}
          nodePrefix="subdeck-list"
          onPress={() => onOpenSubdeck?.(s.id)}
          onLongPress={() => {
            setSelectedIds(new Set([s.id]));
            setMode('selection');
          }}
          onStudy={() => {
            setActiveId(s.id);
            setSheet('play');
          }}
        />
      ))}
    </MxList>
  );

  // ---- loading ------------------------------------------------------------------
  if (data.status === 'loading') {
    return (
      <AppScreen node="subdeck-list/screen" variant="nested" title={deckTitle} leading={back} actions={nestedActions} fab={fab}>
        <Skeleton w="55%" h={13} />
        <SectionLabel uppercase>Subdecks</SectionLabel>
        <MxList>
          {[0, 1, 2, 3].map((i) => (
            <MxCard key={i} padding="sm">
              <View style={{ flexDirection: 'row', gap: t.space[4], alignItems: 'center' }}>
                <Skeleton w={40} h={40} r={999} />
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

  // ---- error ----------------------------------------------------------------------
  if (data.status === 'error') {
    return (
      <AppScreen node="subdeck-list/screen" variant="nested" title={deckTitle} leading={back} actions={nestedActions}>
        <EmptyState
          node="subdeck-list/error"
          icon="cloud_off"
          tone="error"
          title="Couldn't load subdecks"
          text={data.message}
          action={
            <MxButton variant="primary" icon="refresh" onPress={onRetry} node="subdeck-list/retry">
              Retry
            </MxButton>
          }
        />
      </AppScreen>
    );
  }

  // ---- search / no-results ----------------------------------------------------------
  if (searching) {
    const noResults = hits.length === 0 || (query === PREVIEW_QUERY['no-results'] && initialUi === 'no-results');
    return (
      <AppScreen
        node="subdeck-list/screen"
        variant="search"
        main={
          <MxSearchDock
            value={query}
            placeholder="Search subdecks"
            onChange={setQuery}
            accessibilityLabel="Search subdecks"
            node="subdeck-list/search-dock"
          />
        }
        actions={
          <MxIconButton
            icon="close"
            size="sm"
            accessibilityLabel="Clear search"
            onPress={() => {
              setMode('browse');
              setQuery('');
            }}
            node="subdeck-list/search-clear"
          />
        }
      >
        {noResults ? (
          <EmptyState
            node="subdeck-list/no-results"
            icon="search_off"
            tone="warning"
            title={`No subdecks for “${query}”`}
            text="Try another keyword."
            action={
              <MxButton
                variant="secondary"
                icon="close"
                onPress={() => {
                  setMode('browse');
                  setQuery('');
                }}
                node="subdeck-list/clear"
              >
                Clear search
              </MxButton>
            }
          />
        ) : (
          <>
            <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>{hits.length} subdecks match</Text>
            <SectionLabel uppercase>Subdecks</SectionLabel>
            {list(hits)}
          </>
        )}
      </AppScreen>
    );
  }

  // ---- selection --------------------------------------------------------------------
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
        node="subdeck-list/screen"
        variant="selection"
        count={selectedIds.size}
        actions={
          <>
            <MxIconButton
              icon="select_all"
              size="sm"
              accessibilityLabel="Select all"
              onPress={() => setSelectedIds(new Set(subdecks.map((s) => s.id)))}
              node="subdeck-list/sel-all"
            />
            <MxIconButton icon="more_vert" size="sm" accessibilityLabel="More actions" onPress={() => setMode('browse')} node="subdeck-list/sel-more" />
          </>
        }
      >
        <SectionLabel uppercase>Subdecks</SectionLabel>
        <MxList>
          {subdecks.map((s, i) => (
            <SubdeckCard key={s.id} subdeck={s} index={i} nodePrefix="subdeck-list" selected={selectedIds.has(s.id)} onPress={() => toggle(s.id)} />
          ))}
        </MxList>
      </AppScreen>
    );
  }

  // ---- empty ---------------------------------------------------------------------
  if (subdecks.length === 0) {
    return (
      <AppScreen node="subdeck-list/screen" variant="nested" title={deckTitle} leading={back} actions={nestedActions} fab={fab}>
        <EmptyState
          node="subdeck-list/empty"
          icon="account_tree"
          title="No subdecks yet"
          text="Create a subdeck to organise this deck into nested topics."
          action={
            <MxButton variant="primary" icon="library_add" onPress={onCreateSubdeck} node="subdeck-list/empty-create">
              Create subdeck
            </MxButton>
          }
        />
      </AppScreen>
    );
  }

  // ---- browse (loaded/dense/deep/offline + sheets) -----------------------------------
  return (
    <AppScreen node="subdeck-list/screen" variant="nested" title={deckTitle} leading={back} actions={nestedActions} fab={fab}>
      {crumbs}
      {data.offline && (
        <View
          testID="subdeck-list/offline-banner"
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
            Offline · showing saved subdecks. Last synced 2 hours ago.
          </Text>
          <MxLink size="sm" trailingIcon={null} onPress={onRetry} node="subdeck-list/offline-retry">
            Retry
          </MxLink>
        </View>
      )}
      {subHead(subdecks)}
      {list(subdecks)}

      {sheet === 'create' && (
        <Scrim node="subdeck-list/create-scrim" align="end" onDismiss={() => setSheet(null)}>
          <Sheet title="Create" node="subdeck-list/create-sheet">
            <MenuItem icon="library_add" label="Create subdeck" onPress={() => { setSheet(null); onCreateSubdeck?.(); }} node="subdeck-list/create-subdeck" />
            <MenuItem icon="account_tree" label="Import subdecks" onPress={() => { setSheet(null); onImportSubdecks?.(); }} node="subdeck-list/create-import" />
          </Sheet>
        </Scrim>
      )}

      {sheet === 'actions' && active && (
        <Scrim node="subdeck-list/actions-scrim" align="end" onDismiss={() => setSheet(null)}>
          <Sheet title={active.name} node="subdeck-list/actions-sheet">
            <MenuItem
              icon="bolt"
              label="Study subdeck"
              onPress={() => setSheet('play')}
              node="subdeck-list/action-study"
            />
            <MenuItem icon="edit" label="Rename subdeck" onPress={() => onRenameSubdeck?.(active.id)} node="subdeck-list/action-rename" />
            <MenuItem icon="drive_file_move" label="Move subdeck" onPress={() => onMoveSubdeck?.(active.id)} node="subdeck-list/action-move" />
            <MenuItem icon="delete" label="Delete subdeck" danger onPress={() => onDeleteSubdeck?.(active.id)} node="subdeck-list/action-delete" />
          </Sheet>
        </Scrim>
      )}

      {sheet === 'play' && active && (
        <DeckPlaySheet
          title={active.name}
          onSession={() => onStartSession?.(active.id)}
          onSingleMode={() => onSingleMode?.(active.id)}
          onListen={() => onListen?.(active.id)}
          onDismiss={() => setSheet(null)}
        />
      )}
    </AppScreen>
  );
}

