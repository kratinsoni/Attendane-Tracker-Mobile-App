import React from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, CloudOff } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";

export default function ErrorScreen() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header / Navigation Bar */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="size-12 items-center justify-center -ml-2"
        >
          <ChevronLeft size={28} color={isDark ? "#FFFFFF" : "#0f172a"} />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Attendance Tracker
          </Text>
        </View>

        {/* Spacer for centering */}
        <View className="size-12" />
      </View>

      {/* Main Content Area */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-sm items-center">
          {/* Illustration/Icon Section */}
          <View className="mb-10 items-center justify-center">
            <View className="size-56 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/50">
              {/* Central Icon */}
              <View className="items-center">
                <CloudOff
                  size={80}
                  color={isDark ? "#ef4444" : "#f87171"}
                  strokeWidth={1.5}
                />
                <View className="mt-4 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
              </View>
            </View>
          </View>

          {/* Text Content */}
          <View className="items-center mb-10">
            <Text className="text-center text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              Something went wrong
            </Text>
            <Text className="mt-3 px-4 text-center text-base font-normal leading-relaxed text-slate-500 dark:text-slate-400">
              An unexpected error occurred. Please try again or check your
              internet connection.
            </Text>
          </View>

          {/* Actions */}
          <View className="w-full gap-y-4">
            <TouchableOpacity
              activeOpacity={0.8}
              className="h-14 w-full items-center justify-center rounded-xl bg-[#135bec]"
            >
              <Text className="text-base font-semibold text-white">
                Try Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.6}
              className="h-12 w-full items-center justify-center"
            >
              <Text className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
