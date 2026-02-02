import { Stack } from 'expo-router';
import "../global.css"

export default function RootLayout() {

  return (
      <Stack>
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: false }} />
      </Stack>
  );
}
