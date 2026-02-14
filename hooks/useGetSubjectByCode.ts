import { api, subjectApi } from '@/utils/api'; // Adjust path as needed
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
// import { SubjectType } from "../types/subjectTypes"; // Optional: Import your Subject type if you have it

export const useGetSubjectByCode = (code: string) => {
  return useQuery({
    // Unique key for caching. If 'code' changes, the query re-runs.
    queryKey: ['subject', code],
    
    // The function to run
    queryFn: async () => {
      console.log(code);
      return subjectApi.getSubjectByCode(api, code);
    },
    
    // Only run this query if 'code' is not null/empty.
    // This prevents the hook from firing errors while params are loading.
    enabled: !!code,

    // Optional: How long the data remains fresh (e.g., 5 minutes)
    staleTime: 1000 * 60 * 5, 
    
    // Optional: Retry logic (e.g., don't retry on 404s, but retry on network errors)
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false; // Don't retry if subject doesn't exist
      }
      return failureCount < 3;
    },
  });
};