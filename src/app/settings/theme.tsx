import { useRouter } from 'expo-router';

import { ThemeScreen } from '@/features/settings/ui';

export default function ThemeRoute() {
  const router = useRouter();
  return <ThemeScreen onBack={() => router.back()} />;
}
