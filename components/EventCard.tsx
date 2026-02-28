import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppEvent, EventType } from '../types/event';

interface EventCardProps {
  event: AppEvent;
}

const getBadgeStyles = (type: EventType) => {
  switch (type) {
    case 'Assignment':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'Lecture':
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'Workshop':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'Social':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  }
};

// Helper to format ISO date string to "10:00 AM"
const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const EventCard = ({ event }: EventCardProps) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 mb-4 shadow-sm"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center gap-2">
          <View className={`px-2 py-0.5 rounded border ${getBadgeStyles(event.type)}`}>
            <Text className="text-[10px] font-bold uppercase tracking-wide">
              {event.type}
            </Text>
          </View>
          <Text className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatTime(event.date)}
          </Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="more-horiz" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <Text className="text-lg font-semibold mb-1 text-slate-900 dark:text-slate-50">
        {event.name}
      </Text>

      <View className="flex-row items-center gap-1.5 mb-3">
        <MaterialIcons name="location-on" size={14} color="#64748b" />
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