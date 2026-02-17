import { Stack } from "expo-router";
import { AuthLayout } from "@/components/AuthLayout";

export default function AppLayout() {
  return (
    <AuthLayout>
      <Stack screenOptions={{ headerShown: false }} >
        <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
        <Stack.Screen name="Dashboard/Dashboard" options={{headerShown: false}}/>
        <Stack.Screen name="profile/profile" options={{headerShown: false}}/>
        <Stack.Screen name="subject/create" options={{headerShown: false}}/>
        <Stack.Screen name="timetable/createTimetablePage" options={{headerShown: false}}/>
        <Stack.Screen name="timetable/attendanceMarkingPage/[id]" options={{headerShown: false}}/>
      </Stack>
    </AuthLayout>
  );
}