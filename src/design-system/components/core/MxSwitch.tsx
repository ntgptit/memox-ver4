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

export function MxSwitch({ checked = false, disabled = false, onChange, ariaLabel, node }: MxSwitchProps) {
  const t = useTheme();
  // Kit geometry (tokens/component.css): 52×32 track; thumb 22→24 when on;
  // inset 4→2 plus a 20px travel. The kit draws the track ring as an inset
  // box-shadow (no layout cost); RN's borderWidth shifts the content box, so the
  // thumb offset compensates by the track border to keep the kit's coordinates.
  const thumb = checked ? t.comp.switchThumbOn : t.comp.switchThumb;
  const inset = checked ? t.comp.switchThumbInsetOn + t.comp.switchThumbTravel : t.comp.switchThumbInset;

  return (
    <Pressable
      testID={node}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={ariaLabel}
      hitSlop={(t.layout.touchMin - t.comp.switchHeight) / 2}
      style={{ opacity: disabled ? t.opacity.disabled : 1 }}
    >
      <View
        style={{
          width: t.comp.switchWidth,
          height: t.comp.switchHeight,
          borderRadius: t.radius.pill,
          justifyContent: 'center',
          backgroundColor: checked ? t.color.primary : t.color.surfaceSunken,
          borderWidth: t.stroke.mid,
          borderColor: checked ? 'transparent' : t.color.border,
        }}
      >
        <View
          style={{
            width: thumb,
            height: thumb,
            borderRadius: t.radius.full,
            backgroundColor: checked ? t.color.onPrimary : t.color.textTertiary,
            marginLeft: inset - t.stroke.mid,
          }}
        />
      </View>
    </Pressable>
  );
}
