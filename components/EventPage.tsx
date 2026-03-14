import { useMe } from "@/hooks/useMe";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
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
// Make sure to export useDeleteMultipleEvents from your hooks file
import * as Haptics from "expo-haptics";
import { ChevronLeft, User } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useDeleteMultipleEvents, useEvents } from "../hooks/useEvents";
import { AppEvent, EventType } from "../types/event";

import CustomAlertModal from "./CustomAlertModal";
import { EventCreateModal } from "./EventCreateModal";

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
  const { data: events, isLoading, isError, refetch } = useEvents();
  const [refreshing, setRefreshing] = useState(false);

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
  // Assume you have created this hook to handle multiple deletions
  const {
    mutateAsync: deleteMultipleEventsMutation,
    isPending: isDeletingMultiple,
  } = useDeleteMultipleEvents();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<EventType | "All">("All");
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [showCreateSuccessAlert, setShowCreateSuccessAlert] = useState(false);

  // Multi-select State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);

  const hasEvents = events && events.length > 0;

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

  const handleSelectAll = () => {
    if (!events) return;
    if (selectedEventIds.length === events.length) {
      setSelectedEventIds([]); // Deselect all if everything is currently selected
    } else {
      setSelectedEventIds(events.map((e) => e._id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedEventIds.length === 0) return;
    Alert.alert(
      "Delete Multiple Events",
      `Are you sure you want to delete ${selectedEventIds.length} event(s)? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Pass the array of IDs to your API route
              await deleteMultipleEventsMutation({ ids: selectedEventIds });
              setIsSelectionMode(false);
              setSelectedEventIds([]);

              Toast.show({
                type: "success",
                text1: "Events Deleted 🗑️",
                text2: "The selected events were permanently removed.",
              });
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Delete Failed",
                text2:
                  "Could not delete the selected events. Please try again.",
              });
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-background-dark">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View className="px-5 pt-2 pb-0">
        {/* Dynamic Header */}
        {isSelectionMode ? (
          <View className="flex-row items-center justify-between mb-4 mt-2 bg-blue-50 dark:bg-slate-800 p-2 rounded-xl">
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                onPress={() => {
                  setIsSelectionMode(false);
                  setSelectedEventIds([]);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons
                  name="close"
                  size={26}
                  color={isDark ? "#E2E8F0" : "#1E293B"}
                />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedEventIds.length} Selected
              </Text>
            </View>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={handleSelectAll} className="mr-2">
                <Text className="text-[#135bec] dark:text-blue-400 font-semibold text-base">
                  Select All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteSelected}
                disabled={selectedEventIds.length === 0 || isDeletingMultiple}
              >
                {isDeletingMultiple ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <MaterialIcons
                    name="delete"
                    size={26}
                    color={selectedEventIds.length === 0 ? "gray" : "#EF4444"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center justify-between mb-4 mt-2">
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                onPress={handleBack}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeft size={28} color="#135bec" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                Events
              </Text>
            </View>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
              <User
                size={24}
                color="#135bec"
                onPress={() => {
                  if (Platform.OS === "android") Vibration.vibrate(20);
                  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/profile/profile");
                }}
              />
            </TouchableOpacity>
          </View>
        )}

        <View className="mb-3 shadow-sm">
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

        <View className="flex-row items-center gap-3 mb-0">
          <TouchableOpacity
            onPress={() => hasEvents && setIsTypeMenuOpen(true)}
            disabled={!hasEvents}
            className={`flex-row items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm ${!hasEvents ? "opacity-50" : ""}`}
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
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 100,
            paddingTop: 8,
          }}
          ListEmptyComponent={<EmptyState />}
          ItemSeparatorComponent={() => <View className="h-1.5" />}
          renderSectionHeader={({ section: { title } }) => (
            <View className="flex-row items-center gap-3 mb-2 mt-6">
              <Text className="text-xs font-bold tracking-wider uppercase text-slate-400">
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              isSelectionMode={isSelectionMode}
              isSelected={selectedEventIds.includes(item._id)}
              // 1. Long press enters selection mode
              onLongPress={() => {
                if (!isSelectionMode) {
                  setIsSelectionMode(true);
                  setSelectedEventIds([item._id]);
                  if (Platform.OS === "android")
                    Vibration.vibrate(40); // Slightly stronger vibration for long press
                  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }
              }}
              // 2. Regular press handles toggling (only if already in selection mode)
              onPress={() => {
                if (isSelectionMode) {
                  setSelectedEventIds((prev) =>
                    prev.includes(item._id)
                      ? prev.filter((id) => id !== item._id)
                      : [...prev, item._id],
                  );
                }
              }}
            />
          )}
        />
      )}

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
                  className={`text-center font-medium ${selectedType === type ? "text-[#135bec] dark:text-blue-400" : "text-slate-600 dark:text-slate-300"}`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {!isSelectionMode && (
        <TouchableOpacity
          activeOpacity={0.9}
          className="absolute bottom-40 right-6 bg-blue-600 w-14 h-14 rounded-full justify-center items-center shadow-lg shadow-blue-300 dark:shadow-none z-10"
          onPress={() => {
            Keyboard.dismiss();
            setIsCreateModalVisible(true);
          }}
        >
          <MaterialIcons name="add" size={30} color="#ffffff" />
        </TouchableOpacity>
      )}

      <EventCreateModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreateSuccess={() => {
          setTimeout(() => {
            setShowCreateSuccessAlert(true);
          }, 120);
        }}
      />

      <CustomAlertModal
        visible={showCreateSuccessAlert}
        title="Success"
        message="Event created successfully!"
        type="success"
        onClose={() => setShowCreateSuccessAlert(false)}
      />
    </SafeAreaView>
  );
};
