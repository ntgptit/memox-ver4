/* MemoX — Account & Sync. States: signed-out · signed-in · syncing · conflict · offline
   Feature-local components: components/{SyncBlock,SignInCard}.jsx
   Shared: window.ProfileCard (_shared/ProfileCard.jsx). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxAppBar, MxIconButton, MxButton, MxBadge } = NS;
const { SyncBlock, SignInCard } = window.MemoXAccountSync;
const ProfileCard = () => <window.ProfileCard node="account/profile" badge={<MxBadge tone="warning" soft>ALPHA</MxBadge>} />;

function AccountSync({ state = 'signed-out' }) {
  const bar = <MxAppBar title="Account & Sync" node="account/appbar" leading={<MxIconButton icon="arrow_back" node="account/back" />} />;

  if (state === 'signed-out') {
    return (
      <MxScaffold node="account/screen" appBar={bar}>
        <SignInCard />
        <div style={{ textAlign: 'center', fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-tertiary)' }}>This feature is in alpha.</div>
      </MxScaffold>
    );
  }

  return (
    <MxScaffold node="account/screen" appBar={bar}>
      <ProfileCard />

      <SyncBlock state={state} />

      <MxButton variant="ghost" danger icon="logout" block node="account/signout">Sign out</MxButton>
    </MxScaffold>
  );
}

window.AccountSync = AccountSync;
})();
