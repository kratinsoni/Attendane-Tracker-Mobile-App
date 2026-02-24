import { useAddSubjectsToTimetable } from "@/hooks/useEditTimetableSubjects";
import { useGetAllSubjectsNotInTimetable } from "@/hooks/useGetTimetableById";
import { SubjectInterface } from "@/types/subjectTypes";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function AddSubjectsScreen() {
  const id = useLocalSearchParams().id;

  const {data: subjectsNotInTimetable} = useGetAllSubjectsNotInTimetable(id as string);

  const {mutate: addSubjectsToTimetable} = useAddSubjectsToTimetable(id as string);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // Default selected matching your image
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedIds.length === subjectsNotInTimetable?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subjectsNotInTimetable?.map((sub: SubjectInterface) => sub._id) || []);
    }
  };

  const renderItem = ({ item }: any) => {
    const isSelected = selectedIds.includes(item._id);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => toggleSelection(item._id)}
        className={`flex-row items-center justify-between p-4 mb-2 rounded-xl bg-white dark:bg-slate-800 border ${
          isSelected
            ? "border-2 border-emerald-500/40"
            : "border border-slate-200 dark:border-slate-700"
        }`}
      >
        <View className="flex-row items-center flex-1 mr-4">
          {/* Custom Checkbox */}
          <View
            className={`w-5 h-5 rounded border-2 items-center justify-center mr-4 ${
              isSelected
                ? "bg-emerald-500 border-emerald-500"
                : "border-slate-300 dark:border-slate-500"
            }`}
          >
            {isSelected && (
              <MaterialIcons name="check" size={14} color="white" />
            )}
          </View>

          {/* Subject Details */}
          <View className="flex-1">
            <Text
              className="text-slate-800 dark:text-slate-100 text-base font-semibold"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <View className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                <Text className="text-slate-500 dark:text-slate-300 text-xs font-medium">
                  {item.code}
                </Text>
              </View>
              <Text className="text-slate-300 dark:text-slate-500 text-xs mx-2">
                •
              </Text>
              <Text
                className={`text-xs font-medium uppercase tracking-wide ${
                  item.type === "LAB" ? "text-blue-500" : "text-emerald-500"
                }`}
              >
                {item.type}
              </Text>
            </View>
          </View>
        </View>

        {/* Right Action Button */}
        <View
          className={`w-8 h-8 rounded-full items-center justify-center ${
            isSelected
              ? "bg-emerald-500"
              : "bg-emerald-500/10 dark:bg-emerald-500/20"
          }`}
        >
          <MaterialIcons
            name={isSelected ? "check" : "add"}
            size={20}
            color={isSelected ? "white" : "#10b981"}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const handleAddSubject = () => {
    addSubjectsToTimetable(selectedIds);
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top App Bar */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800">
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? "#f8fafc" : "#334155"}
          />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1 text-center pr-2">
          Add Subjects
        </Text>
        <TouchableOpacity>
          <Text className="text-emerald-500 font-semibold text-sm px-3 py-1.5">
            Create New
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar Pinned */}
      <View className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-10">
        <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 rounded-xl px-3 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500">
          <MaterialIcons name="search" size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 py-3 pl-2 pr-4 text-sm font-medium text-slate-900 dark:text-slate-100"
            placeholder="Search subjects by name or code..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View className="flex-row items-center justify-between mt-3 px-1 text-xs font-medium">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">
            SUGGESTED
          </Text>
          <TouchableOpacity onPress={selectAll}>
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium hover:text-emerald-500">
              Select All
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content List */}
      <FlatList
        data={subjectsNotInTimetable}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Action Button (Floating) */}
      {selectedIds.length > 0 && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 flex-row items-center bg-emerald-500 px-6 py-3.5 rounded-full shadow-lg shadow-emerald-500/30 active:scale-95"
          activeOpacity={0.8}
          onPress={handleAddSubject}
        >
          <MaterialIcons name="check" size={20} color="white" />
          <Text className="text-white font-bold text-base ml-2">
            Done ({selectedIds.length})
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
