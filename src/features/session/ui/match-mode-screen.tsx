/**
 * Match-mode screen (WBS 6.2, session stage 2). A two-column board: meanings on the
 * left, terms on the right. Tap one on each side to match a pair — correct pairs turn
 * green (✓) and lock, a wrong pair flashes red (✕). Colour AND icon so the cue never
 * relies on colour alone.
 *
 * Presentational and prop-driven: the tiles (with tones) come in, taps go out. The
 * container runs the matching + session (start → match → persist).
 */

import { Pressable, Text, View } from 'react-native';

import { AppScreen, MxIconButton, Icon, useTheme, type Theme } from '@/design-system';
import type { MatchTile } from './match-board';

import { ProgressHeader, RoundComplete } from './study-chrome';

export type TileTone = 'neutral' | 'selected' | 'correct' | 'wrong' | 'matched';
export type MatchPhase = 'playing' | 'complete';

export interface MatchTileView extends MatchTile {
  tone: TileTone;
}

export interface MatchModeScreenProps {
  phase: MatchPhase;
  left: readonly MatchTileView[];
  right: readonly MatchTileView[];
  done: number;
  total: number;
  onTap: (side: 'L' | 'R', cardId: string) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export function MatchModeScreen(props: MatchModeScreenProps) {
  const t = useTheme();
  const back = <MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={props.onBack} node="match-mode/back" />;

  if (props.phase === 'complete') {
    return (
      <AppScreen node="match-mode/screen" variant="nested" title="Match" leading={back}>
        <ProgressHeader done={props.total} total={props.total} node="match-mode/progress" />
        <RoundComplete node="match-mode/complete" title="Round complete!" text="You matched every pair." onNext={props.onNext} />
      </AppScreen>
    );
  }

  return (
    <AppScreen node="match-mode/screen" variant="nested" title="Match" leading={back}>
      <ProgressHeader done={props.done} total={props.total} node="match-mode/progress" />
      <View style={{ flexDirection: 'row', gap: t.space[2] }}>
        <View style={{ flex: 1, gap: t.space[2] }}>
          {props.left.map((tile, i) => (
            <Tile key={tile.key} theme={t} tile={tile} node={`match-mode/left-${i}`} onPress={() => props.onTap('L', tile.cardId)} />
          ))}
        </View>
        <View style={{ flex: 1, gap: t.space[2] }}>
          {props.right.map((tile, i) => (
            <Tile key={tile.key} theme={t} tile={tile} node={`match-mode/right-${i}`} onPress={() => props.onTap('R', tile.cardId)} />
          ))}
        </View>
      </View>
    </AppScreen>
  );
}

function Tile({ theme: t, tile, node, onPress }: { theme: Theme; tile: MatchTileView; node: string; onPress: () => void }) {
  const { tone } = tile;
  const border =
    tone === 'selected'
      ? t.color.primary
      : tone === 'correct' || tone === 'matched'
        ? t.color.success
        : tone === 'wrong'
          ? t.color.error
          : t.color.border;
  const matched = tone === 'matched';
  const icon = tone === 'correct' || tone === 'matched' ? 'check_circle' : tone === 'wrong' ? 'close' : null;
  const stateLabel =
    tone === 'matched' || tone === 'correct'
      ? ' (matched)'
      : tone === 'wrong'
        ? ' (no match)'
        : tone === 'selected'
          ? ' (selected)'
          : '';

  return (
    <Pressable
      testID={node}
      accessibilityRole="button"
      accessibilityState={{ selected: tone === 'selected', disabled: matched }}
      accessibilityLabel={`${tile.text}${stateLabel}`}
      onPress={() => {
        if (!matched) onPress();
      }}
      style={{
        minHeight: t.size.md,
        borderRadius: t.radius.md,
        borderWidth: tone === 'neutral' ? t.stroke.hairline : t.stroke.emphasis,
        borderColor: border,
        backgroundColor: tone === 'selected' ? t.color.primarySoft : t.color.surface,
        opacity: matched ? t.opacity.half : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.space[2],
        paddingHorizontal: t.space[3],
        paddingVertical: t.space[4],
      }}
    >
      <Text
        numberOfLines={2}
        style={[
          t.font.text({ size: 'md', weight: 'semibold' }),
          { color: tone === 'selected' ? t.color.onPrimarySoft : t.color.text, textAlign: 'center' },
        ]}
      >
        {tile.text}
      </Text>
      {icon && <Icon name={icon} size="sm" color={tone === 'wrong' ? t.color.error : t.color.success} />}
    </Pressable>
  );
}
