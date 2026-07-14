/**
 * AppScreen (WBS 2.1) — the standard screen shell: a top-safe-area column with a
 * fixed root app bar that elevates once the body scrolls, a scrolling content region
 * (screen padding + section gap), and an optional floating FAB. The bottom nav is
 * owned by the tab navigator (`(tabs)/_layout`), not this shell, so it composes for
 * both tab and non-tab screens.
 */

import { useContext, useState } from 'react';
import {
  ScrollView,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import { useTheme } from '../theme';
import { MxContextualAppBar, type MxAppBarVariant } from './surfaces';

export interface AppScreenProps {
  title?: string;
  context?: string;
  variant?: MxAppBarVariant;
  leading?: ReactNode;
  actions?: ReactNode;
  /** Custom app-bar main content (e.g. a search dock for the `search` variant). */
  main?: ReactNode;
  /** Selection count for the `selection` variant (→ "N selected"). */
  count?: number;
  /**
   * The screen sits inside the tab shell, where a REAL bottom nav view already
   * occupies the nav band — the body then only pads the section gap (+ FAB
   * clearance), instead of the kit's reserved-band padding.
   */
  inTabs?: boolean;
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
  main,
  count,
  inTabs = false,
  fab,
  children,
  node,
  contentStyle,
}: AppScreenProps) {
  const t = useTheme();
  const insets = useContext(SafeAreaInsetsContext);
  const [scrolled, setScrolled] = useState(false);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const past = e.nativeEvent.contentOffset.y > SCROLL_ELEVATE_THRESHOLD;
    setScrolled((prev) => (prev === past ? prev : past));
  };

  // Kit: `--memox-safe-area-top: max(env(safe-area-inset-top), 24px)` — a fixed 24px
  // floor even where the platform reports no inset (web, older devices).
  const topInset = Math.max(insets?.top ?? 0, t.layout.safeAreaTopFallback);

  return (
    <View testID={node} style={{ flex: 1, paddingTop: topInset, backgroundColor: t.color.bg }}>
      <MxContextualAppBar
        variant={variant}
        title={title}
        context={context}
        main={main}
        count={count}
        leading={leading}
        actions={actions}
        scrolled={scrolled}
        node={node ? `${node}/appbar` : undefined}
      />
      <View style={{ flex: 1, minHeight: 0 }}>
        <ScrollView
          testID={node ? `${node}/scroll` : undefined}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            {
              flexGrow: 1, // lets a flex:1 child (EmptyState, tall study cards) fill the body like the kit
              paddingHorizontal: t.layout.gutter,
              paddingTop: t.space[4],
              // Kit `.app__body`: bottom padding ALWAYS reserves the bottom-nav band
              // (+ the FAB clearance when present); screens that need the space back
              // reclaim it with a negative margin, exactly like the kit.
              paddingBottom: inTabs
                ? fab
                  ? t.space[4] + t.layout.fabSize + t.space[6]
                  : t.space[6]
                : fab
                  ? t.layout.bottomNavHeight + t.space[4] + t.layout.fabSize + t.space[6]
                  : t.layout.bottomNavHeight + t.space[6],
              gap: t.space[6],
            },
            contentStyle,
          ]}
        >
          {children}
        </ScrollView>
        {fab !== undefined && fab !== null && (
          // Kit: the FAB parks above the bottom-nav band (nav + space-4) even on
          // screens without a nav; inside the tab shell the real nav already lifts
          // the body, so space-4 from the body floor lands on the same spot.
          <View
            style={{
              position: 'absolute',
              right: t.layout.gutter,
              bottom: inTabs ? t.space[4] : t.layout.bottomNavHeight + t.space[4],
            }}
          >
            {fab}
          </View>
        )}
      </View>
    </View>
  );
}
