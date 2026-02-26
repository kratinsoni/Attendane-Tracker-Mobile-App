import LoadingScreen from "@/components/Loading";
import { TimetableCard } from "@/components/TimetableCard";
import { useGetUserTimetables } from "@/hooks/useGetUserTimetables";
import { TimetableCardType } from "@/types/timetableTypes";
import { router } from "expo-router";
import { Menu, Plus, Search, UserCircle } from "lucide-react-native";
import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import ErrorScreen from "@/components/ErrorPage";

export default function TimetableScreen() {
  // Destructure refetch from your custom hook
  const { data, isLoading, isError, refetch } = useGetUserTimetables();
  const { colorScheme } = useColorScheme();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredData = data?.filter((timetable: TimetableCardType) =>
    timetable.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // State for the pull-to-refresh spinner
  const [refreshing, setRefreshing] = useState(false);

  // Function to handle the pull-down action
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Only show the full-screen loading if we aren't already doing a pull-to-refresh
  if (isLoading && !refreshing) {
    return <LoadingScreen />;
  }

  if(isError){
    return <ErrorScreen/>
  }

  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#101622" : "#f6f6f8"}
      />

      {/* Header */}
      <View className="bg-white/80 dark:bg-slate-900/80 px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <Menu size={24} color="#135bec" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">
            My Timetables
          </Text>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <UserCircle size={24} color="#135bec" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="mb-2 flex-row items-center rounded-xl bg-slate-100 dark:bg-slate-800 px-4 h-12">
          <Search size={20} color="#616f89" />
          <TextInput
            placeholder="Search timetables"
            placeholderTextColor="#616f89"
            className="flex-1 ml-3 text-base text-slate-900 dark:text-white"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#135bec" // iOS spinner color
            colors={["#135bec"]} // Android spinner color
            progressBackgroundColor={isDark ? "#1e293b" : "#ffffff"}
          />
        }
      >
        {filteredData && filteredData.length > 0 ? (
          filteredData.map((timetable: TimetableCardType) => (
            <TimetableCard key={timetable._id} {...timetable} />
          ))
        ) : (
          <View className="mt-20 items-center">
            <Text className="text-slate-500 dark:text-slate-400 text-center">
              {isError
                ? "Failed to load timetables. Pull down to try again."
                : "No timetables found. Create your first timetable!"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={{
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
        }}
        className="absolute bottom-32 right-6 h-16 w-16 items-center justify-center rounded-full bg-blue-600 z-50"
        onPress={() => router.push("/timetable/createTimetablePage")}
      >
        <Plus size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
