/* MxContextualAppBar — the shared, context-aware top app bar. Base class: cappbar
   One component for every screen chrome; content is passed by semantic slot, never
   screen-specific markup. Variants: root-contextual · root-standard · nested · search ·
   selection · focused. Root-contextual has two visual states — "at top" (context label,
   transparent, no divider) and "scrolled" (destination title, surface + divider); it
   collapses automatically on scroll, or via the explicit `collapsed` prop (gallery states).

   Runtime-authored (IIFE + global React) so the kit gallery loads it via babel-src without
   a bundle rebuild; ESM-exported for the design-system compiler. */
(function () {
  const NS = (window.MemoXDesignSystem_2ffa54 = window.MemoXDesignSystem_2ffa54 || {});
  const { MxIconButton } = NS;
  const R = window.React;

  function Bell({ count, dot }) {
    const badge = count > 0 || dot;
    const label = count > 0 ? `Notifications, ${count > 99 ? '99+' : count} unread` : 'Notifications';
    return (
      <span className="cappbar__notif" data-mx-node="shell/notifications">
        <MxIconButton icon="notifications" size="sm" node={null} ariaLabel={label} />
        {badge ? (
          <span className={'cappbar__badge' + (count > 0 ? '' : ' cappbar__badge--dot')} aria-hidden="true">
            {count > 0 ? (count > 99 ? '99+' : count) : ''}
          </span>
        ) : null}
      </span>
    );
  }

  function MxContextualAppBar(props) {
    const {
      variant = 'root-standard', collapsed: collapsedProp, context, title, count,
      search, leading, actions, notification, avatar, node, className = '',
    } = props;

    // Root-contextual collapses on scroll unless the state is pinned by `collapsed`.
    const [auto, setAuto] = R.useState(false);
    const ref = R.useRef(null);
    R.useEffect(() => {
      if (collapsedProp !== undefined || variant !== 'root-contextual' || !ref.current) return;
      const app = ref.current.closest('.app');
      const body = app && app.querySelector('.app__body');
      if (!body) return;
      const onScroll = () => setAuto(body.scrollTop > 24);
      onScroll();
      body.addEventListener('scroll', onScroll, { passive: true });
      return () => body.removeEventListener('scroll', onScroll);
    }, [collapsedProp, variant]);
    const collapsed = collapsedProp !== undefined ? collapsedProp : auto;

    const scrolled = collapsed || variant === 'root-standard' || variant === 'nested' || variant === 'selection';
    const cls = ['cappbar', 'cappbar--' + variant, scrolled ? 'cappbar--scrolled' : 'cappbar--top', className].filter(Boolean).join(' ');

    // Leading slot: explicit, else a sensible default per variant.
    const lead = leading !== undefined ? leading
      : variant === 'nested' || variant === 'search' || variant === 'focused' ? <MxIconButton icon="arrow_back" size="sm" node="shell/back" ariaLabel="Back" />
      : variant === 'selection' ? <MxIconButton icon="close" size="sm" node="shell/close" ariaLabel="Cancel selection" />
      : null;

    // Center content by variant.
    let main;
    if (variant === 'search') {
      main = (
        <div className="cappbar__search" data-mx-node="shell/search">
          <span className="material-symbols-rounded cappbar__search-icon">search</span>
          <input className="cappbar__search-input" placeholder={(search && search.placeholder) || 'Search'} defaultValue={search && search.value} aria-label="Search" />
        </div>
      );
    } else if (variant === 'selection') {
      main = <div className="cappbar__title" role="status">{count} selected</div>;
    } else if (variant === 'root-contextual') {
      main = collapsed
        ? <div className="cappbar__title">{title}</div>
        : <div className="cappbar__context">{context}</div>;
    } else {
      main = <div className="cappbar__title">{title}</div>;
    }

    // Right actions cluster (generic actions, then notification, then avatar).
    const right = (
      <div className="cappbar__actions">
        {actions}
        {notification ? <Bell count={notification.count} dot={notification.dot} /> : null}
        {avatar}
      </div>
    );

    return (
      <header ref={ref} className={cls} data-mx-node={node}>
        {lead ? <div className="cappbar__lead">{lead}</div> : null}
        <div className="cappbar__main">{main}</div>
        {right}
      </header>
    );
  }

  NS.MxContextualAppBar = MxContextualAppBar;
})();

export const MxContextualAppBar = (window.MemoXDesignSystem_2ffa54 || {}).MxContextualAppBar;
