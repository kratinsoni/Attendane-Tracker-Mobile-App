import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import "../global.css";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "Index",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(auth)/login"
            options={{
              title: "Login",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(auth)/register-init"
            options={{
              title: "Register Init",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(auth)/register"
            options={{
              title: "Register Main",
              headerShown: false,
            }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      <Toast />
    </QueryClientProvider>
  );
}
