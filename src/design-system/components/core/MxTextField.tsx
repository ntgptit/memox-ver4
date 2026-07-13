/**
 * MxTextField (WBS 1.7) — base class `field` (ADR 0004). A labelled text input:
 * optional `label` above, a bordered input surface, and an optional `helper`/`error`
 * below. `error` switches the border + message to the error tone. `node`→`testID`.
 */

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
          borderWidth: invalid ? t.stroke.emphasis : t.stroke.hairline,
          borderColor: invalid ? t.color.error : t.color.border,
        }}
      >
        <TextInput
          testID={node}
          style={[t.font.text({ size: 'base' }), { color: t.color.text, padding: 0, paddingVertical: t.space[2] }]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={t.color.textSecondary}
          onChangeText={onChangeText}
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
