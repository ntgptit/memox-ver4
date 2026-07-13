/**
 * AppScreen (WBS 2.1) — the standard screen shell: a top-safe-area column with a
 * fixed root app bar that elevates once the body scrolls, a scrolling content region
 * (screen padding + section gap), and an optional floating FAB. The bottom nav is
 * owned by the tab navigator (`(tabs)/_layout`), not this shell, so it composes for
 * both tab and non-tab screens.
 */

import { useState } from 'react';
import {
  ScrollView,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import { useTheme } from '../theme';
import { MxContextualAppBar, type MxAppBarVariant } from './surfaces';

export interface AppScreenProps {
  title?: string;
  context?: string;
  variant?: MxAppBarVariant;
  leading?: ReactNode;
  actions?: ReactNode;
  fab?: ReactNode;
  children?: ReactNode;
  node?: string;
  contentStyle?: StyleProp<ViewStyle>;
}

const SCROLL_ELEVATE_THRESHOLD = 4;

export function AppScreen({
  title,
  context,
  variant = 'root',
  leading,
  actions,
  fab,
  children,
  node,
  contentStyle,
}: AppScreenProps) {
  const t = useTheme();
  const [scrolled, setScrolled] = useState(false);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const past = e.nativeEvent.contentOffset.y > SCROLL_ELEVATE_THRESHOLD;
    setScrolled((prev) => (prev === past ? prev : past));
  };

  return (
    <SafeAreaView edges={['top']} testID={node} style={{ flex: 1, backgroundColor: t.color.bg }}>
      <MxContextualAppBar
        variant={variant}
        title={title}
        context={context}
        leading={leading}
        actions={actions}
        scrolled={scrolled}
        node={node ? `${node}/appbar` : undefined}
      />
      <View style={{ flex: 1, minHeight: 0 }}>
        <ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            {
              paddingHorizontal: t.layout.gutter,
              paddingTop: t.space[4],
              paddingBottom: fab ? t.space[4] + t.layout.fabSize + t.space[6] : t.space[6],
              gap: t.space[6],
            },
            contentStyle,
          ]}
        >
          {children}
        </ScrollView>
        {fab !== undefined && fab !== null && (
          <View style={{ position: 'absolute', right: t.layout.gutter, bottom: t.space[4] }}>{fab}</View>
        )}
      </View>
    </SafeAreaView>
  );
}
