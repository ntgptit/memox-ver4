/* @ds-bundle: {"format":4,"namespace":"MemoXDesignSystem_2ffa54","components":[{"name":"MxAvatar","sourcePath":"components/core/MxAvatar.jsx"},{"name":"MxBadge","sourcePath":"components/core/MxBadge.jsx"},{"name":"MxButton","sourcePath":"components/core/MxButton.jsx"},{"name":"MxChip","sourcePath":"components/core/MxChip.jsx"},{"name":"MxSegmentedControl","sourcePath":"components/core/MxSegmentedControl.jsx"},{"name":"MxSwitch","sourcePath":"components/core/MxSwitch.jsx"},{"name":"MxTextField","sourcePath":"components/core/MxTextField.jsx"},{"name":"MxBottomNav","sourcePath":"components/navigation/MxBottomNav.jsx"},{"name":"MxFab","sourcePath":"components/navigation/MxFab.jsx"},{"name":"MxIconButton","sourcePath":"components/navigation/MxIconButton.jsx"},{"name":"MxSearchDock","sourcePath":"components/navigation/MxSearchDock.jsx"},{"name":"MxCard","sourcePath":"components/surfaces/MxCard.jsx"},{"name":"MxIconTile","sourcePath":"components/surfaces/MxIconTile.jsx"},{"name":"MxScaffold","sourcePath":"components/surfaces/MxScaffold.jsx"},{"name":"MxSectionHeader","sourcePath":"components/surfaces/MxSectionHeader.jsx"}],"sourceHashes":{"components/core/MxAvatar.jsx":"77f82103b11b","components/core/MxBadge.jsx":"07bf386675b0","components/core/MxButton.jsx":"e7df637928c8","components/core/MxChip.jsx":"94c968ebe110","components/core/MxSegmentedControl.jsx":"2be1cfdf976e","components/core/MxSwitch.jsx":"53390a01a0e2","components/core/MxTextField.jsx":"4de760effa93","components/navigation/MxBottomNav.jsx":"45cf8267b4c2","components/navigation/MxFab.jsx":"24e20dcfc97e","components/navigation/MxIconButton.jsx":"535b0e3e8579","components/navigation/MxSearchDock.jsx":"1b7d16465040","components/surfaces/MxCard.jsx":"de671ecf2c42","components/surfaces/MxIconTile.jsx":"4ce6994a06ec","components/surfaces/MxScaffold.jsx":"063b80fb0b23","components/surfaces/MxSectionHeader.jsx":"fb15552ba535"},"inlinedExternals":[],"unexposedExports":[]} */



