/**
 * Player screen (WBS 7.3) — hands-free audio playback of a deck. Composition
 * mirrors the kit `_features/player/Player.jsx`: nested bar (back · deck title ·
 * options) → 8-dot progress → PlayerCard (term · divider · meaning) → transport
 * (prev · play/pause FAB · next, all ≥48px) → speed row (ghost ×N chip, or the
 * segmented ×0.75/×1/×1.5 control in the speed state) → error / end panels.
 * 5 states (contract §6).
 */

import { Text, View } from 'react-native';

import {
  AppScreen,
  EmptyState,
  MxButton,
  MxCard,
  MxFab,
  MxIconButton,
  MxSegmentedControl,
  useTheme,
} from '@/design-system';

import { PLAYER_SPEEDS, type PlayerData, type PlayerSpeed, type PlayerUiState } from './player-fixtures';

export interface PlayerScreenProps {
  data: PlayerData;
  ui?: PlayerUiState;
  speed?: PlayerSpeed;
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onPlayPause?: () => void;
  /** Open the speed segments (the ghost ×N chip). */
  onSpeedOpen?: () => void;
  onSpeedChange?: (speed: PlayerSpeed) => void;
  onRetry?: () => void;
  onReplay?: () => void;
  onClose?: () => void;
}

export function PlayerScreen({
  data,
  ui = 'playing',
  speed = '1',
  onBack,
  onPrev,
  onNext,
  onPlayPause,
  onSpeedOpen,
  onSpeedChange,
  onRetry,
  onReplay,
  onClose,
}: PlayerScreenProps) {
  const t = useTheme();
  const playing = ui !== 'paused';

  const bar = {
    variant: 'nested' as const,
    title: data.status === 'ready' ? data.deckTitle : 'Player',
    leading: <MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={onBack} node="player/back" />,
    actions: <MxIconButton icon="more_vert" accessibilityLabel="Options" node="player/options" />,
  };

  // ---- error ----------------------------------------------------------------------
  if (data.status === 'error') {
    return (
      <AppScreen node="player/screen" {...bar}>
        <EmptyState
          node="player/error"
          icon="volume_off"
          tone="error"
          title="Playback failed"
          text={data.message}
          action={
            <MxButton variant="primary" icon="refresh" onPress={onRetry} node="player/retry">
              Try again
            </MxButton>
          }
        />
      </AppScreen>
    );
  }

  // ---- end ------------------------------------------------------------------------
  if (ui === 'end') {
    return (
      <AppScreen node="player/screen" {...bar}>
        <EmptyState
          node="player/end"
          icon="library_music"
          tone="accent"
          title="All played"
          text="The player has read through every card in this deck."
          action={
            <View style={{ gap: t.space[3], width: t.size['3xl'] }}>
              <MxButton variant="primary" icon="replay" block onPress={onReplay} node="player/replay">
                Replay
              </MxButton>
              <MxButton variant="ghost" icon="close" block onPress={onClose} node="player/close">
                Close
              </MxButton>
            </View>
          }
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen node="player/screen" {...bar}>
      {/* Kit Dots: 8-dot deck progress — played dots primary, the current one wider. */}
      <View testID="player/progress" style={{ flexDirection: 'row', gap: t.space[2], justifyContent: 'center' }}>
        {Array.from({ length: data.total }).map((_, i) => (
          <View
            key={i}
            style={{
              width: i === data.index ? t.size.xs : t.size['2xs'],
              height: t.size['2xs'],
              borderRadius: t.radius.pill,
              backgroundColor: i <= data.index ? t.color.primary : t.color.border,
            }}
          />
        ))}
      </View>

      {/* Kit PlayerCard: the card being read aloud. */}
      <MxCard node="player/card" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.space[4], minHeight: t.size['4xl'] }}>
        <Text style={[t.font.text({ size: '3xl', weight: 'bold', letterSpacing: 'tight' }), { color: t.color.text, textAlign: 'center' }]}>
          {data.term}
        </Text>
        <View style={{ width: t.size.md, height: t.size['3xs'], backgroundColor: t.color.divider, borderRadius: t.radius.xs }} />
        <Text style={[t.font.text({ size: 'xl', weight: 'bold' }), { color: t.color.text, textAlign: 'center' }]}>
          {data.meaning}
        </Text>
      </MxCard>

      {/* Transport — prev · play/pause FAB · next (all ≥48px targets). */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.space[6] }}>
        <MxIconButton icon="skip_previous" accessibilityLabel="Previous card" onPress={onPrev} node="player/prev" />
        <MxFab
          icon={playing ? 'pause' : 'play_arrow'}
          accessibilityLabel={playing ? 'Pause' : 'Play'}
          onPress={onPlayPause}
          node="player/playpause"
        />
        <MxIconButton icon="skip_next" accessibilityLabel="Next card" onPress={onNext} node="player/next" />
      </View>

      {/* Kit: the speed row reclaims the body's reserved bottom-nav padding. */}
      <View style={{ marginBottom: -t.layout.bottomNavHeight }}>
        {ui === 'speed' ? (
          <MxSegmentedControl
            value={speed}
            onChange={(v) => onSpeedChange?.(v as PlayerSpeed)}
            block
            node="player/speed-control"
            segments={PLAYER_SPEEDS.map((s) => ({ value: s, label: `×${s}` }))}
          />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <MxButton variant="ghost" size="sm" icon="speed" onPress={onSpeedOpen} node="player/speed">
              ×{speed}
            </MxButton>
          </View>
        )}
      </View>
    </AppScreen>
  );
}
