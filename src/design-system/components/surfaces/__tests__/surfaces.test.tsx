/**
 * Render smoke tests for the surface primitives (WBS 1.5).
 * The full fixtures + a11y + token-parity suite for all 18 primitives is owned by
 * WBS 1.8; this proves each surface component mounts under the theme and exposes its
 * `node` → `testID`.
 */

import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { ReactElement } from 'react';

import {
  ThemeProvider,
  MxScaffold,
  MxContextualAppBar,
  MxCard,
  MxSectionHeader,
  MxIconTile,
  MxList,
} from '@/design-system';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderThemed(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('surface primitives (WBS 1.5)', () => {
  it('MxCard renders and is pressable when onPress is set', () => {
    const { getByTestId } = renderThemed(
      <MxCard node="t/card" variant="primary" onPress={() => {}} accessibilityLabel="Card">
        <Text>Body</Text>
      </MxCard>,
    );
    expect(getByTestId('t/card')).toBeTruthy();
  });

  it('MxList stacks children with a token gap', () => {
    const { getByTestId } = renderThemed(
      <MxList node="t/list">
        <Text>a</Text>
        <Text>b</Text>
      </MxList>,
    );
    expect(getByTestId('t/list')).toBeTruthy();
  });

  it('MxSectionHeader renders title, caption and action', () => {
    const { getByText } = renderThemed(
      <MxSectionHeader title="Today" caption="3 due" action actionLabel="See all" onAction={() => {}} />,
    );
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('See all')).toBeTruthy();
  });

  it('MxIconTile renders a glyph for each tone', () => {
    const { getByTestId } = renderThemed(<MxIconTile node="t/tile" icon="bolt" tone="accent" size="lg" />);
    expect(getByTestId('t/tile')).toBeTruthy();
  });

  it('MxContextualAppBar renders title + context', () => {
    const { getByText } = renderThemed(<MxContextualAppBar node="t/bar" title="Library" context="Decks" />);
    expect(getByText('Library')).toBeTruthy();
    expect(getByText('Decks')).toBeTruthy();
  });

  it('MxScaffold hosts an app bar and body', () => {
    const { getByTestId, getByText } = renderThemed(
      <MxScaffold node="t/app" appBar={<MxContextualAppBar node="t/appbar" title="Home" />}>
        <Text>Content</Text>
      </MxScaffold>,
    );
    expect(getByTestId('t/app')).toBeTruthy();
    expect(getByText('Content')).toBeTruthy();
  });
});
