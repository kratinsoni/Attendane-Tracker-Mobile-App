import React, { useEffect } from "react";
import { View, Text, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { cssInterop } from "nativewind";

// Enable LinearGradient to accept Tailwind classes
cssInterop(LinearGradient, {
  className: { target: "style" },
});

/**
 * Animated Wave Bar Component
 */
const WaveBar = ({ delay }: { delay: number }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Start animation loop
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }), // Expand
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }), // Contract
        ),
        -1, // Infinite loop
        false, // Do not reverse automatically
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(progress.value, [0, 1], [8, 24]),
      opacity: interpolate(progress.value, [0, 1], [0.6, 1]),
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      className="w-1.5 bg-[#0ed851] rounded-full mx-[3px]"
    />
  );
};

export default function LoadingScreen() {
  return (
    <View className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient: Mint -> Sage */}
      <LinearGradient
        colors={["#E0F9E6", "#C8E6D3"]}
        className="flex-1 w-full items-center justify-between p-8"
      >
        {/* Top Spacer */}
        <View className="h-12 w-full" />

        {/* Center Brand Identity */}
        <View className="flex-1 items-center justify-center -mt-20">
          {/* Icon Container */}
          <View className="mb-8 relative items-center justify-center">
            {/* Abstract Background Glow */}
            <View className="absolute w-24 h-24 bg-[#0ed851]/20 rounded-full scale-150 blur-xl" />

            {/* Main Icon Card */}
            <View className="bg-white/90 p-6 rounded-3xl shadow-sm border border-white/50 backdrop-blur-sm">
              <View className="relative w-20 h-20 items-center justify-center">
                <MaterialIcons name="person" size={64} color="#0ed851" />

                {/* Checkmark Badge */}
                <View className="absolute top-0 right-0 bg-[#0A3F22] rounded-full p-1.5 border-4 border-white shadow-sm">
                  <MaterialIcons
                    name="check"
                    size={14}
                    color="white"
                    style={{ fontWeight: "bold" }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* App Title */}
          <View className="items-center space-y-2">
            <Text className="text-4xl font-bold text-[#0A3F22] tracking-tight">
              KGP Presence
            </Text>
            <Text className="text-[#0A3F22]/60 text-sm font-medium tracking-wide uppercase">
              Academic Tracker
            </Text>
          </View>
        </View>

        {/* Bottom Loading Section */}
        <View className="pb-16 items-center space-y-6 w-full">
          {/* Wave Animation */}
          <View className="h-8 flex-row items-end justify-center">
            <WaveBar delay={0} />
            <WaveBar delay={100} />
            <WaveBar delay={200} />
            <WaveBar delay={300} />
            <WaveBar delay={400} />
          </View>

          {/* Loading Text */}
          <Text className="text-[#0A3F22]/40 text-xs font-semibold tracking-wider">
            SYNCING DATA...
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
