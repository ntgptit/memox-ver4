/**
 * Token-parity tests for the primitives (WBS 1.8): components draw their colours from
 * theme tokens (never raw hex), MxList uses the gap token, and the icon adapter has a
 * deterministic missing-glyph fallback.
 */

import fs from 'fs';
import path from 'path';

import { render } from '@testing-library/react-native';
import { StyleSheet, type ViewStyle } from 'react-native';
import type { ReactElement } from 'react';

import { ThemeProvider, MxCard, MxList, MxBadge, Icon, GLYPHS, FALLBACK_ICON, themes } from '@/design-system';

function renderThemed(ui: ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}
function flat(style: unknown): ViewStyle {
  return (StyleSheet.flatten(style as ViewStyle) ?? {}) as ViewStyle;
}

const light = themes.light;

describe('token binding (WBS 1.8)', () => {
  it('MxCard (elevated) paints the surface token, not a raw colour', () => {
    const { getByTestId } = renderThemed(<MxCard node="c" />);
    expect(flat(getByTestId('c').props.style).backgroundColor).toBe(light.color.surface);
  });

  it('MxCard (primary) paints the primary token', () => {
    const { getByTestId } = renderThemed(<MxCard node="c" variant="primary" />);
    expect(flat(getByTestId('c').props.style).backgroundColor).toBe(light.color.primary);
  });

  it('MxBadge (error) paints the error token', () => {
    const { getByTestId } = renderThemed(
      <MxBadge node="b" tone="error">
        1
      </MxBadge>,
    );
    expect(flat(getByTestId('b').props.style).backgroundColor).toBe(light.color.error);
  });

  it('MxList uses the space-3 gap token by default', () => {
    const { getByTestId } = renderThemed(<MxList node="l" />);
    expect(flat(getByTestId('l').props.style).gap).toBe(light.space[3]);
  });

  it('MxList honours a gap override token', () => {
    const { getByTestId } = renderThemed(<MxList node="l" gap={6} />);
    expect(flat(getByTestId('l').props.style).gap).toBe(light.space[6]);
  });
});

describe('no raw colour values in the component layer (WBS 1.8)', () => {
  it('no `#rrggbb` / `#rgb` hex literals in any Mx* component source', () => {
    const dir = path.join(__dirname, '..');
    const files: string[] = [];
    const walk = (d: string) => {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(full);
        } else if (/\.tsx?$/.test(entry.name)) {
          files.push(full);
        }
      }
    };
    walk(dir);
    expect(files.length).toBeGreaterThan(10);
    const offenders = files.filter((f) => /#[0-9a-fA-F]{3,8}\b/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});

describe('icon missing-glyph fallback (WBS 1.4/1.8)', () => {
  it('renders a known glyph for a known name', () => {
    // Decorative icons are hidden from a11y, so include hidden elements in the query.
    const { getByText } = renderThemed(<Icon name="home" />);
    expect(getByText(GLYPHS.home, { includeHiddenElements: true })).toBeTruthy();
  });

  it('renders the deterministic FALLBACK_ICON glyph for an unknown name', () => {
    const { getByText } = renderThemed(<Icon name="__does_not_exist__" />);
    expect(getByText(GLYPHS[FALLBACK_ICON], { includeHiddenElements: true })).toBeTruthy();
  });
});
