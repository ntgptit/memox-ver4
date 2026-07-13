/**
 * Dialog — shared centered confirm/alert surface, ported from the kit's
 * `kit-helpers.jsx` `Dialog` (`window.Dialog`): a centered lg icon tile, an
 * extrabold title, secondary body copy, an optional custom body (e.g. an input or
 * an error note), and an actions row. Wrap in a `<Scrim align="center">`.
 *
 * `actionsLayout`: `split` (default) gives each action equal width side-by-side —
 * the kit's `.btn--block` pair in confirm dialogs; `end` right-aligns them (the
 * rename dialog's Cancel/Save).
 */

import { Text, View } from 'react-native';
import { Children, isValidElement, type ReactNode } from 'react';

import { useTheme } from '../../theme';
import { MxIconTile, type MxIconTileTone } from '../surfaces/MxIconTile';

export interface DialogProps {
  icon?: IconLike;
  tone?: MxIconTileTone;
  title: string;
  text?: string;
  /** Custom body between the copy and the actions (input, error note, …). */
  children?: ReactNode;
  actions?: ReactNode;
  actionsLayout?: 'split' | 'end';
  node?: string;
}

type IconLike = string;

export function Dialog({ icon, tone, title, text, children, actions, actionsLayout = 'split', node }: DialogProps) {
  const t = useTheme();

  return (
    <View
      testID={node}
      style={[
        {
          width: '100%',
          maxWidth: t.size['5xl'],
          backgroundColor: t.color.surface,
          borderRadius: t.radius.xl,
          padding: t.space[6],
          alignItems: 'center',
          gap: t.space[4],
        },
        t.elevation.lg,
      ]}
    >
      {icon !== undefined && <MxIconTile icon={icon} tone={tone} size="lg" />}
      <View style={{ gap: t.space[2], alignSelf: 'stretch' }}>
        <Text
          accessibilityRole="header"
          style={[
            t.font.text({ size: 'lg', weight: 'extrabold', letterSpacing: 'tight' }),
            { color: t.color.text, textAlign: 'center' },
          ]}
        >
          {title}
        </Text>
        {text !== undefined && (
          <Text
            style={[
              t.font.text({ size: 'base', lineHeight: 'normal' }),
              { color: t.color.textSecondary, textAlign: 'center' },
            ]}
          >
            {text}
          </Text>
        )}
      </View>
      {children}
      {actions !== undefined && (
        <View
          style={{
            flexDirection: 'row',
            gap: t.space[3],
            alignSelf: 'stretch',
            marginTop: t.space[1],
            justifyContent: actionsLayout === 'end' ? 'flex-end' : 'flex-start',
          }}
        >
          {actionsLayout === 'split'
            ? Children.map(actions, (child) =>
                isValidElement(child) ? <View style={{ flex: 1 }}>{child}</View> : child,
              )
            : actions}
        </View>
      )}
    </View>
  );
}
