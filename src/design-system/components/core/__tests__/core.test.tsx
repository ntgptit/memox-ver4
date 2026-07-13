/**
 * Render smoke tests for the core primitives (WBS 1.7). Full a11y/parity suite is
 * owned by WBS 1.8; this proves each mounts under the theme and behaves.
 */

import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import {
  ThemeProvider,
  MxButton,
  MxLink,
  MxTextField,
  MxChip,
  MxBadge,
  MxSwitch,
  MxSegmentedControl,
  MxAvatar,
} from '@/design-system';

function renderThemed(ui: ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('core primitives (WBS 1.7)', () => {
  it('MxButton fires onPress; not when disabled', () => {
    const onPress = jest.fn();
    const { getByTestId, rerender } = renderThemed(
      <MxButton node="t/btn" variant="primary" icon="bolt" onPress={onPress}>
        Start review
      </MxButton>,
    );
    fireEvent.press(getByTestId('t/btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
    rerender(
      <ThemeProvider>
        <MxButton node="t/btn" onPress={onPress} disabled>
          Start review
        </MxButton>
      </ThemeProvider>,
    );
    fireEvent.press(getByTestId('t/btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('MxLink renders label + default chevron', () => {
    const { getByText } = renderThemed(<MxLink onPress={() => {}}>See all</MxLink>);
    expect(getByText('See all')).toBeTruthy();
  });

  it('MxTextField shows the error message + reports typed text', () => {
    const onChangeText = jest.fn();
    const { getByText, getByTestId } = renderThemed(
      <MxTextField node="t/field" label="Term" error="Required" onChangeText={onChangeText} />,
    );
    expect(getByText('Required')).toBeTruthy();
    fireEvent.changeText(getByTestId('t/field'), 'hola');
    expect(onChangeText).toHaveBeenCalledWith('hola');
  });

  it('MxChip toggles selection via onPress', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderThemed(<MxChip node="t/chip" label="Nouns" selected onPress={onPress} />);
    fireEvent.press(getByTestId('t/chip'));
    expect(onPress).toHaveBeenCalled();
  });

  it('MxBadge renders its count', () => {
    const { getByText } = renderThemed(<MxBadge tone="error">3</MxBadge>);
    expect(getByText('3')).toBeTruthy();
  });

  it('MxSwitch reports the toggled value', () => {
    const onChange = jest.fn();
    const { getByTestId } = renderThemed(<MxSwitch node="t/sw" checked={false} onChange={onChange} ariaLabel="Dark" />);
    fireEvent.press(getByTestId('t/sw'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('MxSegmentedControl fires onChange with the segment value', () => {
    const onChange = jest.fn();
    const segs = [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
    ];
    const { getByTestId } = renderThemed(
      <MxSegmentedControl node="t/seg" segments={segs} value="light" onChange={onChange} />,
    );
    fireEvent.press(getByTestId('t/seg/dark'));
    expect(onChange).toHaveBeenCalledWith('dark');
  });

  it('MxAvatar renders initials from a name', () => {
    const { getByText } = renderThemed(<MxAvatar name="Linh Nguyen" />);
    expect(getByText('LN')).toBeTruthy();
  });
});
