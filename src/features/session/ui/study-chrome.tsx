/**
 * Shared study-mode chrome (WBS 6.x/7.x). The pieces every study-mode screen composes:
 * a progress header, the prompt card, an inline feedback note, and the round-complete
 * panel. Kept here so recall/guess/fill never drift.
 */

import { Text, View } from 'react-native';

import { MxCard, MxButton, Icon, useTheme, type Theme } from '@/design-system';

export function ProgressHeader({ done, total, node }: { done: number; total: number; node: string }) {
  const t = useTheme();
  const pct = total > 0 ? Math.min(1, done / total) : 0;
  return (
    <View
      testID={node}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: done }}
      style={{ gap: t.space[2] }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[t.font.text({ size: 'sm', weight: 'semibold' }), { color: t.color.textSecondary }]}>Progress</Text>
        <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textTertiary }]}>
          {done} / {total}
        </Text>
      </View>
      <View style={{ height: t.space[2], borderRadius: t.radius.full, backgroundColor: t.color.surfaceMuted, overflow: 'hidden' }}>
        <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: t.color.primary }} />
      </View>
    </View>
  );
}

export function StudyPromptCard({ term, eyebrow, node }: { term: string; eyebrow?: string; node: string }) {
  const t = useTheme();
  return (
    <MxCard node={node} variant="elevated">
      <View style={{ alignItems: 'center', paddingVertical: t.space[6], gap: t.space[2] }}>
        {eyebrow && (
          <Text style={[t.font.text({ size: 'xs', weight: 'semibold' }), { color: t.color.textTertiary }]}>{eyebrow}</Text>
        )}
        <Text style={[t.font.text({ size: '3xl', weight: 'bold' }), { color: t.color.text, textAlign: 'center' }]}>{term}</Text>
      </View>
    </MxCard>
  );
}

export function FeedbackNote({
  tone,
  icon,
  text,
  node,
}: {
  tone: 'warning' | 'success' | 'error';
  icon: string;
  text: string;
  node: string;
}) {
  const t = useTheme();
  const color = tone === 'success' ? t.color.success : tone === 'error' ? t.color.error : t.color.warning;
  return (
    <View
      testID={node}
      accessibilityRole="alert"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[3],
        borderRadius: t.radius.md,
        borderWidth: t.stroke.hairline,
        borderColor: color,
        backgroundColor: t.color.surface,
        padding: t.space[3],
      }}
    >
      <Icon name={icon} size="sm" color={color} />
      <Text style={[t.font.text({ size: 'sm' }), { color: t.color.text, flex: 1 }]}>{text}</Text>
    </View>
  );
}

export function RoundComplete({
  title,
  text,
  buttonLabel = 'Done',
  onNext,
  node,
}: {
  title: string;
  text: string;
  buttonLabel?: string;
  onNext?: () => void;
  node: string;
}) {
  const t = useTheme();
  return (
    <MxCard node={node} variant="flat">
      <View style={{ alignItems: 'center', gap: t.space[3], paddingVertical: t.space[5] }}>
        <Icon name="celebration" size="xl" color={t.color.success} />
        <Text style={[t.font.text({ size: 'lg', weight: 'bold' }), { color: t.color.text, textAlign: 'center' }]}>{title}</Text>
        <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary, textAlign: 'center' }]}>{text}</Text>
        <MxButton variant="primary" icon="arrow_forward" onPress={onNext} node={`${node}-next`}>
          {buttonLabel}
        </MxButton>
      </View>
    </MxCard>
  );
}

/** Local helper so screens can theme without re-importing. */
export type { Theme };
