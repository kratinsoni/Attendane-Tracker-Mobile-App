import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
const EVENT_TYPES = ['All', 'Assignment', 'Lecture', 'Workshop', 'Social', 'Test'];

export const EventsScreen = () => {
  const { data: events, isLoading, isError } = useEvents();
  
  // States for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<EventType | 'All'>('All');
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);

  // Process data: Sort -> Search Filter -> Type Filter -> Group
  const sectionedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    // 1. ALWAYS sort all events chronologically first (earliest date first)
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let eventsToDisplay = sortedEvents;

    // 2. Filter by Search Query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      eventsToDisplay = eventsToDisplay.filter(
        (event) =>
          event.name?.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query)
      );
    }

    // 3. Filter by Event Type
    if (selectedType !== 'All') {
      eventsToDisplay = eventsToDisplay.filter(
        (event) => event.type === selectedType
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
      [] as { title: string; data: AppEvent[] }[]
    );
  }, [events, searchQuery, selectedType]);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-12 pb-5 bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-slate-900 leading-tight">
            Events
          </Text>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity className="p-2 rounded-full bg-slate-50 border border-gray-100">
              <MaterialIcons
                name="notifications-none"
                size={18}
                color="#94A3B8"
              />
            </TouchableOpacity>
            {/* Profile Initials */}
            <View className="w-7 h-7 rounded-full bg-slate-200 items-center justify-center border-2 border-white">
              <Text className="text-[8px] font-bold text-gray-600">JD</Text>
            </View>
          </View>
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
              className={`flex-row items-center gap-1 px-3 py-1.5 rounded-md ${selectedType !== 'All' ? 'bg-blue-100 border-blue-200' : 'bg-blue-50 border-transparent'} border`}
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
              <Text className="text-sm font-bold text-slate-800 text-center">Select Event Type</Text>
            </View>
            {EVENT_TYPES.map((type, index) => (
              <TouchableOpacity
                key={type}
                className={`py-4 border-b border-gray-50 ${selectedType === type ? 'bg-blue-50' : 'bg-white'} ${index === EVENT_TYPES.length - 1 ? 'border-b-0' : ''}`}
                onPress={() => {
                  setSelectedType(type as EventType | 'All');
                  setIsTypeMenuOpen(false);
                }}
              >
                <Text className={`text-center font-medium ${selectedType === type ? 'text-blue-600' : 'text-slate-600'}`}>
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
    </View>
  );
};