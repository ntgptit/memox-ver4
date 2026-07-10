/* MemoX — Account-sync local: SignInCard (signed-out hero + Google sign-in). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54 || {};
const { MxCard, MxButton, MxIconTile } = NS;

function SignInCard() {
  return (
    <MxCard node="account/signin" style={{ alignItems: 'center', textAlign: 'center', gap: 'var(--memox-space-4)', padding: 'var(--memox-space-7) var(--memox-space-5)' }}>
      <MxIconTile icon="cloud_sync" tone="accent" size="lg" />
      <div>
        <div style={{ fontSize: 'var(--memox-font-size-lg)', fontWeight: 'var(--memox-font-weight-extrabold)' }}>Sync across devices</div>
        <div style={{ fontSize: 'var(--memox-font-size-base)', color: 'var(--memox-text-secondary)', marginTop: 'var(--memox-space-1)', maxWidth: 'var(--memox-size-4xl)' }}>Sign in to back up and sync cards across devices. The app still works offline.</div>
      </div>
      <MxButton variant="primary" icon="login" block node="account/google">Sign in with Google</MxButton>
    </MxCard>
  );
}

window.MemoXAccountSync = window.MemoXAccountSync || {};
window.MemoXAccountSync.SignInCard = SignInCard;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const SignInCard = (window.MemoXAccountSync || {}).SignInCard;
