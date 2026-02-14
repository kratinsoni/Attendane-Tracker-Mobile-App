import {
  Bell,
  ChevronLeft,
  Filter,
  LucideIcon,
  Plus,
  Search,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useGetAllSubjects } from "@/hooks/useGetAllSubjects";
import { BookOpenText, FlaskConical } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ErrorScreen from "@/components/ErrorPage";
import LoadingScreen from "@/components/Loading";

// AuthLayout is imported but not used in your snippet; kept it to preserve imports
import { SubjectCard } from "@/components/SubjectCard";
import { CreateSubjectPayload } from "@/utils/types/subjectTypes";
import { router } from "expo-router";

interface SubjectCardProps extends CreateSubjectPayload {
  createdAt: string;
  updatedAt: string;
  colorClass: string;
  barColor: string;
  IconComponent: LucideIcon;
}

const getAllSubjects = () => {
  const CHIPS = ["All Subjects", "Theory", "Lab"];

  const [tab, setTab] = useState<string>("All Subjects");

  const { data: subjects, isLoading, isError, refetch } = useGetAllSubjects();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("All Subjects");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Function to handle the pull-down action
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const filteredSubjects = useMemo<CreateSubjectPayload[]>(() => {
    if (!subjects) return [];
    return subjects.filter((subject) => {
      const matchesSearch =
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        activeFilter === "All Subjects" ||
        subject.type === activeFilter.toUpperCase();
      return matchesSearch && matchesFilter;
    });
  }, [subjects, searchQuery, activeFilter]);

  const mapSubjectToCard = (
    subject: CreateSubjectPayload,
  ): SubjectCardProps => {
    return {
      ...subject,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      colorClass: subject.type === "THEORY" ? "bg-blue-500" : "bg-green-500",
      barColor: subject.type === "THEORY" ? "#3b82f6" : "#22c55e",
      IconComponent: subject.type === "THEORY" ? BookOpenText : FlaskConical,

      classesAttended: subject.classesAttended,
      totalClasses: subject.totalClasses,
    };
  };

  if (isLoading && !refreshing) {
    return <LoadingScreen />;
  }

  if (isError) {
    return <ErrorScreen />;
  }

  return (
    // FIX 1: Added style={{ flex: 1 }} so SafeAreaView fills the screen.
    // This ensures 'absolute bottom-10' refers to the screen bottom, not the list bottom.
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header Section */}
      <View className="bg-white dark:bg-gray-950 px-4 pt-2 pb-4 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2"
          >
            <ChevronLeft size={24} color="#1152d4" />
            <Text className="text-xl font-bold tracking-tight dark:text-white">
              All Subjects
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="p-2 rounded-full bg-gray-50 dark:bg-gray-800">
            <Bell size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Search & Filter */}
        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 h-11">
            <Search size={18} color="#9ca3af" />
            <TextInput
              placeholder="Search subjects or codes..."
              placeholderTextColor="#9ca3af"
              className="flex-1 ml-2 text-sm dark:text-white"
              // FIX 2: Connected the input to state so searching works
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity className="w-11 h-11 bg-primary/10 items-center justify-center rounded-xl">
            <Filter size={20} color="#1152d4" />
          </TouchableOpacity>
        </View>

        {/* Horizontal Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {CHIPS.map((chip, index) => (
            <TouchableOpacity
              key={chip}
              onPress={() => (setActiveFilter(chip), setTab(chip))}
              className={`px-4 py-2 rounded-full mr-2 ${
                tab == chip
                  ? "bg-primary text-white"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-black"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  tab === chip
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredSubjects}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <SubjectCard {...mapSubjectToCard(item)} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No subjects found
          </Text>
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* Floating Action Button */}
      {/* Since the parent SafeAreaView now has flex: 1, this absolute positioning
         will correctly place the button at the bottom right of the SCREEN.
      */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("/subject/create")}
        className="absolute bottom-10 right-6 w-16 h-16 bg-blue-600 rounded-full items-center justify-center z-50 shadow-2xl"
        style={{
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
        }}
      >
        <Plus size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default getAllSubjects;
