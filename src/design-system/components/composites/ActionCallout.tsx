/**
 * ActionCallout — shared composite, ported from the kit's `_shared/ActionCallout.jsx`
 * (`window.ActionCallout`): a soft-tinted inline banner (icon + text) with an
 * optional trailing action. Fills the gap Note leaves: Note is icon+text only,
 * while import (dup-warning) renders the same tonal row with an optional button.
 * `tone` picks the *-soft / on-*-soft pair.
 */

import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme, type Theme } from '../../theme';
import { Icon } from '../../icons';

export type ActionCalloutTone = 'accent' | 'success' | 'warning' | 'error';

export interface ActionCalloutProps {
  icon: string;
  text: string;
  tone?: ActionCalloutTone;
  action?: ReactNode;
  node?: string;
}

function calloutColors(t: Theme, tone: ActionCalloutTone): { bg: string; fg: string } {
  switch (tone) {
    case 'success':
      return { bg: t.color.successSoft, fg: t.color.onSuccessSoft };
    case 'error':
      return { bg: t.color.errorSoft, fg: t.color.onErrorSoft };
    case 'accent':
      return { bg: t.color.primarySoft, fg: t.color.onPrimarySoft };
    case 'warning':
    default:
      return { bg: t.color.warningSoft, fg: t.color.onWarningSoft };
  }
}

export function ActionCallout({ icon, text, tone = 'warning', action, node }: ActionCalloutProps) {
  const t = useTheme();
  const c = calloutColors(t, tone);

  return (
    <View
      testID={node}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[3],
        backgroundColor: c.bg,
        borderRadius: t.radius.control,
        paddingVertical: t.space[3],
        paddingHorizontal: t.space[4],
      }}
    >
      <Icon name={icon} size={t.iconSize.md} color={c.fg} />
      <Text style={[t.font.text({ size: 'sm' }), { color: c.fg, flex: 1 }]}>{text}</Text>
      {action}
    </View>
  );
}
