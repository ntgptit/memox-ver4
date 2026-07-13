import { AppScreen, MxFab } from '@/design-system';
import { RoutePlaceholder } from '@/design-system/dev/route-placeholder';

export default function TodayScreen() {
  return (
    <AppScreen node="dashboard/screen" title="Today" fab={<MxFab icon="add" accessibilityLabel="Add" />}>
      <RoutePlaceholder title="Today" wbs="5.3" />
    </AppScreen>
  );
}
