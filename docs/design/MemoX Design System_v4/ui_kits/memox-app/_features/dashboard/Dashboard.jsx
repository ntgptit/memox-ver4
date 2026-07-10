/* MemoX — Dashboard (Today). States: loaded · not-studied · goal-met · streak-reset · caught-up · empty · loading
   Action architecture: bottom nav = destinations only (Today/Library/Stats/Profile);
   "Add" is the FAB; the primary CTA "Start review" is attached to the Continue-studying
   section (not a floating button). `caught-up` = no cards due → the review CTA is
   replaced by an all-caught-up message. `empty` = first-run (no decks). Surfaces are
   kept to ~2 levels: Today is a flat inline strip (not a card); only Daily goal and the
   deck rows are cards. Feature-local components: components/{GreetingHeader,GoalCard,
   ContinueCard,OnboardingHero,OnboardingStep}.jsx (TodaySummary/StreakCard retired). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxAppBar, MxBottomNav, MxCard, MxSectionHeader, MxButton, MxIconButton, MxAvatar } = NS;

// Bottom nav holds DESTINATIONS only — "Add" is an action, so it lives in the FAB,
// not as a fake tab (correct nav semantics; keeps 4 comfortable tap targets).
const NAV = [
  { id: 'home', label: 'Today', icon: 'today' },
  { id: 'library', label: 'Library', icon: 'style' },
  { id: 'stats', label: 'Stats', icon: 'insights' },
  { id: 'me', label: 'Profile', icon: 'person' },
];

const DECKS = [
  { icon: 'translate', tone: 'accent', name: 'TOPIK I — Vocabulary', meta: '320 cards · 48 due', due: 48, progress: 72 },
  { icon: 'menu_book', tone: 'warning', name: 'Basic Grammar', meta: '180 cards · 23 due', due: 23, progress: 54 },
  { icon: 'record_voice_over', tone: 'success', name: 'Daily Conversation', meta: '150 cards · 6 due', due: 6, progress: 88 },
];

// Separate fixture for the caught-up state — 0 due everywhere, so the deck rows can
// never contradict the "no cards due" hero (each row shows an up-to-date ✓, not a count).
const CAUGHT_DECKS = [
  { icon: 'translate', tone: 'accent', name: 'TOPIK I — Vocabulary', meta: '320 cards · up to date', due: 0, progress: 100 },
  { icon: 'menu_book', tone: 'warning', name: 'Basic Grammar', meta: '180 cards · up to date', due: 0, progress: 100 },
  { icon: 'record_voice_over', tone: 'success', name: 'Daily Conversation', meta: '150 cards · up to date', due: 0, progress: 100 },
];

const Note = window.Note;

function Dashboard({ state = 'loaded' }) {
  const { GoalCard, ContinueCard, GreetingHeader } = window.MemoXDashboard;
  const nav = <MxBottomNav items={NAV} value="home" node="shell/bottom-nav" />;
  // Slim bar: actions only. The date + greeting live in the scroll body
  // (GreetingHeader) so they scroll away with content.
  const bar = (
    <MxAppBar node="dashboard/appbar"
      trailing={<React.Fragment>
        <MxIconButton icon="notifications" node="dashboard/notifications" />
        <MxAvatar name="Linh Tran" size="sm" />
      </React.Fragment>} />
  );
  const greeting = <GreetingHeader eyebrow="Saturday · 27 Jun" title="Good evening, Linh" node="dashboard/greeting" />;

  if (state === 'loading') {
    const S = window.Skeleton;
    return (
      <MxScaffold node="dashboard/screen" appBar={bar} bottomNav={nav}>
        {greeting}
        <S w="55%" h={16} />
        <S h={48} r={14} />
        <MxCard><S w="35%" h={14} /><S h={10} r={999} style={{ marginTop: 'var(--memox-space-3)' }} /><S w="60%" h={10} style={{ marginTop: 'var(--memox-space-2)' }} /></MxCard>
        <S w="30%" h={16} />
        {[0, 1].map((i) => <MxCard key={i} padding="sm"><div style={{ display: 'flex', gap: 'var(--memox-space-4)', alignItems: 'center' }}><S w={48} h={48} r={16} /><div style={{ flex: 1 }}><S w="60%" h={14} /><S w="40%" h={10} style={{ marginTop: 'var(--memox-space-2)' }} /></div></div></MxCard>)}
      </MxScaffold>
    );
  }

  if (state === 'empty') {
    const { OnboardingHero, OnboardingStep } = window.MemoXDashboard;
    return (
      <MxScaffold node="dashboard/screen" appBar={bar} bottomNav={nav}>
        {greeting}
        <OnboardingHero icon="school" title="Start your first deck"
          text="Add the words you want to remember — MemoX schedules the reviews for you.">
          <MxButton variant="contrast" icon="add" block node="dashboard/create-deck">Create a deck</MxButton>
          <MxButton variant="secondary" icon="upload_file" block node="dashboard/import-file">Import from a file</MxButton>
        </OnboardingHero>
        <MxSectionHeader title="How MemoX works" node="dashboard/how-it-works" />
        <OnboardingStep icon="library_add" title="Add your words"
          text="Create decks or import from CSV" node="dashboard/step-add" />
        <OnboardingStep icon="bolt" tone="accent" title="Study with smart review"
          text="Spaced repetition picks what's due" node="dashboard/step-review" />
        <OnboardingStep icon="local_fire_department" tone="warning" title="Build a daily streak"
          text="Hit your daily goal to keep the flame" node="dashboard/step-streak" />
      </MxScaffold>
    );
  }

  const met = state === 'goal-met';
  const reset = state === 'streak-reset';
  const idle = state === 'not-studied';
  const caught = state === 'caught-up';
  const goalPct = met ? 100 : idle ? 0 : 70;
  const streak = met ? 13 : reset ? 0 : 12;
  const dueCards = 24;
  const dueDecks = DECKS.length;

  // A flat, low-elevation stat (no card) — used inline in the Today strip so the
  // screen keeps 2 real surfaces (Continue CTA affordance + Daily goal / deck rows).
  const Stat = ({ n, l }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ fontSize: 'var(--memox-font-size-lg)', fontWeight: 'var(--memox-font-weight-extrabold)' }}>{n}</div>
      <div style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)' }}>{l}</div>
    </div>
  );

  return (
    <MxScaffold node="dashboard/screen" appBar={bar} bottomNav={nav}
      fab={<MxFabAdd />}>
      {greeting}
      {met ? <Note icon="celebration" tone="success" text="Daily goal reached! Streak +1." /> : null}
      {reset ? <Note icon="local_fire_department" tone="warning" text="Streak reset — study today to start again." /> : null}
      {idle ? <Note icon="bolt" tone="accent" text="You haven't studied today — study to keep your streak." /> : null}

      {/* PRIMARY: continue studying — the CTA is attached to the section, not floating.
          When nothing is due, the Review CTA is replaced by an all-caught-up message. */}
      {caught ? (
        <div data-mx-node="dashboard/continue" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-1)' }}>
            <div style={{ fontSize: 'var(--memox-font-size-md)', fontWeight: 'var(--memox-font-weight-bold)' }}>You're all caught up</div>
            <div style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)' }}>No cards due right now.</div>
          </div>
          <MxButton variant="secondary" icon="explore" block node="dashboard/explore">Explore decks</MxButton>
        </div>
      ) : (
        <div data-mx-node="dashboard/continue" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)' }}>
          <MxSectionHeader title="Continue studying" caption={`${dueCards} cards due across ${dueDecks} decks`} node="dashboard/continue-head" />
          <MxButton variant="primary" icon="bolt" block node="dashboard/start-review">Start review</MxButton>
        </div>
      )}

      <GoalCard pct={goalPct} met={met} minutes={idle ? 0 : 14} />

      {/* Today strip — flat inline stats, no card. Merges time/words/streak/mastery
          into one low-surface summary instead of four separate cards. */}
      <div data-mx-node="dashboard/today" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)' }}>
        <div style={{ fontSize: 'var(--memox-font-size-md)', fontWeight: 'var(--memox-font-weight-bold)' }}>Today</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--memox-space-4) var(--memox-space-6)' }}>
          <Stat n={idle ? '0m' : '12m'} l="studied" />
          <Stat n={idle ? '0' : '24'} l="words learned" />
          <Stat n={`${streak}-day`} l="streak" />
          <Stat n="55%" l="library mastered" />
        </div>
      </div>

      <MxSectionHeader title="Recent decks" action="See all" node="dashboard/decks-head" />
      {(caught ? CAUGHT_DECKS : DECKS).map((d, i) => <ContinueCard key={i} deck={d} index={i} />)}
    </MxScaffold>
  );
}

// Extended FAB — the label makes the global create action legible ("+ Add") instead of
// a bare "+" whose intent is ambiguous. Opens a create sheet (Add card / Create deck /
// Import) in the real app.
function MxFabAdd() {
  const { MxFab } = NS;
  return <MxFab icon="add" label="Add" node="dashboard/add" />;
}

window.Dashboard = Dashboard;
})();
