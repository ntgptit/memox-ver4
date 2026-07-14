/**
 * Breadcrumb — shared composite, ported from the kit's `_shared/Breadcrumb.jsx`
 * (base class `breadcrumb`): the nested-deck path affordance (Library › Korean ›
 * TOPIK I › …). Ancestor crumbs are tappable; the current level is bold and
 * non-interactive. Paths deeper than `maxVisible` collapse their middle into a
 * "…" crumb (root + last two levels stay visible); the row scrolls horizontally
 * as a fallback.
 */
import { Fragment } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import { useTheme } from '../../theme';
import { Icon } from '../../icons';

export interface BreadcrumbItem {
  label: string;
  node?: string;
  current?: boolean;
  onPress?: () => void;
}

export interface BreadcrumbProps {
  items: readonly BreadcrumbItem[];
  /** Collapse threshold (default 4). */
  maxVisible?: number;
  node?: string;
  /** Pressing the "…" crumb (expand hidden levels). */
  onExpand?: () => void;
}

export function Breadcrumb({ items, maxVisible = 4, node, onExpand }: BreadcrumbProps) {
  const t = useTheme();

  let shown: BreadcrumbItem[] = [...items];
  if (items.length > maxVisible) {
    // root · … · parent · current — keep the two innermost levels + the root
    shown = [
      items[0],
      { label: '…', node: `${node ?? 'breadcrumb'}/expand`, onPress: onExpand },
      items[items.length - 2],
      items[items.length - 1],
    ];
  }

  return (
    <ScrollView
      testID={node}
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel="Breadcrumb"
      // Kit row height: the separator's inline line box sets the row at ~24px
      // (measured 24.5 on the reference shots), not the 19.5px crumb text.
      contentContainerStyle={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[1],
        minHeight: t.space[6],
      }}
    >
      {shown.map((item, i) => (
        <Fragment key={`${item.label}-${i}`}>
          {i > 0 && <Icon name="chevron_right" size={t.iconSize.sm} color={t.color.textTertiary} />}
          {item.current ? (
            <Text style={[t.font.text({ size: 'sm', weight: 'semibold' }), { color: t.color.text }]}>{item.label}</Text>
          ) : (
            <Pressable
              testID={item.node}
              accessibilityRole="button"
              accessibilityLabel={item.label === '…' ? 'Show hidden levels' : item.label}
              onPress={item.onPress}
              hitSlop={14}
            >
              <Text style={[t.font.text({ size: 'sm', weight: 'medium' }), { color: t.color.textSecondary }]}>
                {item.label}
              </Text>
            </Pressable>
          )}
        </Fragment>
      ))}
    </ScrollView>
  );
}
