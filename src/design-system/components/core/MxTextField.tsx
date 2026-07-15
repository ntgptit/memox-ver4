/**
 * MxTextField (WBS 1.7) — base class `field` (ADR 0004). A labelled text input:
 * optional `label` above, a bordered input surface, and an optional `helper`/`error`
 * below. `error` switches the border + message to the error tone; focus switches
 * it to the focus-ring tone (kit `--memox-focus-ring`). `node`→`testID`.
 */

import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { useTheme } from '../../theme';

export interface MxTextFieldProps {
  value?: string;
  placeholder?: string;
  label?: string;
  helper?: string;
  error?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  node?: string;
}

export function MxTextField({
  value,
  placeholder,
  label,
  helper,
  error,
  onChangeText,
  secureTextEntry,
  multiline,
  node,
}: MxTextFieldProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const invalid = error !== undefined;
  const message = error ?? helper;

  return (
    <View style={{ gap: t.space[1] }}>
      {label !== undefined && (
        <Text style={[t.font.text({ size: 'sm', weight: 'semibold' }), { color: t.color.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={{
          minHeight: t.layout.touchMin,
          justifyContent: 'center',
          paddingHorizontal: t.space[4],
          borderRadius: t.radius.field,
          backgroundColor: t.color.surface,
          // Focus keeps the hairline width (delicate ring, no 1px layout shift);
          // only the colour switches to the focus-ring tone. Error still wins.
          borderWidth: invalid ? t.stroke.emphasis : t.stroke.hairline,
          borderColor: invalid ? t.color.error : focused ? t.color.focusRing : t.color.border,
        }}
      >
        <TextInput
          testID={node}
          style={[
            t.font.text({ size: 'base' }),
            // outlineStyle none: the focus treatment lives on the container border
            // (kit `.field { outline: none }`); the browser's :focus-visible ring is
            // `outline-style: auto`, which paints even at outline-width 0.
            { color: t.color.text, padding: 0, paddingVertical: t.space[2], outlineStyle: 'none' },
          ]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={t.color.textSecondary}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          accessibilityLabel={label}
        />
      </View>
      {message !== undefined && (
        <Text style={[t.font.text({ size: 'sm' }), { color: invalid ? t.color.error : t.color.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
}
