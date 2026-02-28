import { useQuery } from '@tanstack/react-query';
import { api, eventApi } from '../utils/api';
import { AppEvent } from '../types/event';

export const useEvents = () => {
  return useQuery<AppEvent[], Error>({
    queryKey: ['events'],
    queryFn: () => eventApi.getAllEvents(api),
    // Optional: Keep data fresh based on your app's needs
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
  });
};