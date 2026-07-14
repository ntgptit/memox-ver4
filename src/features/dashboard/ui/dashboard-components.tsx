/**
 * Dashboard feature-local components (WBS 5.3) — RN ports of the kit's
 * `_features/dashboard/components/*`: GreetingHeader (date-free greeting
 * headline), GoalCard (daily goal + progress bar), Stat (one Today-strip flat
 * metric), OnboardingHero + OnboardingStep (first-run empty state).
 */

import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { Icon, MxCard, MxIconTile, ProgressBar, useTheme, type MxIconTileTone } from '@/design-system';

/** Kit GreetingHeader: optional sm/semibold eyebrow + 2xl/extrabold headline. */
export function GreetingHeader({ eyebrow, title, node }: { eyebrow?: string; title: string; node?: string }) {
  const t = useTheme();
  return (
    <View testID={node} style={{ gap: t.space[1] }}>
      {/* The kit renders the eyebrow slot unconditionally (an empty, zero-height
          div) so the column gap still offsets the headline by 4px — mirror that. */}
      {eyebrow !== undefined ? (
        <Text style={[t.font.text({ size: 'sm', weight: 'semibold' }), { color: t.color.textSecondary }]}>
          {eyebrow}
        </Text>
      ) : (
        <View />
      )}
      <Text
        accessibilityRole="header"
        style={[
          t.font.text({ size: '2xl', weight: 'extrabold', letterSpacing: 'tight', lineHeight: 'tight' }),
          { color: t.color.text },
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

/** Kit GoalCard: 16/32 padding, "Daily goal" + pct, 10px bar, minutes line. */
export function GoalCard({
  pct,
  met,
  minutes,
  goal,
  node,
}: {
  pct: number;
  met: boolean;
  minutes: number;
  goal: number;
  node?: string;
}) {
  const t = useTheme();
  const left = Math.max(0, goal - minutes);
  return (
    <MxCard node={node} style={{ paddingVertical: t.space[4], paddingHorizontal: t.space[7] }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: t.space[3] }}>
        <Text style={[t.font.text({ size: 'md', weight: 'bold' }), { color: t.color.text }]}>Daily goal</Text>
        {/* Primary TEXT for the metric — the tint lives on the bar (kit note). */}
        <Text style={[t.font.text({ size: 'lg', weight: 'extrabold' }), { color: t.color.text }]}>{pct}%</Text>
      </View>
      <ProgressBar value={pct} height={10} accessibilityLabel="Daily goal progress" node={node ? `${node}-bar` : undefined} />
      <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>
        {met ? `${goal} of ${goal} minutes · goal complete` : `${minutes} of ${goal} minutes · ${left} minutes left`}
      </Text>
    </MxCard>
  );
}

/**
 * Kit Stat — one flat Today-strip metric: a 48px tinted icon chip + value/label.
 * Fixed anatomy (VIS-022): 24px icon, 16px icon→content, 4px value→label.
 */
export function Stat({ icon, soft, on, n, l }: { icon: string; soft: string; on: string; n: string; l: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4], minWidth: 0, flex: 1 }}>
      <View
        style={{
          width: t.comp.iconTileMd,
          height: t.comp.iconTileMd,
          borderRadius: t.radius.control,
          backgroundColor: soft,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={t.font.size.xl} color={on} />
      </View>
      <View style={{ gap: t.space[1], minWidth: 0, flexShrink: 1 }}>
        <Text style={[t.font.text({ size: 'lg', weight: 'extrabold' }), { color: t.color.text }]}>{n}</Text>
        <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>{l}</Text>
      </View>
    </View>
  );
}

/** Kit OnboardingHero: primary-surface first-run invitation with a CTA stack. */
export function OnboardingHero({
  icon,
  title,
  text,
  children,
  node,
}: {
  icon: string;
  title: string;
  text: string;
  children?: ReactNode;
  node?: string;
}) {
  const t = useTheme();
  return (
    <MxCard variant="primary" node={node ?? 'dashboard/onboarding'}>
      <View
        style={{
          width: t.size.sm,
          height: t.size.sm,
          borderRadius: t.radius.pill,
          backgroundColor: t.color.primaryStrong,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={t.iconSize.md} color={t.color.onPrimary} />
      </View>
      <Text
        style={[
          t.font.text({ size: 'lg', weight: 'extrabold', letterSpacing: 'tight' }),
          { color: t.color.onPrimary, marginTop: t.space[3] },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          t.font.text({ size: 'sm', lineHeight: 'normal' }),
          { color: t.color.onPrimary, opacity: t.opacity.label, marginTop: t.space[1] },
        ]}
      >
        {text}
      </Text>
      <View style={{ gap: t.space[3], marginTop: t.space[4], alignSelf: 'stretch' }}>{children}</View>
    </MxCard>
  );
}

/** Kit OnboardingStep: icon tile + title/caption — the DeckRow silhouette. */
export function OnboardingStep({
  icon,
  tone,
  title,
  text,
  node,
}: {
  icon: string;
  tone?: MxIconTileTone;
  title: string;
  text: string;
  node?: string;
}) {
  const t = useTheme();
  return (
    <MxCard padding="sm" node={node}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4] }}>
        <MxIconTile icon={icon} tone={tone} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[t.font.text({ size: 'base', weight: 'bold' }), { color: t.color.text }]}>{title}</Text>
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary, marginTop: t.space[1] }]}>
            {text}
          </Text>
        </View>
      </View>
    </MxCard>
  );
}
