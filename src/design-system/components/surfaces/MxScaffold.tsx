/**
 * MxScaffold (WBS 1.5) — base class `app` (ADR 0004). The screen shell: a safe-area
 * column with an app bar, a scrolling body (screen padding + section gap), an
 * optional bottom nav, and an optional floating FAB. `flush` drops the body's
 * horizontal padding for edge-to-edge content.
 */

import { useContext } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import { useTheme } from '../../theme';

export interface MxScaffoldProps {
  appBar?: ReactNode;
  bottomNav?: ReactNode;
  fab?: ReactNode;
  children?: ReactNode;
  flush?: boolean;
  node?: string;
  style?: StyleProp<ViewStyle>;
}

export function MxScaffold({ appBar, bottomNav, fab, children, flush = false, node, style }: MxScaffoldProps) {
  const t = useTheme();
  const insets = useContext(SafeAreaInsetsContext);
  const fabBottom = t.layout.bottomNavHeight + t.space[4];
  // Kit: `--memox-safe-area-top: max(env(safe-area-inset-top), 24px)` — 24px floor.
  const topInset = Math.max(insets?.top ?? 0, t.layout.safeAreaTopFallback);

  return (
    <View testID={node} style={[{ flex: 1, paddingTop: topInset, backgroundColor: t.color.bg }, style]}>
      {appBar}
      <View style={{ flex: 1, minHeight: 0 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1, // lets a flex:1 child (EmptyState, tall study cards) fill the body like the kit
            paddingHorizontal: flush ? 0 : t.layout.gutter,
            paddingTop: t.space[4],
            paddingBottom: fab
              ? t.layout.bottomNavHeight + t.space[4] + t.layout.fabSize + t.space[6]
              : t.layout.bottomNavHeight + t.space[6],
            gap: t.space[6],
          }}
        >
          {children}
        </ScrollView>
        {fab !== undefined && fab !== null && (
          <View style={{ position: 'absolute', right: t.layout.gutter, bottom: fabBottom }}>{fab}</View>
        )}
      </View>
      {bottomNav}
    </View>
  );
}
