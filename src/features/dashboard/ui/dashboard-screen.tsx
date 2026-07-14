/**
 * Dashboard screen (WBS 5.3) — the Today tab. Composition mirrors the kit
 * `_features/dashboard/Dashboard.jsx`: root bar (Today · search · bell-dot ·
 * avatar) → greeting → state note (goal-met/streak-reset/not-studied) →
 * Continue-studying section with the single primary CTA (or the caught-up
 * hero) → GoalCard → flat Today strip (4 stats) → Recent decks (shared
 * DeckCard + MxList) → add FAB + Create sheet. 8 states (contract §6).
 * The bottom nav is the real tab bar (`(tabs)/_layout`) — `inTabs`.
 */

import { useState } from 'react';
import { Text, View } from 'react-native';

import {
  AppScreen,
  DeckCard,
  Icon,
  MenuItem,
  MxAvatar,
  MxBadge,
  MxButton,
  MxCard,
  MxFab,
  MxIconButton,
  MxLink,
  MxList,
  MxSectionHeader,
  Note,
  Scrim,
  Sheet,
  Skeleton,
  useTheme,
} from '@/design-system';

import { GoalCard, GreetingHeader, OnboardingHero, OnboardingStep, Stat } from './dashboard-components';
import type { DashboardData, DashboardDeckView, DashboardUiState } from './dashboard-fixtures';

export interface DashboardScreenProps {
  data: DashboardData;
  onStartReview?: () => void;
  onExploreDecks?: () => void;
  onOpenDeck?: (id: string) => void;
  onSeeAllDecks?: () => void;
  onAddCard?: () => void;
  onCreateDeck?: () => void;
  onImportCards?: () => void;
  onSearch?: () => void;
  onNotifications?: () => void;
  /** Preview/testing: start in a canonical UI state. */
  initialUi?: DashboardUiState;
}

