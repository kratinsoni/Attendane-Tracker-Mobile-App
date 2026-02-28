import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, eventApi } from '../utils/api';
import { CreateEventPayload } from '../types/event';

export const useAddEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventApi.createEvent(api, payload),
    onSuccess: () => {
      // Refresh the events list when a new event is successfully added
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};