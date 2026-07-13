/**
 * MxSwitch (WBS 1.7) — base class `switch` (ADR 0004). A pill toggle: sunken track
 * off, primary track on, a sliding thumb. ≥48px hit area. `ariaLabel` →
 * `accessibilityLabel`. Controlled via `checked` + `onChange`.
 */

import { Pressable, View } from 'react-native';

import { useTheme } from '../../theme';

export interface MxSwitchProps {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  ariaLabel?: string;
  node?: string;
}

const TRACK_W = 44;
const TRACK_H = 26;
const THUMB = 20;
const PAD = 3;

export function MxSwitch({ checked = false, disabled = false, onChange, ariaLabel, node }: MxSwitchProps) {
  const t = useTheme();

  return (
    <Pressable
      testID={node}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={ariaLabel}
      hitSlop={(t.layout.touchMin - TRACK_H) / 2}
      style={{ opacity: disabled ? t.opacity.disabled : 1 }}
    >
      <View
        style={{
          width: TRACK_W,
          height: TRACK_H,
          borderRadius: t.radius.pill,
          justifyContent: 'center',
          backgroundColor: checked ? t.color.primary : t.color.surfaceSunken,
          borderWidth: checked ? 0 : t.stroke.mid,
          borderColor: t.color.border,
        }}
      >
        <View
          style={{
            width: THUMB,
            height: THUMB,
            borderRadius: t.radius.pill,
            backgroundColor: checked ? t.color.onPrimary : t.color.surface,
            marginLeft: checked ? TRACK_W - THUMB - PAD : PAD,
            ...t.elevation.sm,
          }}
        />
      </View>
    </Pressable>
  );
}
