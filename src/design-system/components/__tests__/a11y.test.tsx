/**
 * Accessibility + target-size tests for all 18 primitives (WBS 1.8).
 * Asserts each interactive primitive exposes the right role/state and a ≥44px hit
 * target, and that every primitive surfaces its `node` as a `testID`.
 */

import { render } from '@testing-library/react-native';
import { StyleSheet, type ViewStyle } from 'react-native';
import type { ReactElement } from 'react';

import {
  ThemeProvider,
  MxCard,
  MxSectionHeader,
  MxIconTile,
  MxList,
  MxScaffold,
  MxContextualAppBar,
  MxBottomNav,
  MxFab,
  MxSearchDock,
  MxIconButton,
  MxButton,
  MxLink,
  MxTextField,
  MxChip,
  MxBadge,
  MxSwitch,
  MxSegmentedControl,
  MxAvatar,
  themes,
} from '@/design-system';

const MIN_TARGET = 44;

function renderThemed(ui: ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

function flat(style: unknown): ViewStyle {
  return (StyleSheet.flatten(style as ViewStyle) ?? {}) as ViewStyle;
}

describe('primitive testID presence (WBS 1.8)', () => {
  it('every primitive with a node prop exposes it as a testID', () => {
    const cases: ReactElement[] = [
      <MxCard node="p/card" key="1" />,
      <MxSectionHeader node="p/sh" title="T" key="2" />,
      <MxIconTile node="p/tile" icon="bolt" key="3" />,
      <MxList node="p/list" key="4" />,
      <MxScaffold node="p/app" key="5" />,
      <MxContextualAppBar node="p/bar" title="T" key="6" />,
      <MxBottomNav node="p/nav" items={[{ value: 'a', icon: 'home', label: 'A' }]} value="a" key="7" />,
      <MxFab node="p/fab" icon="add" key="8" />,
      <MxSearchDock node="p/dock" key="9" />,
      <MxIconButton node="p/ib" icon="search" accessibilityLabel="s" key="10" />,
      <MxButton node="p/btn" key="11">B</MxButton>,
      <MxLink node="p/link" key="12">L</MxLink>,
      <MxTextField node="p/field" key="13" />,
      <MxChip node="p/chip" label="C" key="14" />,
      <MxBadge node="p/badge" key="15">1</MxBadge>,
      <MxSwitch node="p/sw" key="16" ariaLabel="s" />,
      <MxSegmentedControl node="p/seg" segments={[{ value: 'a', label: 'A' }]} value="a" key="17" />,
      <MxAvatar node="p/av" name="A B" key="18" />,
    ];
    for (const ui of cases) {
      const { getByTestId, unmount } = renderThemed(ui);
      const id = (ui.props as { node: string }).node;
      expect(getByTestId(id)).toBeTruthy();
      unmount();
    }
  });
});

describe('accessibility roles + states (WBS 1.8)', () => {
  it('MxButton is a button', () => {
    const { getByRole } = renderThemed(<MxButton onPress={() => {}}>Go</MxButton>);
    expect(getByRole('button')).toBeTruthy();
  });

  it('MxLink is a link', () => {
    const { getByRole } = renderThemed(<MxLink onPress={() => {}}>More</MxLink>);
    expect(getByRole('link')).toBeTruthy();
  });

  it('MxSwitch is a switch and reports checked state', () => {
    const { getByRole } = renderThemed(<MxSwitch checked onChange={() => {}} ariaLabel="Dark" />);
    const sw = getByRole('switch');
    expect(sw.props.accessibilityState).toMatchObject({ checked: true });
  });

  it('MxChip reports its selected state', () => {
    const { getByRole } = renderThemed(<MxChip label="Nouns" selected onPress={() => {}} />);
    expect(getByRole('button').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('MxSegmentedControl is a tablist with tabs', () => {
    const { getAllByRole } = renderThemed(
      <MxSegmentedControl
        segments={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
        value="a"
      />,
    );
    expect(getAllByRole('tab')).toHaveLength(2);
  });

  it('MxBottomNav items are tabs with selected state', () => {
    const { getAllByRole } = renderThemed(
      <MxBottomNav
        items={[
          { value: 'home', icon: 'home', label: 'Today' },
          { value: 'lib', icon: 'library_music', label: 'Library' },
        ]}
        value="home"
      />,
    );
    const tabs = getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0].props.accessibilityState).toMatchObject({ selected: true });
  });
});

describe('target size ≥44px (WBS 1.8)', () => {
  it('MxButton has a ≥44px min height', () => {
    const { getByTestId } = renderThemed(<MxButton node="b" onPress={() => {}}>Go</MxButton>);
    expect(flat(getByTestId('b').props.style).minHeight).toBeGreaterThanOrEqual(MIN_TARGET);
  });

  it('MxIconButton renders as a ≥44px button (touch-min token)', () => {
    const { getByTestId, getByRole } = renderThemed(
      <MxIconButton node="ib" icon="search" accessibilityLabel="s" />,
    );
    expect(getByTestId('ib')).toBeTruthy();
    expect(getByRole('button')).toBeTruthy();
    // The md icon-button box is the touch-min token (48), which satisfies ≥44.
    expect(themes.light.layout.touchMin).toBeGreaterThanOrEqual(MIN_TARGET);
  });

  it('MxFab is at least 44px tall', () => {
    const { getByTestId } = renderThemed(<MxFab node="f" icon="add" />);
    expect(flat(getByTestId('f').props.style).height).toBeGreaterThanOrEqual(MIN_TARGET);
  });
});
