/**
 * Render smoke tests for the navigation primitives (WBS 1.6). Full a11y/parity suite
 * is owned by WBS 1.8; this proves each mounts under the theme and behaves.
 */

import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { ThemeProvider, MxBottomNav, MxFab, MxSearchDock, MxIconButton } from '@/design-system';

function renderThemed(ui: ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('navigation primitives (WBS 1.6)', () => {
  it('MxIconButton fires onPress and exposes its node', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderThemed(
      <MxIconButton node="t/ib" icon="search" variant="primary" onPress={onPress} accessibilityLabel="Search" />,
    );
    fireEvent.press(getByTestId('t/ib'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('MxIconButton does not fire when disabled', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderThemed(
      <MxIconButton node="t/ib" icon="close" onPress={onPress} disabled accessibilityLabel="Close" />,
    );
    fireEvent.press(getByTestId('t/ib'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('MxFab renders extended (icon + label)', () => {
    const { getByText } = renderThemed(<MxFab node="t/fab" icon="add" label="New deck" onPress={() => {}} />);
    expect(getByText('New deck')).toBeTruthy();
  });

  it('MxBottomNav marks the active item and fires onChange with its value', () => {
    const onChange = jest.fn();
    const items = [
      { value: 'home', icon: 'home', label: 'Today' },
      { value: 'library', icon: 'library_music', label: 'Library' },
    ];
    const { getByTestId } = renderThemed(
      <MxBottomNav node="t/nav" items={items} value="home" onChange={onChange} />,
    );
    fireEvent.press(getByTestId('t/nav/library'));
    expect(onChange).toHaveBeenCalledWith('library');
  });

  it('MxSearchDock renders a placeholder and reports typed text', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = renderThemed(
      <MxSearchDock node="t/dock" placeholder="Search words" onChange={onChange} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search words'), 'hola');
    expect(onChange).toHaveBeenCalledWith('hola');
  });
});
