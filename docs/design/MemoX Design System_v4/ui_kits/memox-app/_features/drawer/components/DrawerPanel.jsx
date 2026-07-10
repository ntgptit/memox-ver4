/* MemoX — Drawer local: DrawerPanel (the slide-out panel for the "open" state).
   Owns its ITEMS list; renders each via DrawerItem. */
(function () {

const ITEMS = [
  { icon: 'add', label: 'Add language' },
  { icon: 'delete', label: 'Remove language' },
  { icon: 'upload_file', label: 'Import' },
  { icon: 'download', label: 'Export' },
  { icon: 'insights', label: 'Stats' },
  { icon: 'palette', label: 'Theme' },
  { icon: 'settings', label: 'Settings' },
  { icon: 'help', label: 'FAQ' },
  { icon: 'mail', label: 'Email us' },
  { icon: 'backup', label: 'Backup' },
];

function DrawerPanel() {
  const { DrawerItem } = window.MemoXDrawer;
  return (
    <div data-mx-node="drawer/overlay" style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex' }}>
      <div data-mx-node="drawer/panel" style={{ width: '82%', maxWidth: 'var(--memox-size-5xl)', height: '100%', background: 'var(--memox-surface)', color: 'var(--memox-text)', display: 'flex', flexDirection: 'column', padding: 'var(--memox-space-6) var(--memox-gutter)', boxShadow: 'var(--memox-shadow-lg)' }}>
        <div style={{ padding: '0 var(--memox-space-2) var(--memox-space-4)', borderBottom: 'var(--memox-stroke-hairline) solid var(--memox-divider)', marginBottom: 'var(--memox-space-2)' }}>
          <window.SectionLabel style={{ margin: 0 }}>TODAY'S ACTIVITY</window.SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-2)', marginTop: 'var(--memox-space-2)', fontWeight: 'var(--memox-font-weight-bold)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 'var(--memox-font-size-lg)', color: 'var(--memox-primary)' }}>schedule</span>
            <span style={{ fontSize: 'var(--memox-font-size-md)' }}>12:45</span>
            <span style={{ color: 'var(--memox-text-tertiary)' }}>·</span>
            <span style={{ fontSize: 'var(--memox-font-size-md)' }}>24 words</span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {ITEMS.map((it, i) => <DrawerItem key={i} icon={it.icon} label={it.label} node={'drawer/item-' + i} />)}
        </div>
      </div>
      <div style={{ flex: 1, background: 'var(--memox-overlay)' }} />
    </div>
  );
}

window.MemoXDrawer = window.MemoXDrawer || {};
window.MemoXDrawer.DrawerPanel = DrawerPanel;
})();

/* ESM export so the design-system compiler indexes this kit composite. */
export const DrawerPanel = (window.MemoXDrawer || {}).DrawerPanel;
