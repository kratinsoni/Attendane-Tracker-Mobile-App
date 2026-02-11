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
        <Stack.Screen
          name="timetable/createTimetablePage"
          options={{
            title: "Create Timetable",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="timetable/TimetableHomePage"
          options={{
            title: "Timetable Home",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="timetable/[id]"
          options={{
            title: "Timetable Details",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="timetable/attendanceMarkingPage/[id]"
          options={{
            title: "Attendance Marking",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/profile"
          options={{
            title: "Profile page",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="subject/GetAllSubjects"
          options={{
            title: "Subject page",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="subject/create"
          options={{
            title: "Subject Addition",
            headerShown: false,
          }}
        />
      </Stack>
      <Toast/>
    </QueryClientProvider>
  );
}
