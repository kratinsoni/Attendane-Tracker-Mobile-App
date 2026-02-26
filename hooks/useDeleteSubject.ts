import { api, subjectApi } from '@/utils/api'; 
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return subjectApi.deleteSubject(api, id);
    },

    onSuccess: async () => {
      // Invalidate the general subjects list so the deleted item disappears
      await queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        console.error("Failed to delete subject:", error.response?.data || error.message);
      }
    },
  });
};