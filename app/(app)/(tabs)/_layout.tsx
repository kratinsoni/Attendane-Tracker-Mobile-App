import { withLayoutContext } from "expo-router";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap,
} from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { CustomTabBar } from "../../../components/TabItem";

const TopTabNavigator = createMaterialTopTabNavigator();

// Pass ONLY the Navigator, and provide explicit TypeScript generics
export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof TopTabNavigator.Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(TopTabNavigator.Navigator);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      screenOptions={{ swipeEnabled: true }}
      tabBar={(props) => <CustomTabBar {...props} isDark={isDark} />}
    >
      <MaterialTopTabs.Screen name="dashboard" options={{ title: "Home" }} />
      <MaterialTopTabs.Screen
        name="timetable"
        options={{ title: "Timetable" }}
      />
      <MaterialTopTabs.Screen name="subjects" options={{ title: "Subjects" }} />
      <MaterialTopTabs.Screen name="events" options={{ title: "Events" }} />
      <MaterialTopTabs.Screen name="details" options={{ title: "Overview" }} />
    </MaterialTopTabs>
  );
}
