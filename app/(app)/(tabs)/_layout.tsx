import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { CustomTabBar } from "../../../components/TabItem"; // Import the file above

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} isDark={isDark} />}
      >
        <Tabs.Screen
          name="dashboard"
          options={{ title: "Home", headerShown: false }}
        />
        <Tabs.Screen
          name="timetable"
          options={{ title: "Timetable", headerShown: false }}
        />
        <Tabs.Screen
          name="subjects"
          options={{ title: "Subjects", headerShown: false }}
        />
        <Tabs.Screen
          name="events"
          options={{ title: "Events", headerShown: false }}
        />
        <Tabs.Screen
          name="details"
          options={{ title: "Details", headerShown: false }}
        />
      </Tabs>
  );
}