(() => {

const __ds_ns = (window.MemoXDesignSystem_2ffa54 = window.MemoXDesignSystem_2ffa54 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/MxAvatar.jsx
try { (() => {
/* MxAvatar — user / entity avatar. Base class: avatar */
function MxAvatar({
  name,
  src,
  size,
  variant,
  ring = false,
  node
}) {
  const cls = ['avatar'];
  if (size && size !== 'md') cls.push('avatar--' + size);
  if (variant) cls.push('avatar--' + variant);
  if (ring) cls.push('avatar--ring');
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '';
  return /*#__PURE__*/React.createElement("span", {
    className: cls.join(' '),
    "data-mx-node": node
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name || ''
  }) : initials);
}
Object.assign(__ds_scope, { MxAvatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/MxAvatar.jsx", error: String((e && e.message) || e) }); }

// components/core/MxBadge.jsx
try { (() => {
/* MxBadge — count / status badge. Base class: badge */
function MxBadge({
  children,
  tone,
  soft = false,
  dot = false,
  node
}) {
  const cls = ['badge'];
  if (tone) cls.push('badge--' + tone);
  if (soft) cls.push('badge--soft');
  if (dot) cls.push('badge--dot');
  return /*#__PURE__*/React.createElement("span", {
    className: cls.join(' '),
    "data-mx-node": node
  }, dot ? null : children);
}
Object.assign(__ds_scope, { MxBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/MxBadge.jsx", error: String((e && e.message) || e) }); }

// components/core/MxButton.jsx
try { (() => {
/* MxButton — text button. Base class: btn (modifiers primary/secondary/outline/ghost) */
function MxButton({
  variant = 'primary',
  size,
  icon,
  trailingIcon,
  block = false,
  danger = false,
  disabled = false,
  node,
  className = '',
  children,
  onClick,
  type = 'button'
}) {
  const cls = ['btn', variant];
  if (size) cls.push('btn--' + size);
  if (block) cls.push('btn--block');
  if (danger) cls.push('danger');
  if (className) cls.push(className);
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    className: cls.join(' '),
    "data-mx-node": node,
    disabled: disabled,
    onClick: onClick
  }, icon ? /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, icon) : null, children ? /*#__PURE__*/React.createElement("span", null, children) : null, trailingIcon ? /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, trailingIcon) : null);
}
Object.assign(__ds_scope, { MxButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/MxButton.jsx", error: String((e && e.message) || e) }); }

// components/core/MxChip.jsx
try { (() => {
/* MxChip — filter / choice chip. Base class: chip */
function MxChip({
  label,
  icon,
  selected = false,
  variant,
  node,
  onClick,
  children
}) {
  const cls = ['chip'];
  if (selected) cls.push('chip--selected');
  if (variant) cls.push('chip--' + variant);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: cls.join(' '),
    "data-mx-node": node,
    onClick: onClick
  }, icon ? /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, icon) : null, label || children);
}
Object.assign(__ds_scope, { MxChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/MxChip.jsx", error: String((e && e.message) || e) }); }

// components/core/MxSegmentedControl.jsx
try { (() => {
/* MxSegmentedControl — segmented toggle. Base class: segmented */
function MxSegmentedControl({
  segments = [],
  value,
  onChange,
  block = false,
  node
}) {
  const cls = ['segmented'];
  if (block) cls.push('segmented--block');
  return /*#__PURE__*/React.createElement("div", {
    className: cls.join(' '),
    "data-mx-node": node,
    role: "radiogroup"
  }, segments.map(s => {
    const v = typeof s === 'string' ? s : s.value;
    const label = typeof s === 'string' ? s : s.label;
    const icon = typeof s === 'object' ? s.icon : null;
    const active = v === value;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      type: "button",
      role: "radio",
      "aria-checked": active,
      "aria-label": label,
      "data-mx-node": node ? `${node}/${v}` : undefined,
      className: ['segmented__seg', active ? 'segmented__seg--active' : ''].filter(Boolean).join(' '),
      onClick: () => onChange && onChange(v)
    }, icon ? /*#__PURE__*/React.createElement("span", {
      className: "material-symbols-rounded"
    }, icon) : null, label);
  }));
}
Object.assign(__ds_scope, { MxSegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/MxSegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/core/MxSwitch.jsx
try { (() => {
/* MxSwitch — on/off toggle. Base class: switch */
function MxSwitch({
  checked = false,
  disabled = false,
  onChange,
  node,
  ariaLabel
}) {
  const cls = ['switch'];
  if (checked) cls.push('switch--on');
  if (disabled) cls.push('switch--disabled');
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": checked,
    "aria-label": ariaLabel,
    disabled: disabled,
    className: cls.join(' '),
    "data-mx-node": node,
    onClick: () => {
      if (disabled) return;
      onChange && onChange(!checked);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "switch__thumb"
  }));
}
Object.assign(__ds_scope, { MxSwitch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/MxSwitch.jsx", error: String((e && e.message) || e) }); }

// components/core/MxTextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* MxTextField — bare inline text input. Base class: field (modifiers center/multiline) */
function MxTextField({
  value,
  placeholder,
  multiline = false,
  rows = 3,
  align = 'start',
  autoFocus = false,
  node,
  className = '',
  onChange
}) {
  const cls = ['field'];
  if (align === 'center') cls.push('field--center');
  if (multiline) cls.push('field--multiline');
  if (className) cls.push(className);
  const props = {
    className: cls.join(' '),
    placeholder,
    value,
    autoFocus,
    onChange,
    'data-mx-node': node
  };
  return multiline ? /*#__PURE__*/React.createElement("textarea", _extends({}, props, {
    rows: rows
  })) : /*#__PURE__*/React.createElement("input", _extends({}, props, {
    type: "text"
  }));
}
Object.assign(__ds_scope, { MxTextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/MxTextField.jsx", error: String((e && e.message) || e) }); }

// components/navigation/MxBottomNav.jsx
try { (() => {
/* MxBottomNav — bottom tab bar. Base class: bottom-nav */
function MxBottomNav({
  items = [],
  value,
  onChange,
  node
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: "bottom-nav",
    "data-mx-node": node
  }, items.map(it => {
    const active = it.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      type: "button",
      className: ['bottom-nav__item', active ? 'bottom-nav__item--active' : ''].filter(Boolean).join(' '),
      onClick: () => onChange && onChange(it.id)
    }, /*#__PURE__*/React.createElement("span", {
      className: "bottom-nav__icon"
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-symbols-rounded"
    }, it.icon)), /*#__PURE__*/React.createElement("span", null, it.label));
  }));
}
Object.assign(__ds_scope, { MxBottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/MxBottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/MxFab.jsx
try { (() => {
/* MxFab — floating action button. Base class: fab */
function MxFab({
  icon,
  label,
  variant,
  round = false,
  node,
  onClick
}) {
  const cls = ['fab'];
  if (variant) cls.push('fab--' + variant);
  if (round || !label) cls.push('fab--round');
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: cls.join(' '),
    "data-mx-node": node,
    onClick: onClick
  }, icon ? /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, icon) : null, label ? /*#__PURE__*/React.createElement("span", null, label) : null);
}
Object.assign(__ds_scope, { MxFab });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/MxFab.jsx", error: String((e && e.message) || e) }); }

// components/navigation/MxIconButton.jsx
try { (() => {
/* MxIconButton — icon-only button. Base class: icon-btn */
function MxIconButton({
  icon,
  variant,
  size,
  node,
  className = '',
  onClick,
  ariaLabel
}) {
  const cls = ['icon-btn'];
  if (variant && variant !== 'plain') cls.push('icon-btn--' + variant);
  if (size === 'sm') cls.push('icon-btn--sm');
  if (className) cls.push(className);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: cls.join(' '),
    "data-mx-node": node,
    onClick: onClick,
    "aria-label": ariaLabel || icon
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, icon));
}
Object.assign(__ds_scope, { MxIconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/MxIconButton.jsx", error: String((e && e.message) || e) }); }

// components/navigation/MxSearchDock.jsx
try { (() => {
/* MxSearchDock — pill search field. Base class: search-dock */
function MxSearchDock({
  placeholder = 'Search',
  value,
  onChange,
  focused = false,
  flat = false,
  trailing,
  node
}) {
  const cls = ['search-dock'];
  if (focused) cls.push('search-dock--focused');
  if (flat) cls.push('search-dock--flat');
  return /*#__PURE__*/React.createElement("div", {
    className: cls.join(' '),
    "data-mx-node": node
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, "search"), /*#__PURE__*/React.createElement("input", {
    className: "search-dock__input",
    placeholder: placeholder,
    value: value,
    onChange: onChange
  }), trailing);
}
Object.assign(__ds_scope, { MxSearchDock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/MxSearchDock.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/MxCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* MxCard — surface container. Base class: card */
function MxCard({
  variant,
  interactive = false,
  padding,
  node,
  className = '',
  children,
  onClick,
  style,
  ariaLabel
}) {
  const cls = ['card'];
  if (variant && variant !== 'elevated') cls.push('card--' + variant);
  if (interactive) cls.push('card--interactive');
  if (padding && padding !== 'md') cls.push('card--pad-' + padding);
  if (className) cls.push(className);
  // When the card is actionable, give it real button semantics + keyboard
  // support (Enter/Space) without changing the tag (keeps the visual identical).
  const actionable = typeof onClick === 'function';
  const a11y = actionable ? {
    role: 'button',
    tabIndex: 0,
    'aria-label': ariaLabel,
    onKeyDown: e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    }
  } : {};
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls.join(' '),
    "data-mx-node": node,
    onClick: onClick,
    style: style
  }, a11y), children);
}
Object.assign(__ds_scope, { MxCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/MxCard.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/MxIconTile.jsx
try { (() => {
/* MxIconTile — rounded color tile holding a glyph. Base class: icon-tile */
function MxIconTile({
  icon,
  tone,
  size,
  solid = false,
  node,
  className = ''
}) {
  const cls = ['icon-tile'];
  if (tone) cls.push('icon-tile--' + tone);
  if (size === 'lg') cls.push('icon-tile--lg');
  if (solid) cls.push('icon-tile--solid');
  if (className) cls.push(className);
  return /*#__PURE__*/React.createElement("span", {
    className: cls.join(' '),
    "data-mx-node": node
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, icon));
}
Object.assign(__ds_scope, { MxIconTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/MxIconTile.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/MxScaffold.jsx
try { (() => {
/* MxScaffold — phone app shell. Base class: app */
function MxScaffold({
  appBar,
  bottomNav,
  fab,
  children,
  flush = false,
  node,
  className = '',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['app', className].filter(Boolean).join(' '),
    "data-mx-node": node,
    style: style
  }, appBar, /*#__PURE__*/React.createElement("div", {
    className: ['app__body', flush ? 'app__body--flush' : '', fab ? 'app__body--with-fab' : ''].filter(Boolean).join(' ')
  }, children), fab ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 'var(--memox-gutter)',
      bottom: 'calc(var(--memox-bottom-nav-height) + var(--memox-space-4))',
      zIndex: 11
    }
  }, fab) : null, bottomNav);
}
Object.assign(__ds_scope, { MxScaffold });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/MxScaffold.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/MxSectionHeader.jsx
try { (() => {
/* MxSectionHeader — list/section label row. Base class: section-head */
function MxSectionHeader({
  title,
  caption,
  action,
  onAction,
  node
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "section-head",
    "data-mx-node": node
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head__text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head__title"
  }, title), caption ? /*#__PURE__*/React.createElement("div", {
    className: "section-head__caption"
  }, caption) : null), action ? /*#__PURE__*/React.createElement("span", {
    className: "section-head__action",
    onClick: onAction,
    role: "button",
    tabIndex: 0
  }, action) : null);
}
Object.assign(__ds_scope, { MxSectionHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/MxSectionHeader.jsx", error: String((e && e.message) || e) }); }


__ds_ns.MxAvatar = __ds_scope.MxAvatar;

__ds_ns.MxBadge = __ds_scope.MxBadge;

__ds_ns.MxButton = __ds_scope.MxButton;

__ds_ns.MxChip = __ds_scope.MxChip;

__ds_ns.MxSegmentedControl = __ds_scope.MxSegmentedControl;

__ds_ns.MxSwitch = __ds_scope.MxSwitch;

__ds_ns.MxTextField = __ds_scope.MxTextField;

__ds_ns.MxBottomNav = __ds_scope.MxBottomNav;

__ds_ns.MxFab = __ds_scope.MxFab;

__ds_ns.MxIconButton = __ds_scope.MxIconButton;

__ds_ns.MxSearchDock = __ds_scope.MxSearchDock;


__ds_ns.MxCard = __ds_scope.MxCard;

__ds_ns.MxIconTile = __ds_scope.MxIconTile;

__ds_ns.MxScaffold = __ds_scope.MxScaffold;

__ds_ns.MxSectionHeader = __ds_scope.MxSectionHeader;








































































})();
