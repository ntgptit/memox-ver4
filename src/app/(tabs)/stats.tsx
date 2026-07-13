import { AppScreen } from '@/design-system';
import { RoutePlaceholder } from '@/design-system/dev/route-placeholder';

export default function StatsScreen() {
  return (
    <AppScreen node="statistics/screen" title="Statistics">
      <RoutePlaceholder title="Stats" wbs="8.1" />
    </AppScreen>
  );
}
