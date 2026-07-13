import { Stack } from 'expo-router';

// Root navigation. Groups: (tabs) root tabs · session (5-stage study flow) · settings ·
// deck/[deckId] detail. Sheets/editors are modal routes. Full screen→route map + back /
// deep-link notes live in docs/adr/0002-routing.md (WBS 0.2). Providers (theme, db, safe-area)
// are added by WBS 1.2 / 0.4 as those land.
export default function RootLayout() {
  return (
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
  );
}
