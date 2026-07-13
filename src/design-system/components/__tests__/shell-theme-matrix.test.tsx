/**
 * Shell + theme state matrix (WBS 2.4). Covers every app-bar state and every theme
 * dimension (mode × accent × text-scale), plus the shell interactions (scroll →
 * app-bar elevation, live theme reskin) and the shell testID anchors.
 */

import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { ReactElement, ReactNode } from 'react';

import {
  ThemeProvider,
  AppScreen,
  MxIconButton,
  MxSearchDock,
  useTheme,
  themes,
  tokens,
  type AccentChoice,
  type ThemeMode,
} from '@/design-system';
import { ThemeScreen } from '@/features/settings/ui';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function wrap(ui: ReactNode, opts: { mode?: ThemeMode; accent?: AccentChoice; textScale?: number } = {}) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={opts.mode} initialAccent={opts.accent} initialTextScale={opts.textScale}>
        {ui}
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

function flat<T extends ViewStyle | TextStyle>(style: unknown): T {
  return (StyleSheet.flatten(style as T) ?? {}) as T;
}

/** A probe that surfaces the active theme values as queryable text. */
function ThemeProbe() {
  const t = useTheme();
  return (
    <>
      <Text testID="probe/bg">{t.color.bg}</Text>
      <Text testID="probe/accent">{t.color.accent}</Text>
      <Text testID="probe/base">{String(t.font.text({ size: 'base' }).fontSize)}</Text>
    </>
  );
}

const text = (node: { props: Record<string, unknown> }) => String(node.props.children);

describe('theme matrix — mode (WBS 2.4)', () => {
  it('light vs dark resolve their canvas tokens', () => {
    expect(text(wrap(<ThemeProbe />, { mode: 'light' }).getByTestId('probe/bg'))).toBe(themes.light.color.bg);
    expect(text(wrap(<ThemeProbe />, { mode: 'dark' }).getByTestId('probe/bg'))).toBe(themes.dark.color.bg);
  });
});

describe('theme matrix — accent (WBS 2.4)', () => {
  it.each<[AccentChoice, string]>([
    ['brand', tokens.color.light.accent],
    ['green', tokens.paletteAccents.green],
    ['coral', tokens.paletteAccents.coral],
    ['cyan', tokens.paletteAccents.cyan],
  ])('accent %s resolves to its colour', (accent, expected) => {
    expect(text(wrap(<ThemeProbe />, { accent }).getByTestId('probe/accent'))).toBe(expected);
  });
});

describe('theme matrix — text scale (WBS 2.4)', () => {
  it.each<[number, number]>([
    [0.9, Math.round(15 * 0.9)],
    [1, 15],
    [1.15, Math.round(15 * 1.15)],
  ])('scale %s sizes the base type', (scale, expected) => {
    expect(text(wrap(<ThemeProbe />, { textScale: scale }).getByTestId('probe/base'))).toBe(String(expected));
  });
});

describe('shell app-bar state matrix (WBS 2.4)', () => {
  const back = <MxIconButton icon="arrow_back" accessibilityLabel="Back" />;
  const states: [string, ReactElement][] = [
    ['root', <AppScreen node="s" variant="root" title="Today" key="1" />],
    ['nested', <AppScreen node="s" variant="nested" leading={back} context="Spanish" title="Verbs" key="2" />],
    ['search', <AppScreen node="s" variant="search" leading={back} key="3" />],
    ['selection', <AppScreen node="s" variant="selection" title="x" key="4" />],
    ['modal', <AppScreen node="s" variant="modal" title="New card" key="5" />],
  ];
  it.each(states)('%s renders with its app-bar + scroll anchor', (_name, ui) => {
    const { getByTestId, unmount } = wrap(ui);
    expect(getByTestId('s')).toBeTruthy();
    expect(getByTestId('s/appbar')).toBeTruthy();
    expect(getByTestId('s/scroll')).toBeTruthy();
    unmount();
  });

  it('renders in dark mode too', () => {
    const { getByTestId } = wrap(<AppScreen node="s" variant="root" title="Today" />, { mode: 'dark' });
    expect(getByTestId('s')).toBeTruthy();
  });
});

describe('shell interactions (WBS 2.4)', () => {
  it('scrolling the body elevates the app bar (transparent → surface)', () => {
    const { getByTestId } = wrap(<AppScreen node="s" variant="root" title="Today" />, { mode: 'light' });
    expect(flat<ViewStyle>(getByTestId('s/appbar').props.style).backgroundColor).toBe('transparent');
    fireEvent.scroll(getByTestId('s/scroll'), { nativeEvent: { contentOffset: { y: 40 } } });
    expect(flat<ViewStyle>(getByTestId('s/appbar').props.style).backgroundColor).toBe(themes.light.color.surface);
  });

  it('search variant hosts a working search dock', () => {
    const { getByPlaceholderText } = wrap(
      <AppScreen node="s" variant="search" main={<MxSearchDock flat placeholder="Search words" />} />,
    );
    expect(getByPlaceholderText('Search words')).toBeTruthy();
  });

  it('theme screen reskins live when appearance changes', () => {
    const { getByTestId } = render(
      <SafeAreaProvider initialMetrics={metrics}>
        <ThemeProvider initialMode="light">
          <ThemeProbe />
          <ThemeScreen onBack={() => {}} />
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    expect(text(getByTestId('probe/bg'))).toBe(themes.light.color.bg);
    fireEvent.press(getByTestId('theme/appearance/dark'));
    expect(text(getByTestId('probe/bg'))).toBe(themes.dark.color.bg);
  });
});
