import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, eventApi } from '../utils/api';
import { AppEvent } from '../types/event';
import { useIsFocused } from '@react-navigation/native';

export const useEvents = () => {
  return useQuery<AppEvent[], Error>({
    queryKey: ['events'],
    queryFn: () => eventApi.getAllEvents(api),
    enabled: useIsFocused(),
    // Optional: Keep data fresh based on your app's needs
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
  });

};

// Mutation hook for toggling reminders
export const useToggleReminders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, notificationIds }: { eventId: string; notificationIds: string[] }) => 
      eventApi.toggleEventReminders(api, eventId, notificationIds),
    onSuccess: () => {
      // Automatically refetch the events list so the UI stays in sync with the DB
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// NEW: Mutation hook for editing/updating an event
export const useEditEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, updates }: { eventId: string; updates: Partial<AppEvent> }) => 
      // Ensure eventApi.updateEvent exists in your api utils
      eventApi.updateEvent(api, eventId, updates),
    onSuccess: () => {
      // Refetch events so the edited data renders globally
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventApi.deleteEvent(api, eventId),
    onSuccess: () => {
      // Refetch events so the deleted item is removed from the list globally
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteMultipleEvents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids }: { ids: string[] }) => eventApi.deleteMultipleEvents(api, ids),
    onSuccess: () => {
      // Refetch events so the deleted items are removed from the list globally
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
