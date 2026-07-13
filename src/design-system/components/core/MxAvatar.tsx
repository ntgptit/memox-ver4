/**
 * MxAvatar (WBS 1.7) — base class `avatar` (ADR 0004). A circular avatar: an image
 * (`src`) or the initials of `name` on a tinted disc. `size`; optional `ring`.
 */

import { Image, Text, View } from 'react-native';

import { useTheme } from '../../theme';

export type MxAvatarSize = 'sm' | 'md' | 'lg';
export type MxAvatarVariant = 'primary' | 'accent';

export interface MxAvatarProps {
  name?: string;
  src?: string;
  size?: MxAvatarSize;
  variant?: MxAvatarVariant;
  ring?: boolean;
  node?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function MxAvatar({ name, src, size = 'md', variant = 'primary', ring = false, node }: MxAvatarProps) {
  const t = useTheme();
  const box = size === 'lg' ? t.comp.avatarLg : size === 'sm' ? t.comp.avatarSm : t.comp.avatarMd; // 64 / 32 / 44
  const bg = variant === 'accent' ? t.color.accentSoft : t.color.primarySoft;
  const fg = variant === 'accent' ? t.color.accent : t.color.onPrimarySoft;

  return (
    <View
      testID={node}
      accessibilityLabel={name}
      style={{
        width: box,
        height: box,
        borderRadius: t.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: bg,
        borderWidth: ring ? t.stroke.emphasis : 0,
        borderColor: t.color.surface,
      }}
    >
      {src !== undefined ? (
        <Image source={{ uri: src }} style={{ width: box, height: box }} resizeMode="cover" />
      ) : (
        <Text style={[t.font.text({ size: size === 'sm' ? 'sm' : 'base', weight: 'bold' }), { color: fg }]}>
          {name !== undefined ? initials(name) : ''}
        </Text>
      )}
    </View>
  );
}
