import { api, subjectApi } from '@/utils/api'; 
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Assuming types are imported from where they are defined
import { CreateSubjectPayload } from '@/types/subjectTypes'; 

interface UpdateSubjectVariables {
  id: string;
  payload: Partial<CreateSubjectPayload>;
}

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateSubjectVariables) => {
      return subjectApi.updateSubject(api, id, payload);
    },

    onSuccess: async (data, variables) => {
      // 1. Invalidate 'subjects' queries to refresh lists
      await queryClient.invalidateQueries({ queryKey: ['subjects'] });
      
      // 2. Optional: You can also invalidate the specific subject detail
      await queryClient.invalidateQueries({ queryKey: ['subject', 'id', variables.id] });
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        console.error("Failed to update subject:", error.response?.data || error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    },
  });
};