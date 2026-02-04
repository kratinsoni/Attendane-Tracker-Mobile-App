import { Stack } from 'expo-router';
import "../global.css"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import Toast from "react-native-toast-message";


const queryClient = new QueryClient();

export default function RootLayout() {

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
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
      </Stack>
      <Toast/>
    </QueryClientProvider>
  );
}
