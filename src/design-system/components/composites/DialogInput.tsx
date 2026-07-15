/**
 * DialogInput — shared composite, ported from the kit's `kit-helpers.jsx`
 * `DialogInput`: the labeled text input used inside naming Dialogs (create deck /
 * sub-deck / rename). A small bold label over a 48px surface box with a hairline
 * divider ring. The kit's is static; this one wires a real TextInput.
 */

import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { useTheme } from '../../theme';

export interface DialogInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  /** Inline validation message shown under the box. */
  error?: string;
  node?: string;
}

export function DialogInput({ label, placeholder, value, onChangeText, error, node }: DialogInputProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: t.space[2], alignSelf: 'stretch' }}>
      {label !== undefined && (
        <Text style={[t.font.text({ size: 'sm', weight: 'bold' }), { color: t.color.textSecondary, textAlign: 'left' }]}>
          {label}
        </Text>
      )}
      <View
        style={{
          // Kit DialogInput renders content-box (its overlay escapes the .app
          // border-box reset): min-height 48 + 12px vertical padding = a 72px box.
          minHeight: t.layout.touchMin + t.space[3] * 2,
          paddingHorizontal: t.space[4],
          paddingVertical: t.space[3],
          borderRadius: t.radius.control,
          backgroundColor: t.color.surface,
          borderWidth: t.stroke.hairline,
          borderColor: error ? t.color.error : focused ? t.color.focusRing : t.color.divider,
          justifyContent: 'center',
        }}
      >
        <TextInput
          testID={node}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={t.color.textTertiary}
          accessibilityLabel={label ?? placeholder}
          style={[t.font.text({ size: 'base' }), { color: t.color.text, padding: 0, outlineStyle: 'none' }]}
        />
      </View>
      {error !== undefined && (
        <Text accessibilityRole="alert" style={[t.font.text({ size: 'sm' }), { color: t.color.error, textAlign: 'left' }]}>
          {error}
        </Text>
      )}
    </View>
  );
}
