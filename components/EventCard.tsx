import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { AppEvent, EventType } from "../types/event";

interface EventCardProps {
  event: AppEvent;
}

// Split styles into view (background/border) and text to work properly in NativeWind
const getBadgeStyles = (type: EventType) => {
  switch (type) {
    case "Exam":
      return {
        view: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800",
        text: "text-red-700 dark:text-red-300",
      };
    case "Assignment":
      return {
        view: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-300",
      };
    case "Test":
      return {
        view: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
        text: "text-amber-700 dark:text-amber-300",
      };
    case "Other":
      return {
        view: "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800",
        text: "text-purple-700 dark:text-purple-300",
      };
    default:
      return {
        view: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        text: "text-gray-700 dark:text-gray-300",
      };
  }
};

// Helper to format ISO date string to "10:00 AM"
const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const EventCard = ({ event }: EventCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const badgeStyles = getBadgeStyles(event.type);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="bg-white dark:bg-slate-800 rounded-3xl p-5 mb-4 shadow-sm border border-gray-100 dark:border-slate-700"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center gap-2">
          <View
            className={`px-2 py-0.5 rounded border ${badgeStyles.view}`}
          >
            <Text className={`text-[10px] font-bold uppercase tracking-wide ${badgeStyles.text}`}>
              {event.type}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <MaterialIcons 
            name="more-horiz" 
            size={20} 
            color={isDark ? "#64748B" : "#94A3B8"} 
          />
        </TouchableOpacity>
      </View>

      <Text className="text-lg font-semibold mb-1 text-slate-900 dark:text-slate-50">
        {event.name}
      </Text>

      <View className="flex-row items-center gap-1.5 mb-3">
        <MaterialIcons 
          name="location-on" 
          size={14} 
          color={isDark ? "#94A3B8" : "#64748B"} 
        />
        <Text className="text-sm text-slate-500 dark:text-slate-400">
          {event.location}
        </Text>
      </View>

      <Text
        numberOfLines={2}
        className="text-sm text-zinc-500 dark:text-zinc-400"
      >
        {event.description}
      </Text>
    </TouchableOpacity>
  );
};