/* MemoX — Dashboard (Today). States: loaded · not-studied · empty · loading · goal-met · streak-reset
   `empty` = the library has no decks yet (first-run onboarding); "no activity
   today" is NOT empty — it is `not-studied`: the full loaded layout with zeroed
   figures plus a nudge banner (the user's decks/goal/streak don't vanish).
   Feature-local components: components/{GreetingHeader,TodaySummary,GoalCard,
   StreakCard,ContinueCard,OnboardingHero,OnboardingStep}.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxAppBar, MxBottomNav, MxCard, MxSectionHeader, MxButton, MxIconButton, MxAvatar } = NS;

const NAV = [
  { id: 'home', label: 'Today', icon: 'today' },
  { id: 'library', label: 'Library', icon: 'style' },
  { id: 'add', label: 'Add', icon: 'add_circle' },
  { id: 'stats', label: 'Stats', icon: 'insights' },
  { id: 'me', label: 'Profile', icon: 'person' },
];

const DECKS = [
  { icon: 'translate', tone: 'accent', name: 'TOPIK I — Vocabulary', meta: '320 cards · 48 due', due: 48, progress: 72 },
  { icon: 'menu_book', tone: 'warning', name: 'Basic Grammar', meta: '180 cards · 23 due', due: 23, progress: 54 },
  { icon: 'record_voice_over', tone: 'success', name: 'Daily Conversation', meta: '150 cards · 6 due', due: 6, progress: 88 },
];

const Note = window.Note;

function Dashboard({ state = 'loaded' }) {
  const { TodaySummary, GoalCard, StreakCard, ContinueCard, GreetingHeader } = window.MemoXDashboard;
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
        <MxCard><S w="40%" h={12} /><S w="55%" h={30} style={{ marginTop: 'var(--memox-space-2)' }} /></MxCard>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--memox-space-3)' }}>{[0, 1].map((i) => <MxCard key={i} padding="sm"><S w="60%" h={22} /><S w="45%" h={10} style={{ marginTop: 'var(--memox-space-2)' }} /></MxCard>)}</div>
        <S w="45%" h={16} />
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
  const goalPct = met ? 100 : idle ? 0 : 70;
  const streak = met ? 13 : reset ? 0 : 12;

  return (
    <MxScaffold node="dashboard/screen" appBar={bar} bottomNav={nav}
      fab={<MxFabReview />}>
      {greeting}
      {met ? <Note icon="celebration" tone="success" text="Daily goal reached! Streak +1." /> : null}
      {reset ? <Note icon="local_fire_department" tone="warning" text="Streak reset — study today to start again." /> : null}
      {idle ? <Note icon="bolt" tone="accent" text="You haven't studied today — start to keep your streak!" /> : null}

      <TodaySummary time={idle ? '00:00' : '12:30'} words={idle ? '0' : '24'} />

      <GoalCard pct={goalPct} met={met} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--memox-space-3)' }}>
        <StreakCard streak={streak} />
        <MxCard variant="muted" padding="sm" node="dashboard/mastered">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-3)', minWidth: 0, flexWrap: 'wrap' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 'var(--memox-font-size-xl)', color: 'var(--memox-success)' }}>verified</span>
            <window.Stat align="start" n="55%" l="mastered" />
          </div>
        </MxCard>
      </div>

      <MxSectionHeader title="Continue studying" caption="3 decks due today" action="See all" node="dashboard/decks-head" />
      {DECKS.map((d, i) => <ContinueCard key={i} deck={d} index={i} />)}
    </MxScaffold>
  );
}

function MxFabReview() {
  const { MxFab } = NS;
  return <MxFab icon="bolt" label="Review" node="dashboard/quick-review" />;
}

window.Dashboard = Dashboard;
})();
