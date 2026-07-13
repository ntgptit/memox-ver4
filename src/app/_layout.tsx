import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useMemoxFonts } from '@/design-system';
import { PersistedThemeProvider } from '@/features/settings/ui';

// Hold the splash screen until the fonts (WBS 1.3) have loaded, so no text ever
// flashes in a system fallback. Registered at module scope per the Expo docs.
SplashScreen.preventAutoHideAsync();

// Root navigation. Groups: (tabs) root tabs · session (5-stage study flow) · settings ·
// deck/[deckId] detail. Sheets/editors are modal routes. Full screen→route map + back /
// deep-link notes live in docs/adr/0002-routing.md (WBS 0.2). ThemeProvider (WBS 1.2)
// wraps the tree so every component resolves light/dark from tokens; db + safe-area
// providers are added by WBS 0.4/2.1 as those land.
export default function RootLayout() {
  const [fontsLoaded, fontError] = useMemoxFonts();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Keep the splash up until fonts resolve; on load error, fall through rather than
  // block the app forever (text degrades to a fallback, surfaced by the 1.8 tests).
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <PersistedThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="deck/[deckId]" options={{ headerShown: false }} />
        <Stack.Screen name="session" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="card/new" options={{ presentation: 'modal', title: 'New card' }} />
        <Stack.Screen name="card/[cardId]" options={{ presentation: 'modal', title: 'Edit card' }} />
        <Stack.Screen name="search" options={{ presentation: 'modal', title: 'Search' }} />
        <Stack.Screen name="player" options={{ presentation: 'modal', title: 'Player' }} />
      </Stack>
    </PersistedThemeProvider>
  );
}
