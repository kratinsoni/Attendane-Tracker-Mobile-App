import { api, subjectApi } from '@/utils/api';
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetSubjectById = (id: string) => {
  return useQuery({
    // Unique key for caching specific to the ID
    queryKey: ['subject', 'id', id],
    
    queryFn: async () => {
      return subjectApi.getSubjectById(api, id);
    },
    
    // Only run if the id is present
    enabled: !!id,

    // Cache remains fresh for 5 minutes
    staleTime: 1000 * 60 * 5, 
    
    retry: (failureCount, error) => {
      // Don't retry if the subject isn't found
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false; 
      }
      return failureCount < 3;
    },
  });
};