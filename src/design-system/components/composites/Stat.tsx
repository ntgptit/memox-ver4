/**
 * Stat — shared composite, ported from the kit's `kit-helpers.jsx` `Stat`
 * (`window.Stat`): THE component for every big-figure-over-small-label pair.
 * `size` md (default, icon-size-md figure with a `none` line box) or `lg`
 * (2xl hero figure); `align` center (default) or start; `onTint` renders the
 * label at label opacity (tinted cards) instead of text-secondary.
 */

import { Text, View } from 'react-native';

import { useTheme } from '../../theme';

export interface StatProps {
  /** The figure ("24", "88%", "6:30"). */
  n: string;
  /** The label under it ("cards", "correct", "min"). */
  l: string;
  /** Figure colour override. */
  tone?: string;
  size?: 'md' | 'lg';
  align?: 'center' | 'start';
  onTint?: boolean;
  node?: string;
}

export function Stat({ n, l, tone, size = 'md', align = 'center', onTint = false, node }: StatProps) {
  const t = useTheme();

  // Kit md figure: icon-size-md (22) extrabold with a line-height-none box.
  const num =
    size === 'lg'
      ? t.font.text({ size: '2xl', weight: 'extrabold' })
      : { ...t.font.text({ size: 'md', weight: 'extrabold', lineHeight: 'none' }), fontSize: t.iconSize.md, lineHeight: t.iconSize.md };
  const lblSize = size === 'lg' ? 'sm' : 'xs';

  return (
    <View testID={node} style={{ alignItems: align === 'start' ? 'flex-start' : 'center', gap: t.space[1] }}>
      <Text style={[num, { color: tone ?? t.color.text }]}>{n}</Text>
      <Text
        style={[
          t.font.text({ size: lblSize }),
          onTint ? { color: t.color.text, opacity: t.opacity.label } : { color: t.color.textSecondary },
        ]}
      >
        {l}
      </Text>
    </View>
  );
}
