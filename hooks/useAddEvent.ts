import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateEventPayload } from "../types/event";
import { api, eventApi } from "../utils/api";

export const useAddEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) =>
      eventApi.createEvent(api, payload),
    onSuccess: () => {
      // Refresh the events list when a new event is successfully added
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useAddEventFromAudio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      eventApi.createEventFromAudio(api, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
