import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const EmptyState = () => {
  return (
    <View className="flex-1 items-center justify-center py-20 px-4">
      <View className="h-20 w-20 rounded-full bg-muted-light dark:bg-muted-dark items-center justify-center mb-4">
        <MaterialIcons name="event-busy" size={40} color="#a1a1aa" />
      </View>
      <Text className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
        No Events Found
      </Text>
      <Text className="text-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
        It looks like there are no events scheduled. Tap the + button to create a new event.
      </Text>
    </View>
  );
};