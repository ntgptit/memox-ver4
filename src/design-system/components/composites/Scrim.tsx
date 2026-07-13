/**
 * Scrim — shared modal backdrop, ported from the kit's `kit-helpers.jsx` `Scrim`
 * (`window.Scrim`): a full-frame dimming overlay that hosts a bottom Sheet
 * (`align="end"`) or a centered Dialog (`align="center"`). Tapping the backdrop
 * dismisses.
 *
 * Renders inside an RN `Modal` so the overlay portals above the app shell and
 * covers the whole frame regardless of backdrop content height. Uses the kit's
 * `overlay` token (a real ~0.42 dark dim) — NOT `scrim` (~0.04, near-invisible),
 * which is why the hand-rolled overlays read as "no backdrop" against the kit.
 */

import { Modal, Pressable, View } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '../../theme';

export interface ScrimProps {
  /** `end` parks a Sheet at the bottom; `center` floats a Dialog. */
  align?: 'end' | 'center';
  onDismiss?: () => void;
  node?: string;
  children: ReactNode;
}

export function Scrim({ align = 'end', onDismiss, node, children }: ScrimProps) {
  const t = useTheme();

  return (
    <Modal transparent visible animationType="none" onRequestClose={onDismiss}>
      <View style={{ flex: 1 }}>
        <Pressable
          testID={node ? `${node}-backdrop` : undefined}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onDismiss}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.color.overlay }}
        />
        <View
          testID={node}
          style={{
            flex: 1,
            justifyContent: align === 'center' ? 'center' : 'flex-end',
            alignItems: align === 'center' ? 'center' : 'stretch',
            padding: align === 'center' ? t.space[6] : 0,
          }}
          pointerEvents="box-none"
        >
          <View
            onStartShouldSetResponder={() => true}
            accessibilityViewIsModal
            style={{ width: '100%', alignItems: align === 'center' ? 'center' : 'stretch' }}
          >
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
}
