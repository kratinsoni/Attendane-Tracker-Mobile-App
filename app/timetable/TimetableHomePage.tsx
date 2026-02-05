import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Menu,
  UserCircle,
  Search,
  Calendar,
  Edit2,
  Archive,
  Plus,
} from "lucide-react-native";
import { TimetableCard } from "@/components/TimetableCard";
import { router } from "expo-router";

export default function TimetableScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="dark-content" />

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
          />
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        className="p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <TimetableCard
          title="Fall Semester 2023"
          date="Oct 24, 2023"
          semester="Fall 2023"
          gradientColor="bg-blue-500"
        />
        <TimetableCard
          title="Spring Semester 2024"
          date="Jan 15, 2024"
          semester="Spring 2024"
          gradientColor="bg-emerald-500"
        />
        <TimetableCard
          title="Summer Short Course"
          date="May 02, 2024"
          semester="Summer 2024"
          gradientColor="bg-amber-500"
        />
        <TimetableCard
          title="Archived: 2022 Academic Year"
          date="Dec 12, 2022"
          isArchived={true}
          gradientColor="bg-slate-400"
          semester={"Summer 2025"}
        />
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
        className="absolute bottom-8 right-6 h-16 w-16 items-center justify-center rounded-full bg-blue-600 z-50"
        onPress={() => router.push("/timetable/createTimetablePage")}
      >
        <Plus size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
