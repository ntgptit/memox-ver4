/**
 * Render smoke tests for the shared composites (kit `kit-helpers.jsx` ports).
 * Proves each mounts under the theme, carries its node testID, and behaves.
 */

import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import {
  ThemeProvider,
  ListRow,
  EmptyState,
  SectionLabel,
  MxButton,
  Scrim,
  Sheet,
  MenuItem,
  Dialog,
} from '@/design-system';

function renderThemed(ui: ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('shared composites (kit-helpers ports)', () => {
  it('ListRow renders title + sub + trailing and fires onPress', () => {
    const onPress = jest.fn();
    const { getByText, getByTestId } = renderThemed(
      <ListRow
        node="t/row"
        icon="translate"
        title="한국어 → English"
        sub="1240 cards"
        onPress={onPress}
        trailing={<MxButton node="t/row-action">Edit</MxButton>}
      />,
    );
    expect(getByText('한국어 → English')).toBeTruthy();
    expect(getByText('1240 cards')).toBeTruthy();
    expect(getByText('Edit')).toBeTruthy();
    fireEvent.press(getByTestId('t/row'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ListRow without onPress renders as a plain view with the node id', () => {
    const { getByTestId } = renderThemed(<ListRow node="t/row" title="Kanji" last />);
    expect(getByTestId('t/row')).toBeTruthy();
  });

  it('EmptyState renders title, text, and the action', () => {
    const onAdd = jest.fn();
    const { getByText, getByTestId } = renderThemed(
      <EmptyState
        node="t/empty"
        icon="translate"
        title="No language pairs yet"
        text="Add a learning language."
        action={
          <MxButton node="t/empty-add" variant="primary" onPress={onAdd}>
            Add language pair
          </MxButton>
        }
      />,
    );
    expect(getByTestId('t/empty')).toBeTruthy();
    expect(getByText('No language pairs yet')).toBeTruthy();
    expect(getByText('Add a learning language.')).toBeTruthy();
    fireEvent.press(getByTestId('t/empty-add'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('SectionLabel renders its copy with the node id', () => {
    const { getByText, getByTestId } = renderThemed(
      <SectionLabel node="t/label" uppercase>
        Learning
      </SectionLabel>,
    );
    expect(getByTestId('t/label')).toBeTruthy();
    expect(getByText('Learning')).toBeTruthy();
  });

  it('Scrim backdrop dismisses; Sheet + MenuItem render inside it', () => {
    const onDismiss = jest.fn();
    const onPick = jest.fn();
    const { getByTestId, getByText } = renderThemed(
      <Scrim node="t/scrim" align="end" onDismiss={onDismiss}>
        <Sheet title="Deck actions" node="t/sheet">
          <MenuItem icon="edit" label="Rename deck" onPress={onPick} node="t/menu-rename" />
        </Sheet>
      </Scrim>,
    );
    expect(getByText('Deck actions')).toBeTruthy();
    fireEvent.press(getByTestId('t/menu-rename'));
    expect(onPick).toHaveBeenCalledTimes(1);
    fireEvent.press(getByTestId('t/scrim-backdrop'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('Dialog renders icon/title/text, a custom body, and split actions', () => {
    const onConfirm = jest.fn();
    const { getByTestId, getByText } = renderThemed(
      <Scrim node="t/dscrim" align="center" onDismiss={() => {}}>
        <Dialog
          node="t/dialog"
          icon="delete"
          tone="error"
          title="Delete this deck?"
          text="This can’t be undone."
          actions={[
            <MxButton key="cancel" variant="ghost" block node="t/dialog-cancel">
              Cancel
            </MxButton>,
            <MxButton key="ok" variant="primary" danger block onPress={onConfirm} node="t/dialog-ok">
              Delete
            </MxButton>,
          ]}
        >
          <SectionLabel node="t/dialog-body">Body</SectionLabel>
        </Dialog>
      </Scrim>,
    );
    expect(getByTestId('t/dialog')).toBeTruthy();
    expect(getByText('Delete this deck?')).toBeTruthy();
    expect(getByText('This can’t be undone.')).toBeTruthy();
    expect(getByTestId('t/dialog-body')).toBeTruthy();
    fireEvent.press(getByTestId('t/dialog-ok'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
