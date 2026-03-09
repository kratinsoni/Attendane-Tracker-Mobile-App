import { useMe } from "@/hooks/useMe";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  SectionList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../components/EmptyState";
import { EventCard } from "../components/EventCard";
import { useEvents } from "../hooks/useEvents";
import { AppEvent, EventType } from "../types/event";
import { ChevronLeft, User } from "lucide-react-native";
import * as Haptics from "expo-haptics";

const formatDateGroup = (isoString: string) => {
  const date = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-US", options);

  if (isToday) return `Today, ${formattedDate}`;
  if (isTomorrow) return `Tomorrow, ${formattedDate}`;
  return formattedDate;
};

const EVENT_TYPES = ["All", "Exam", "Assignment", "Test", "Other"];

export const EventsScreen = () => {
  const { data } = useMe();
  const { data: events, isLoading, isError } = useEvents();
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<EventType | "All">("All");
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);

  const sectionedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    let eventsToDisplay = sortedEvents;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      eventsToDisplay = eventsToDisplay.filter(
        (event) =>
          event.name?.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query),
      );
    }

    if (selectedType !== "All") {
      eventsToDisplay = eventsToDisplay.filter(
        (event) => event.type === selectedType,
      );
    }

    return eventsToDisplay.reduce(
      (acc, event) => {
        const groupTitle = formatDateGroup(event.date);
        const group = acc.find((g) => g.title === groupTitle);

        if (group) {
          group.data.push(event);
        } else {
          acc.push({ title: groupTitle, data: [event] });
        }
        return acc;
      },
      [] as { title: string; data: AppEvent[] }[],
    );
  }, [events, searchQuery, selectedType]);

  const handleBack = () => {
    if (Platform.OS === "android") Vibration.vibrate(20);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-background-dark">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View className="px-5 pt-2 pb-2">
        {/* Header matching the photo */}
        <View className="flex-row items-center justify-between mb-6 mt-2">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ChevronLeft size={28} color="#135bec" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
              Events
            </Text>
          </View>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">

            <User size={24} color="#135bec" onPress={() => {

              if (Platform.OS === "android") {

                // Forces the motor to spin up and stop in exactly 20 milliseconds.

                // This creates a sharp "tick" rather than a soft buzz.

                Vibration.vibrate(20);

              } else {

                // iOS handles impacts much better natively, so stick to Expo here

                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

              }

              router.push("/profile/profile")}}/>
          </TouchableOpacity>
        </View>

        {/* Large Search Bar */}
        <View className="mb-4 shadow-sm">
          <View className="relative w-full justify-center">
            <MaterialIcons
              name="search"
              size={22}
              color={isDark ? "#64748B" : "#94A3B8"}
              style={{ position: "absolute", left: 16, zIndex: 10 }}
            />
            <TextInput
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-base font-medium text-slate-900 dark:text-slate-100"
              placeholder="Search by name or location"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Pill-shaped Filters */}
        <View className="flex-row items-center gap-3 mb-2">
          <TouchableOpacity
            onPress={() => setIsTypeMenuOpen(true)}
            className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm"
          >
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {selectedType === "All" ? "Type" : selectedType}
            </Text>
            <MaterialIcons 
              name="expand-more" 
              size={18} 
              color={isDark ? "#94A3B8" : "#64748B"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-red-500 font-medium text-center">
            Failed to load events. Please try again later.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sectionedEvents}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          ListEmptyComponent={<EmptyState />}
          renderSectionHeader={({ section: { title } }) => (
            <View className="flex-row items-center gap-3 mb-4 mt-4">
              <Text className="text-xs font-bold tracking-wider uppercase text-slate-400">
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => <EventCard event={item} />}
        />
      )}

      {/* Dropdown Menu Modal */}
      <Modal
        visible={isTypeMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsTypeMenuOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center px-10"
          activeOpacity={1}
          onPress={() => setIsTypeMenuOpen(false)}
        >
          <View className="bg-white dark:bg-slate-900 w-full rounded-2xl overflow-hidden shadow-xl">
            <View className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
              <Text className="text-base font-bold text-slate-800 dark:text-slate-200 text-center">
                Select Event Type
              </Text>
            </View>
            {EVENT_TYPES.map((type, index) => (
              <TouchableOpacity
                key={type}
                className={`py-4 border-b border-gray-100 dark:border-slate-800 ${
                  selectedType === type 
                    ? "bg-blue-50/50 dark:bg-blue-900/20" 
                    : "bg-white dark:bg-slate-900"
                } ${index === EVENT_TYPES.length - 1 ? "border-b-0" : ""}`}
                onPress={() => {
                  setSelectedType(type as EventType | "All");
                  setIsTypeMenuOpen(false);
                }}
              >
                <Text
                  className={`text-center font-medium ${
                    selectedType === type 
                      ? "text-[#135bec] dark:text-blue-400" 
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        className="absolute bottom-40 right-6 bg-blue-600 w-14 h-14 rounded-full justify-center items-center shadow-lg shadow-blue-300 dark:shadow-none z-10"
        onPress={() => router.push("/event/eventCreateScreen")}
      >
        <MaterialIcons name="add" size={30} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};