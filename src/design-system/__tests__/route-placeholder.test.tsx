/**
 * Sample RN COMPONENT test (WBS 0.13) — renders a real RN component with
 * @testing-library/react-native and asserts on the output.
 *
 * Uses the dev `RoutePlaceholder` (the component every not-yet-built route renders).
 * This exercises the full RNTL render pipeline the component suite (WBS 1.8) builds on.
 */

import { render } from '@testing-library/react-native';

import { RoutePlaceholder } from '@/design-system/dev/route-placeholder';

describe('RoutePlaceholder (WBS 0.2 dev component)', () => {
  it('renders the screen title', () => {
    const { getByText } = render(<RoutePlaceholder title="Library" wbs="3.3" />);
    // getByText throws if the node is absent, so a returned node is the assertion.
    expect(getByText('Library')).toBeTruthy();
  });

  it('renders the not-implemented notice with its WBS id', () => {
    const { getByText } = render(<RoutePlaceholder title="Library" wbs="3.3" />);
    expect(getByText('WBS 3.3 — screen not implemented yet')).toBeTruthy();
  });
});
