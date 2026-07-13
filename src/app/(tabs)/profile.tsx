import { AppScreen } from '@/design-system';
import { RoutePlaceholder } from '@/design-system/dev/route-placeholder';

export default function SettingsScreen() {
  return (
    <AppScreen node="settings/screen" title="Settings">
      <RoutePlaceholder title="Settings" wbs="10.1" />
    </AppScreen>
  );
}
