import React, { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions, // Import this
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { FontAwesome } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

// --- Types ---
type IconName = keyof typeof FontAwesome.glyphMap;

interface ColorTheme {
  barBg: string;
  indicator: string;
  activeIcon: string;
  inactiveIcon: string;
  text: string;
}

interface TabItemProps {
  icon: IconName;
  label: string;
  isActive: boolean;
  onPress: () => void;
  colors: ColorTheme;
}

interface CustomTabBarProps extends BottomTabBarProps {
  isDark: boolean;
}

// --- Configuration ---
const ACTIVE_SPRING_CONFIG = {
  damping: 30,
  stiffness: 250,
  mass: 1,
};

const PRESET_COLORS = {
  light: {
    barBg: "#F4F4F5",
    indicator: "#18181B",
    activeIcon: "#FFFFFF",
    inactiveIcon: "#71717A",
    text: "#FFFFFF",
  },
  dark: {
    barBg: "#18181B",
    indicator: "#FFFFFF",
    activeIcon: "#000000",
    inactiveIcon: "#A1A1AA",
    text: "#000000",
  },
};

// --- Helper Component: The Individual Tab ---
const TabItem = ({ icon, label, isActive, onPress, colors }: TabItemProps) => {
  const animValue = useSharedValue(0);

  useEffect(() => {
    animValue.value = withTiming(isActive ? 1 : 0, {
      duration: 200,
    });
  }, [isActive]);

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: animValue.value,
      transform: [
        { translateX: interpolate(animValue.value, [0, 1], [-10, 0]) }, // Reduced slide distance for tighter spaces
      ],
    };
  });

  return (
    <Pressable onPress={onPress} style={styles.tabItemContainer}>
      <View style={styles.iconContainer}>
        <FontAwesome
          name={icon}
          size={22}
          color={isActive ? colors.activeIcon : colors.inactiveIcon}
        />
      </View>

      {isActive && (
        <Animated.View style={[styles.labelContainer, textStyle]}>
          <Text
            numberOfLines={1}
            style={[styles.labelText, { color: colors.text }]}
          >
            {label}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
};

// --- Main Component ---
export const CustomTabBar = ({
  state,
  descriptors,
  navigation,
  isDark,
}: CustomTabBarProps) => {
  const colors = isDark ? PRESET_COLORS.dark : PRESET_COLORS.light;
  const activeIndex = useSharedValue(state.index);

  // 1. Get Screen Width
  const { width: screenWidth } = useWindowDimensions();

  // 2. Dynamic Calculations
  const TAB_COUNT = state.routes.length;
  // Total available width for the tabs (Screen width - margins)
  const TOTAL_BAR_WIDTH = Math.min(screenWidth - 32, 400);
  // How much width the expanded tab should take (roughly 30-40% of bar)
  const TAB_WIDTH_EXPANDED = 130;
  // Calculate remaining space and divide by inactive tabs
  // (Total - Expanded - PaddingBuffer) / (InactiveTabs)
  const TAB_WIDTH_COLLAPSED =
    (TOTAL_BAR_WIDTH - TAB_WIDTH_EXPANDED - 20) / (TAB_COUNT - 1);

  useEffect(() => {
    activeIndex.value = withSpring(state.index, ACTIVE_SPRING_CONFIG);
  }, [state.index]);

  // --- Slider Animation ---
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: activeIndex.value * TAB_WIDTH_COLLAPSED }],
      width: TAB_WIDTH_EXPANDED,
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.barBg,
          width: TOTAL_BAR_WIDTH, // Force container width
        },
      ]}
    >
      {/* BACKGROUND SLIDER */}
      <Animated.View
        style={[
          styles.slider,
          indicatorStyle,
          { backgroundColor: colors.indicator },
        ]}
      />

      {/* TABS LAYER */}
      <View style={styles.tabsLayer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.title === "string" ? options.title : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          let iconName: IconName = "circle";
          if (route.name === "dashboard") iconName = "home";
          if (route.name === "timetable") iconName = "calendar";
          if (route.name === "subjects") iconName = "book";
          if (route.name === "events") iconName = "calendar-check-o";
          if (route.name === "details") iconName = "info-circle";

          // Dynamic Width Animation
          const tabWidthStyle = useAnimatedStyle(() => {
            const distance = Math.abs(activeIndex.value - index);
            const width = interpolate(
              distance,
              [0, 1],
              [TAB_WIDTH_EXPANDED, TAB_WIDTH_COLLAPSED],
              "clamp",
            );
            return { width };
          });

          return (
            <Animated.View
              key={route.key}
              style={[tabWidthStyle, styles.tabWrapper]}
            >
              <TabItem
                icon={iconName}
                label={label}
                isActive={isFocused}
                onPress={onPress}
                colors={colors}
              />
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    height: 75,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 8, // Fixed padding
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  slider: {
    position: "absolute",
    height: 58,
    borderRadius: 30,
    top: 8.5,
    left: 8,
    zIndex: 0,
  },
  tabsLayer: {
    flexDirection: "row",
    zIndex: 1,
  },
  tabWrapper: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  tabItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  iconContainer: {
    width: 30, // Slightly tighter icon container
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  labelContainer: {
    marginLeft: 4, // Reduce margin to save space
    justifyContent: "center",
  },
  labelText: {
    fontWeight: "700",
    fontSize: 14, // Slightly smaller text for 5 tabs
  },
});
