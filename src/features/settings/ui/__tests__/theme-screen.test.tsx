/**
 * Render smoke for the theme settings screen (WBS 2.3).
 */

import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/design-system';
import { ThemeScreen } from '@/features/settings/ui';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>
        <ThemeScreen onBack={() => {}} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('ThemeScreen (WBS 2.3)', () => {
  it('renders the appearance, accent, text-size controls and a live preview', () => {
    const { getByText, getByTestId, getByLabelText } = renderScreen();
    expect(getByText('Appearance')).toBeTruthy();
    expect(getByTestId('theme/appearance')).toBeTruthy();
    expect(getByLabelText('Green')).toBeTruthy(); // an accent swatch
    expect(getByTestId('theme/text-size')).toBeTruthy();
    expect(getByTestId('theme/preview')).toBeTruthy();
    expect(getByText('Start review')).toBeTruthy();
  });

  it('lets the user switch appearance (live)', () => {
    const { getByTestId } = renderScreen();
    // Switching to Dark should not throw; the screen reskins from the theme.
    fireEvent.press(getByTestId('theme/appearance/dark'));
    expect(getByTestId('theme/screen')).toBeTruthy();
  });
});
