import { AppScreen, MxFab } from '@/design-system';
import { RoutePlaceholder } from '@/design-system/dev/route-placeholder';

export default function LibraryScreen() {
  return (
    <AppScreen node="library/screen" title="Library" fab={<MxFab icon="add" accessibilityLabel="New deck" />}>
      <RoutePlaceholder title="Library" wbs="3.4" />
    </AppScreen>
  );
}
