/**
 * Render smoke test for the AppScreen shell (WBS 2.1).
 */

import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppScreen, MxFab, ThemeProvider } from '@/design-system';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

describe('AppScreen shell (WBS 2.1)', () => {
  it('renders the app bar title, body, and fab', () => {
    const { getByText, getByTestId } = render(
      <SafeAreaProvider initialMetrics={metrics}>
        <ThemeProvider>
          <AppScreen node="s/screen" title="Today" fab={<MxFab node="s/fab" icon="add" accessibilityLabel="Add" />}>
            <Text>Body content</Text>
          </AppScreen>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    expect(getByTestId('s/screen')).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('Body content')).toBeTruthy();
    expect(getByTestId('s/fab')).toBeTruthy();
  });

  it('exposes the app bar under the screen node', () => {
    const { getByTestId } = render(
      <SafeAreaProvider initialMetrics={metrics}>
        <ThemeProvider>
          <AppScreen node="s/screen" title="Today">
            <Text>Body</Text>
          </AppScreen>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    expect(getByTestId('s/screen/appbar')).toBeTruthy();
  });
});
