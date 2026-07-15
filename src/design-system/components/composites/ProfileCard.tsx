/**
 * ProfileCard — shared composite, ported from the kit's `_shared/ProfileCard.jsx`
 * (`window.ProfileCard`): an avatar + name + email identity card shared by
 * settings and account-sync. Name/email are the kit's static scaffold fixture;
 * per-caller inputs are the `node` id and an optional trailing `badge`.
 */

import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '../../theme';
import { MxAvatar } from '../core/MxAvatar';
import { MxCard } from '../surfaces/MxCard';

export interface ProfileCardProps {
  name?: string;
  email?: string;
  badge?: ReactNode;
  node?: string;
}

export function ProfileCard({ name = 'Linh Tran', email = 'linh@memox.app', badge, node }: ProfileCardProps) {
  const t = useTheme();

  return (
    <MxCard node={node}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4] }}>
        <MxAvatar name={name} size="lg" ring />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[t.font.text({ size: 'md', weight: 'extrabold' }), { color: t.color.text }]}>{name}</Text>
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>{email}</Text>
        </View>
        {badge}
      </View>
    </MxCard>
  );
}
