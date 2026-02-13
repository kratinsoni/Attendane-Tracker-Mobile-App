import { AuthLayout } from "@/components/AuthLayout";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { CustomTabBar } from "../../components/TabItem"; // Import the file above

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <AuthLayout>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} isDark={isDark} />}
      >
        <Tabs.Screen name="dashboard" options={{ title: "Home" }} />
        <Tabs.Screen name="timetable" options={{ title: "Timetable" }} />
        <Tabs.Screen name="subjects" options={{ title: "Subjects" }} />
        <Tabs.Screen name="events" options={{ title: "Events" }} />
        <Tabs.Screen name="details" options={{ title: "Details" }} />
      </Tabs>
    </AuthLayout>
  );
}