export function DashboardScreen({
  data,
  onStartReview,
  onExploreDecks,
  onOpenDeck,
  onSeeAllDecks,
  onAddCard,
  onCreateDeck,
  onImportCards,
  onSearch,
  onNotifications,
  initialUi = 'loaded',
}: DashboardScreenProps) {
  const t = useTheme();
  const [sheetOpen, setSheetOpen] = useState(initialUi === 'create-sheet');

  const barProps = {
    title: 'Today',
    actions: (
      <MxIconButton icon="search" size="sm" accessibilityLabel="Search words" onPress={onSearch} node="dashboard/search-open" />
    ),
    notification: { dot: true, onPress: onNotifications },
    avatar: <MxAvatar name="Linh Tran" size="sm" />,
  } as const;

  // ---- loading ------------------------------------------------------------------
  if (data.status === 'loading') {
    return (
      <AppScreen node="dashboard/screen" inTabs {...barProps}>
        <GreetingHeader title="Good evening" node="dashboard/greeting" />
        <Skeleton w="55%" h={16} />
        <Skeleton h={48} r={14} />
        <MxCard>
          <Skeleton w="35%" h={14} />
          <Skeleton h={10} r={999} style={{ marginTop: t.space[3] }} />
          <Skeleton w="60%" h={10} style={{ marginTop: t.space[2] }} />
        </MxCard>
        <Skeleton w="30%" h={16} />
        {[0, 1].map((i) => (
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
      </AppScreen>
    );
  }

  const { greeting, decks, dueCards, dueDecks, stats } = data;
  const ui = initialUi;
  const met = ui === 'goal-met';
  const reset = ui === 'streak-reset';
  const idle = ui === 'not-studied';
  const caught = ui === 'caught-up';
  const empty = decks.length === 0;

  // ---- empty (first-run onboarding) ----------------------------------------------
  if (empty) {
    return (
      <AppScreen node="dashboard/screen" inTabs {...barProps}>
        <GreetingHeader title={greeting} node="dashboard/greeting" />
        <OnboardingHero
          icon="school"
          title="Start your first deck"
          text="Add the words you want to remember — MemoX schedules the reviews for you."
        >
          <MxButton variant="contrast" icon="add" block onPress={onCreateDeck} node="dashboard/create-deck">
            Create a deck
          </MxButton>
          <MxButton variant="secondary" icon="upload_file" block onPress={onImportCards} node="dashboard/import-file">
            Import from a file
          </MxButton>
        </OnboardingHero>
        <MxSectionHeader title="How MemoX works" node="dashboard/how-it-works" />
        <OnboardingStep icon="library_add" title="Add your words" text="Create decks or import from CSV" node="dashboard/step-add" />
        <OnboardingStep icon="bolt" tone="accent" title="Study with smart review" text="Spaced repetition picks what's due" node="dashboard/step-review" />
        <OnboardingStep icon="local_fire_department" tone="warning" title="Build a daily streak" text="Hit your daily goal to keep the flame" node="dashboard/step-streak" />
      </AppScreen>
    );
  }

  const deckRow = (d: DashboardDeckView, i: number) => (
    <DeckCard
      key={d.id}
      icon={d.icon}
      tone={d.tone}
      title={d.name}
      meta={d.meta}
      progress={d.progress}
      trailing={
        <MxBadge tone={d.due > 0 ? undefined : 'success'} soft>
          {d.due > 0 ? d.due : <Icon name="check" size={t.font.size.xs} color={t.color.onSuccessSoft} />}
        </MxBadge>
      }
      onPress={onOpenDeck === undefined ? undefined : () => onOpenDeck(d.id)}
      node={`dashboard/deck-${i}`}
    />
  );

  return (
    <>
      <AppScreen
        node="dashboard/screen"
        inTabs
        {...barProps}
        fab={<MxFab icon="add" accessibilityLabel="Add" onPress={() => setSheetOpen(true)} node="dashboard/add" />}
      >
        <GreetingHeader title={greeting} node="dashboard/greeting" />
        {met && <Note icon="celebration" tone="success" text="Daily goal reached! Streak +1." />}
        {reset && <Note icon="local_fire_department" tone="warning" text="Streak reset — study today to start again." />}
        {idle && <Note icon="bolt" tone="accent" text="You haven't studied today — study to keep your streak." />}

        {/* PRIMARY: continue studying — the CTA is attached to the section, not
            floating. With nothing due it becomes the all-caught-up message. */}
        {caught ? (
          <View testID="dashboard/continue" style={{ gap: t.space[3] }}>
            <View style={{ gap: t.space[1] }}>
              <Text style={[t.font.text({ size: 'md', weight: 'bold' }), { color: t.color.text }]}>
                You&apos;re all caught up
              </Text>
              <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>No cards due right now.</Text>
            </View>
            <MxButton variant="secondary" icon="explore" block onPress={onExploreDecks} node="dashboard/explore">
              Explore decks
            </MxButton>
          </View>
        ) : (
          <View testID="dashboard/continue" style={{ gap: t.space[3] }}>
            <MxSectionHeader
              title="Continue studying"
              caption={`${dueCards} cards due across ${dueDecks} decks`}
              node="dashboard/continue-head"
            />
            <MxButton variant="primary" icon="bolt" block onPress={onStartReview} node="dashboard/start-review">
              Start review
            </MxButton>
          </View>
        )}

        <GoalCard pct={stats.goalPct} met={met} minutes={stats.minutes} goal={stats.goalMinutes} node="dashboard/goal" />

        {/* Today strip — flat inline stats, no card (kit: one low-surface summary). */}
        <View testID="dashboard/today" style={{ gap: t.space[3] }}>
          <Text style={[t.font.text({ size: 'md', weight: 'bold' }), { color: t.color.text }]}>Today</Text>
          <View style={{ gap: t.space[6] }}>
            <View style={{ flexDirection: 'row', gap: t.space[6] }}>
              <Stat icon="schedule" soft={t.color.primarySoft} on={t.color.onPrimarySoft} n={stats.studiedToday} l="studied" />
              <Stat icon="menu_book" soft={t.color.accentSoft} on={t.color.accent} n={stats.wordsToday} l="words learned" />
            </View>
            <View style={{ flexDirection: 'row', gap: t.space[6] }}>
              <Stat icon="local_fire_department" soft={t.color.warningSoft} on={t.color.onWarningSoft} n={String(stats.streak)} l="day streak" />
              <Stat icon="verified" soft={t.color.successSoft} on={t.color.onSuccessSoft} n={stats.masteredPct} l="library mastered" />
            </View>
          </View>
        </View>

        {/* Recent decks — shared DeckCard + MxList so Library and Dashboard never drift. */}
        <View testID="dashboard/decks" style={{ gap: t.space[3] }}>
          <MxSectionHeader title="Recent decks" node="dashboard/decks-head" />
          <MxList>{decks.map(deckRow)}</MxList>
          <View style={{ alignItems: 'center' }}>
            <MxLink onPress={onSeeAllDecks} node="dashboard/see-all-decks">
              See all decks
            </MxLink>
          </View>
        </View>
      </AppScreen>

      {sheetOpen && (
        <Scrim align="end" onDismiss={() => setSheetOpen(false)} node="dashboard/create-scrim">
          <Sheet title="Create" node="dashboard/create-sheet">
            <MenuItem icon="note_add" label="Add card" onPress={onAddCard} node="dashboard/create-card" />
            <MenuItem icon="stacks" label="Create deck" onPress={onCreateDeck} node="dashboard/create-deck" />
            <View
              style={{
                height: t.stroke.hairline,
                backgroundColor: t.color.divider,
                marginVertical: t.space[2],
                marginHorizontal: t.space[2],
              }}
            />
            <MenuItem icon="upload_file" label="Import cards" onPress={onImportCards} node="dashboard/create-import" />
          </Sheet>
        </Scrim>
      )}
    </>
  );
}
