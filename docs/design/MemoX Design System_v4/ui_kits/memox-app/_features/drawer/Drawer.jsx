/* MemoX — Drawer & language pairs. States: open · add-language · remove-language
   Feature-local components: components/{DrawerItem,LangCard,DrawerPanel,RemoveLanguageDialog}.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxContextualAppBar, MxIconButton, MxCard, MxButton } = NS;
const { LangCard, DrawerPanel, RemoveLanguageDialog } = window.MemoXDrawer;

function Drawer({ state = 'open' }) {
  if (state === 'open') {
    return <DrawerPanel />;
  }

  if (state === 'add-language') {
    return (
      <MxScaffold node="drawer/add-screen" appBar={<MxContextualAppBar variant="nested" title="Add language" node="drawer/add-appbar" leading={<MxIconButton icon="arrow_back" node="drawer/add-back" />} />}>
        <window.SectionLabel>LEARNING</window.SectionLabel>
        <LangCard icon="language" name="한국어" sub="Korean" node="drawer/learn-lang" />
        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--memox-text-tertiary)' }}><span className="material-symbols-rounded">arrow_downward</span></div>
        <window.SectionLabel style={{ margin: '0 0 0 var(--memox-space-1)' }}>NATIVE</window.SectionLabel>
        <LangCard icon="translate" name="English" sub="Meaning language" node="drawer/native-lang" />
        <MxButton variant="primary" icon="add" block node="drawer/add-confirm">Add language pair</MxButton>
      </MxScaffold>
    );
  }

  // remove-language
  return (
    <React.Fragment>
      <MxScaffold node="drawer/remove-screen" appBar={<MxContextualAppBar variant="nested" title="Remove language" node="drawer/remove-appbar" leading={<MxIconButton icon="arrow_back" node="drawer/remove-back" />} />}>
        <MxCard padding="sm">
          <window.ListRow icon="translate" title="한국어 → English" sub="1240 cards" node="drawer/pair-0"
            trailing={<MxIconButton icon="delete" node="drawer/pair-0-del" />} />
          <window.ListRow icon="translate" title="日本語 → English" sub="430 cards" last node="drawer/pair-1"
            trailing={<MxIconButton icon="delete" node="drawer/pair-1-del" />} />
        </MxCard>
      </MxScaffold>
      <RemoveLanguageDialog />
    </React.Fragment>
  );
}

window.Drawer = Drawer;
})();
