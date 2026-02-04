import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Easing,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Standard in Expo

export default function LoadingScreen() {
  // Animation Values
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotation Animation (Spin)
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Pulse Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView className="flex-1 bg-[#f6f6f8] dark:bg-[#101622] items-center justify-between">
      <StatusBar barStyle="dark-content" />

      {/* Top Spacer */}
      <View className="h-12 w-full" />

      {/* Main Content */}
      <View className="flex-1 items-center justify-center w-full px-8">
        <View className="relative items-center justify-center mb-8 h-20 w-20">
          {/* Pulse Circle */}
          <Animated.View
            style={{ transform: [{ scale: pulseValue }] }}
            className="absolute w-20 h-20 bg-[#135bec]/10 rounded-full"
          />

          {/* Spinning Border */}
          <Animated.View
            style={{ transform: [{ rotate: spin }] }}
            className="absolute w-16 h-16 border-2 border-[#135bec]/5 border-t-[#135bec] rounded-full"
          />

          {/* Center Icon Box */}
          <View className="w-12 h-12 bg-[#135bec] rounded-2xl items-center justify-center shadow-lg shadow-[#135bec]/30">
            <MaterialCommunityIcons name="sync" size={24} color="white" />
          </View>
        </View>

        <View className="items-center">
          <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-widest">
            Loading...
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="pb-12 items-center">
        <View className="flex-row items-center gap-2 opacity-60">
          <View className="w-5 h-5 bg-[#135bec] rounded items-center justify-center">
            <MaterialCommunityIcons
              name="check-circle"
              size={14}
              color="white"
            />
          </View>
          <Text className="text-[#101622] dark:text-white font-bold tracking-tight text-base">
            Attendly
          </Text>
        </View>
        <Text className="text-slate-400 dark:text-slate-600 text-[10px] font-bold tracking-[2px] uppercase mt-2">
          Education Systems
        </Text>
      </View>

      {/* Background Blur Effect (Simplified for Mobile) */}
      <View
        pointerEvents="none"
        className="absolute top-1/2 left-1/2 -ml-[250px] -mt-[250px] w-[500px] h-[500px] bg-[#135bec]/5 rounded-full"
        style={{ opacity: 0.5 }}
      />
    </SafeAreaView>
  );
}
