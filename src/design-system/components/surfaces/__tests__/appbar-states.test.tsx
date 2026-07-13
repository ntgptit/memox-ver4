/**
 * App-bar state coverage (WBS 2.2) — all 8 documented app-bar states render and
 * compose from the primitives. The full shell/theme state-matrix + interaction suite
 * is WBS 2.4; this proves each state renders with the right pieces.
 */

import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import {
  ThemeProvider,
  MxContextualAppBar,
  MxIconButton,
  MxSearchDock,
  MxButton,
  MxBadge,
} from '@/design-system';

function renderThemed(ui: ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

const back = <MxIconButton icon="arrow_back" accessibilityLabel="Back" />;
const close = <MxIconButton icon="close" accessibilityLabel="Close" />;

describe('app-bar states (WBS 2.2)', () => {
  it('root-top: transparent bar with a heading', () => {
    const { getByText } = renderThemed(<MxContextualAppBar node="ab" variant="root" title="Today" />);
    expect(getByText('Today')).toBeTruthy();
  });

  it('root-scrolled: elevated bar with a heading', () => {
    const { getByTestId } = renderThemed(
      <MxContextualAppBar node="ab" variant="root" title="Today" scrolled />,
    );
    expect(getByTestId('ab')).toBeTruthy();
  });

  it('root-unread: root bar with a notification action carrying an unread badge', () => {
    const { getByText } = renderThemed(
      <MxContextualAppBar
        node="ab"
        variant="root"
        title="Today"
        actions={
          <>
            <MxIconButton icon="notifications" accessibilityLabel="Alerts" />
            <MxBadge tone="error">2</MxBadge>
          </>
        }
      />,
    );
    expect(getByText('2')).toBeTruthy();
  });

  it('nested: back leading + title + context breadcrumb', () => {
    const { getByText, getByLabelText } = renderThemed(
      <MxContextualAppBar node="ab" variant="nested" leading={back} context="Spanish" title="Verbs" />,
    );
    expect(getByText('Verbs')).toBeTruthy();
    expect(getByText('Spanish')).toBeTruthy();
    expect(getByLabelText('Back')).toBeTruthy();
  });

  it('nested-overflow: nested bar with an overflow action', () => {
    const { getByLabelText } = renderThemed(
      <MxContextualAppBar
        node="ab"
        variant="nested"
        leading={back}
        title="Verbs"
        actions={<MxIconButton icon="more_vert" accessibilityLabel="More" />}
      />,
    );
    expect(getByLabelText('More')).toBeTruthy();
  });

  it('search: a search dock fills the main slot', () => {
    const { getByPlaceholderText } = renderThemed(
      <MxContextualAppBar
        node="ab"
        variant="search"
        leading={back}
        main={<MxSearchDock flat placeholder="Search words" />}
      />,
    );
    expect(getByPlaceholderText('Search words')).toBeTruthy();
  });

  it('selection: a count + selection actions on a tinted bar', () => {
    const { getByText, getByLabelText } = renderThemed(
      <MxContextualAppBar
        node="ab"
        variant="selection"
        count={3}
        leading={close}
        actions={<MxIconButton icon="delete" accessibilityLabel="Delete" />}
      />,
    );
    expect(getByText('3 selected')).toBeTruthy();
    expect(getByLabelText('Delete')).toBeTruthy();
  });

  it('modal: centered title between a close and a Save action', () => {
    const { getByText, getByLabelText } = renderThemed(
      <MxContextualAppBar
        node="ab"
        variant="modal"
        leading={close}
        title="New card"
        actions={
          <MxButton variant="ghost" onPress={() => {}}>
            Save
          </MxButton>
        }
      />,
    );
    expect(getByText('New card')).toBeTruthy();
    expect(getByText('Save')).toBeTruthy();
    expect(getByLabelText('Close')).toBeTruthy();
  });
});
