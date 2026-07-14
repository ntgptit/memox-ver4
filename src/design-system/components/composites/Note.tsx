/**
 * Note — shared composite, ported from the kit's `kit-helpers.jsx` `Note`
 * (`window.Note`): an inline tinted callout — icon + short text on a soft tonal
 * background (control radius). The kit's `accent` tone maps to the PRIMARY soft
 * pair (its map does the same), so callouts read as brand-tinted by default.
 */

import { Text, View } from 'react-native';

import { useTheme, type Theme } from '../../theme';
import { Icon } from '../../icons';

export type NoteTone = 'accent' | 'success' | 'warning' | 'error';

export interface NoteProps {
  icon: string;
  text: string;
  tone?: NoteTone;
  node?: string;
}

function noteColors(t: Theme, tone: NoteTone): { bg: string; fg: string } {
  switch (tone) {
    case 'success':
      return { bg: t.color.successSoft, fg: t.color.onSuccessSoft };
    case 'warning':
      return { bg: t.color.warningSoft, fg: t.color.onWarningSoft };
    case 'error':
      return { bg: t.color.errorSoft, fg: t.color.onErrorSoft };
    case 'accent':
    default:
      return { bg: t.color.primarySoft, fg: t.color.onPrimarySoft };
  }
}

export function Note({ icon, text, tone = 'accent', node }: NoteProps) {
  const t = useTheme();
  const c = noteColors(t, tone);

  return (
    <View
      testID={node}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[2],
        backgroundColor: c.bg,
        borderRadius: t.radius.control,
        paddingVertical: t.space[3],
        paddingHorizontal: t.space[4],
      }}
    >
      <Icon name={icon} size={t.iconSize.sm} color={c.fg} />
      <Text style={[t.font.text({ size: 'sm', weight: 'semibold' }), { color: c.fg, flexShrink: 1 }]}>{text}</Text>
    </View>
  );
}
