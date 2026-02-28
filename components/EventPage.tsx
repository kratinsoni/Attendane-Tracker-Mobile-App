import { useMe } from "@/hooks/useMe";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  SectionList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../components/EmptyState";
import { EventCard } from "../components/EventCard";
import { useEvents } from "../hooks/useEvents";
import { AppEvent, EventType } from "../types/event";

// Helper to create grouping headers like "Today, Oct 24"
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
  return formattedDate; // e.g., "Oct 26"
};

// Available event types based on your payload
const EVENT_TYPES = ["All", "Exam", "Assignment", "Test", "Other"];

export const EventsScreen = () => {
  const { data } = useMe();
  const { data: events, isLoading, isError } = useEvents();

  // States for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<EventType | "All">("All");
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);

  // Process data: Sort -> Search Filter -> Type Filter -> Group
  const sectionedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    // 1. ALWAYS sort all events chronologically first (earliest date first)
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    let eventsToDisplay = sortedEvents;

    // 2. Filter by Search Query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      eventsToDisplay = eventsToDisplay.filter(
        (event) =>
          event.name?.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query),
      );
    }

    // 3. Filter by Event Type
    if (selectedType !== "All") {
      eventsToDisplay = eventsToDisplay.filter(
        (event) => event.type === selectedType,
      );
    }

    // 4. Group the processed events by date for the SectionList
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

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View className="px-5 pt-4 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            className="flex h-10 w-10 items-center justify-center rounded-full"
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#111318" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            Events
          </Text>
          <TouchableOpacity
            className="relative"
            onPress={() => router.push("/profile/profile")}
          >
            <Image
              source={{
                uri: `https://picsum.photos/seed/${data?._id}/400/200`,
              }}
              className="w-12 h-12 rounded-full border-2 border-primary"
            />
            <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-background-dark rounded-full" />
          </TouchableOpacity>
        </View>

        {/* Search & Filters */}
        <View className="flex-col gap-4">
          <View className="relative w-full justify-center">
            <MaterialIcons
              name="search"
              size={18}
              color="#94A3B8"
              style={{ position: "absolute", left: 14, zIndex: 10 }}
            />
            <TextInput
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 text-sm font-medium text-slate-900"
              placeholder="Search events..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View className="flex-row items-center gap-2">
            {/* Type Filter Dropdown Trigger */}
            <TouchableOpacity
              onPress={() => setIsTypeMenuOpen(true)}
              className={`flex-row items-center gap-1 px-3 py-1.5 rounded-md ${selectedType !== "All" ? "bg-blue-100 border-blue-200" : "bg-blue-50 border-transparent"} border`}
            >
              <MaterialIcons name="filter-list" size={14} color="#2563EB" />
              <Text className="text-[10px] font-bold tracking-widest uppercase text-blue-600 ml-1">
                Type: {selectedType}
              </Text>
              <MaterialIcons name="expand-more" size={14} color="#2563EB" />
            </TouchableOpacity>

            <TouchableOpacity className="px-3 py-1.5 rounded-md bg-slate-50 border border-gray-100">
              <Text className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                Upcoming
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="px-3 py-1.5 rounded-md bg-slate-50 border border-gray-100">
              <Text className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                Past
              </Text>
            </TouchableOpacity>
          </View>
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
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          ListEmptyComponent={<EmptyState />}
          renderSectionHeader={({ section: { title } }) => (
            <View className="flex-row items-center gap-3 mb-4 mt-2">
              <Text className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                {title}
              </Text>
              <View className="h-[1px] bg-gray-100 flex-1" />
            </View>
          )}
          renderItem={({ item }) => <EventCard event={item} />}
        />
      )}

      {/* Type Selection Modal (Acts as Dropdown) */}
      <Modal
        visible={isTypeMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsTypeMenuOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-center items-center px-10"
          activeOpacity={1}
          onPress={() => setIsTypeMenuOpen(false)}
        >
          <View className="bg-white w-full rounded-2xl overflow-hidden shadow-lg">
            <View className="p-4 bg-slate-50 border-b border-gray-100">
              <Text className="text-sm font-bold text-slate-800 text-center">
                Select Event Type
              </Text>
            </View>
            {EVENT_TYPES.map((type, index) => (
              <TouchableOpacity
                key={type}
                className={`py-4 border-b border-gray-50 ${selectedType === type ? "bg-blue-50" : "bg-white"} ${index === EVENT_TYPES.length - 1 ? "border-b-0" : ""}`}
                onPress={() => {
                  setSelectedType(type as EventType | "All");
                  setIsTypeMenuOpen(false);
                }}
              >
                <Text
                  className={`text-center font-medium ${selectedType === type ? "text-blue-600" : "text-slate-600"}`}
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
        className="absolute bottom-36 right-6 h-14 w-14 bg-blue-600 rounded-full shadow-sm items-center justify-center z-30 border-2 border-white"
        onPress={() => router.push("/event/eventCreateScreen")}
      >
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
