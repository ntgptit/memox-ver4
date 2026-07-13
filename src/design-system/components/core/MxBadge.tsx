/**
 * MxBadge (WBS 1.7) — base class `badge` (ADR 0004). A small status pill or count.
 * `tone` sets the colour family; `soft` uses the tint; `dot` is a tiny marker.
 */

import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme, type Theme } from '../../theme';

export type MxBadgeTone = 'primary' | 'accent' | 'success' | 'warning' | 'error';

export interface MxBadgeProps {
  children?: ReactNode;
  tone?: MxBadgeTone;
  soft?: boolean;
  dot?: boolean;
  node?: string;
}

function badgeColors(t: Theme, tone: MxBadgeTone, soft: boolean): { bg: string; fg: string } {
  const solid: Record<MxBadgeTone, { bg: string; fg: string }> = {
    primary: { bg: t.color.primary, fg: t.color.onPrimary },
    accent: { bg: t.color.accent, fg: t.color.onAccent },
    success: { bg: t.color.success, fg: t.color.onSuccess },
    warning: { bg: t.color.warning, fg: t.color.onWarning },
    error: { bg: t.color.error, fg: t.color.onError },
  };
  const softMap: Record<MxBadgeTone, { bg: string; fg: string }> = {
    primary: { bg: t.color.primarySoft, fg: t.color.onPrimarySoft },
    accent: { bg: t.color.accentSoft, fg: t.color.accent },
    success: { bg: t.color.successSoft, fg: t.color.onSuccessSoft },
    warning: { bg: t.color.warningSoft, fg: t.color.onWarningSoft },
    error: { bg: t.color.errorSoft, fg: t.color.onErrorSoft },
  };
  return soft ? softMap[tone] : solid[tone];
}

export function MxBadge({ children, tone = 'primary', soft = false, dot = false, node }: MxBadgeProps) {
  const t = useTheme();
  const { bg, fg } = badgeColors(t, tone, soft);

  if (dot) {
    return (
      <View
        testID={node}
        accessibilityElementsHidden
        style={{ width: t.comp.badgeDot, height: t.comp.badgeDot, borderRadius: t.radius.pill, backgroundColor: bg }}
      />
    );
  }

  return (
    <View
      testID={node}
      style={{
        minWidth: t.comp.badgeMinWidth,
        height: t.comp.badgeHeight,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: t.comp.badgePadX,
        borderRadius: t.radius.pill,
        backgroundColor: bg,
      }}
    >
      <Text style={[t.font.text({ size: 'xs', weight: 'bold' }), { color: fg }]}>{children}</Text>
    </View>
  );
}
