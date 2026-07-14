/**
 * MxIconTile (WBS 1.5) — base class `icon-tile` (ADR 0004). A rounded square holding
 * one Material Symbols glyph, tinted by `tone`. `solid` fills with the brand.
 */

import { View } from 'react-native';

import { useTheme, type Theme } from '../../theme';
import { Icon, type IconName } from '../../icons';

export type MxIconTileTone = 'default' | 'accent' | 'success' | 'warning' | 'error';
export type MxIconTileSize = 'md' | 'lg';

export interface MxIconTileProps {
  icon: IconName | string;
  tone?: MxIconTileTone;
  size?: MxIconTileSize;
  solid?: boolean;
  node?: string;
}

function toneColors(t: Theme, tone: MxIconTileTone, solid: boolean): { bg: string; fg: string } {
  if (solid) {
    return { bg: t.color.primary, fg: t.color.onPrimary };
  }
  switch (tone) {
    case 'accent':
      return { bg: t.color.accentSoft, fg: t.color.accent };
    case 'success':
      return { bg: t.color.successSoft, fg: t.color.onSuccessSoft };
    case 'warning':
      return { bg: t.color.warningSoft, fg: t.color.onWarningSoft };
    case 'error':
      return { bg: t.color.errorSoft, fg: t.color.onErrorSoft };
    case 'default':
    default:
      return { bg: t.color.primarySoft, fg: t.color.onPrimarySoft };
  }
}

export function MxIconTile({ icon, tone = 'default', size = 'md', solid = false, node }: MxIconTileProps) {
  const t = useTheme();
  const { bg, fg } = toneColors(t, tone, solid);
  const box = size === 'lg' ? t.comp.iconTileLg : t.comp.iconTileMd; // lg = 60, md = 48
  const glyph = size === 'lg' ? t.iconSize.xl : t.iconSize.lg;
  const radius = size === 'lg' ? t.radius.lg : t.radius.tile;

  return (
    <View
      testID={node}
      style={{
        width: box,
        height: box,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius,
        backgroundColor: bg,
      }}
    >
      <Icon name={icon} size={glyph} color={fg} />
    </View>
  );
}
