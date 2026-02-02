import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

export default function UserProfile() {
  return (
    <SafeAreaView className="flex-1 bg-[#f6f6f8] dark:bg-[#101622]">
      <StatusBar barStyle="dark-content" />

      {/* Top App Bar - Sticky Effect by placing outside ScrollView */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-[#f6f6f8]/90 dark:bg-[#101622]/90 border-b border-transparent z-50">
        <TouchableOpacity className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <MaterialIcons
            name="arrow-back"
            size={24}
            className="text-[#111318] dark:text-white"
            color="#111318"
          />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-[#111318] dark:text-white">
          Profile
        </Text>

        <TouchableOpacity className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 hover:bg-[#135bec]/10">
          <MaterialIcons name="edit" size={20} color="#135bec" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="flex-col items-center pt-6 pb-6 px-4">
          <View className="relative">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
              }} // Placeholder for Google Image
              className="h-28 w-28 rounded-full border-4 border-white dark:border-gray-800"
            />
            <View className="absolute bottom-1 right-1 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
              <MaterialIcons name="check-circle" size={16} color="#22c55e" />
            </View>
          </View>

          <View className="mt-4 flex-col items-center gap-2">
            <Text className="text-2xl font-bold text-[#111318] dark:text-white text-center">
              Alex Johnson
            </Text>
            <View className="rounded-full bg-[#135bec]/10 px-3 py-1 border border-[#135bec]/20">
              <Text className="text-sm font-medium text-[#135bec]">
                Student
              </Text>
            </View>
          </View>
        </View>

        {/* Section: Academic Details */}
        <View className="px-4 mt-2">
          <Text className="text-[#616f89] dark:text-gray-400 text-sm font-bold uppercase tracking-wider px-2 pb-2">
            Academic Details
          </Text>

          <View className="bg-white dark:bg-[#1a2230] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <View className="flex-row flex-wrap">
              {/* Grid Item 1: ID */}
              <View className="w-1/2 p-4 border-b border-r border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center gap-2 mb-1">
                  <MaterialIcons name="badge" size={20} color="#135bec" />
                  <Text className="text-[#616f89] dark:text-gray-400 text-xs font-medium">
                    Institute ID
                  </Text>
                </View>
                <Text className="text-[#111318] dark:text-white text-base font-semibold">
                  2023-CS-042
                </Text>
              </View>

              {/* Grid Item 2: Roll No */}
              <View className="w-1/2 p-4 border-b border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center gap-2 mb-1">
                  <MaterialIcons name="push-pin" size={20} color="#135bec" />
                  <Text className="text-[#616f89] dark:text-gray-400 text-xs font-medium">
                    Roll Number
                  </Text>
                </View>
                <Text className="text-[#111318] dark:text-white text-base font-semibold">
                  42
                </Text>
              </View>

              {/* Grid Item 3: Dept */}
              <View className="w-1/2 p-4 border-r border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center gap-2 mb-1">
                  <MaterialIcons name="school" size={20} color="#135bec" />
                  <Text className="text-[#616f89] dark:text-gray-400 text-xs font-medium">
                    Department
                  </Text>
                </View>
                <Text className="text-[#111318] dark:text-white text-base font-semibold">
                  CSE
                </Text>
              </View>

              {/* Grid Item 4: Year */}
              <View className="w-1/2 p-4">
                <View className="flex-row items-center gap-2 mb-1">
                  <MaterialIcons name="history-edu" size={20} color="#135bec" />
                  <Text className="text-[#616f89] dark:text-gray-400 text-xs font-medium">
                    Graduation Year
                  </Text>
                </View>
                <Text className="text-[#111318] dark:text-white text-base font-semibold">
                  2025
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section: Academic Management */}
        <View className="px-4 mt-6">
          <Text className="text-[#616f89] dark:text-gray-400 text-sm font-bold uppercase tracking-wider px-2 pb-2">
            Academic Management
          </Text>
          <View className="bg-white dark:bg-[#1a2230] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* List Item 1 */}
            <TouchableOpacity className="flex-row items-center w-full p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-800">
              <View className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#135bec]/10 mr-4">
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color="#135bec"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[#111318] dark:text-white text-base font-medium">
                  My Timetables
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>

            {/* List Item 2 */}
            <TouchableOpacity className="flex-row items-center w-full p-4 active:bg-gray-50 dark:active:bg-gray-800">
              <View className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#135bec]/10 mr-4">
                <MaterialIcons name="book" size={20} color="#135bec" />
              </View>
              <View className="flex-1">
                <Text className="text-[#111318] dark:text-white text-base font-medium">
                  Enrolled Subjects
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                  <Text className="text-gray-600 dark:text-gray-300 text-xs font-bold">
                    6
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Account Security */}
        <View className="px-4 mt-6 mb-4">
          <Text className="text-[#616f89] dark:text-gray-400 text-sm font-bold uppercase tracking-wider px-2 pb-2">
            Account Security
          </Text>
          <View className="bg-white dark:bg-[#1a2230] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <TouchableOpacity className="flex-row items-center w-full p-4 active:bg-gray-50 dark:active:bg-gray-800">
              <View className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 mr-4">
                <MaterialIcons
                  name="lock"
                  size={20}
                  className="text-gray-600 dark:text-gray-400"
                  color="#4b5563"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[#111318] dark:text-white text-base font-medium">
                  Change Password
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-4 mt-2">
          <TouchableOpacity className="w-full bg-white dark:bg-[#1a2230] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex-row items-center justify-center gap-2 active:scale-95 active:bg-red-50 dark:active:bg-red-900/10 transition-transform">
            <MaterialIcons name="logout" size={20} color="#dc2626" />
            <Text className="text-red-600 dark:text-red-400 font-semibold">
              Log Out
            </Text>
          </TouchableOpacity>
          <Text className="text-center text-gray-400 text-xs mt-6 mb-8">
            Version 2.4.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
