import { api, subjectApi } from '@/utils/api'; 
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// ---------------------------------------------------------
// Hook: Get Subjects by Semester
// ---------------------------------------------------------
export const useGetSubjectsBySemester = (semester: number) => {
  return useQuery({
    // Cache key includes 'semester' so it refetches when the semester changes
    queryKey: ['subjects', 'semester', semester],
    
    queryFn: async () => {
      return subjectApi.getSubjectsBySemester(api, semester);
    },
    
    // Only run if semester is provided and valid (assuming semester 0 is not valid)
    enabled: !!semester,

    // Keep data fresh for 5 minutes
    staleTime: 1000 * 60 * 5,
    
    retry: (failureCount, error) => {
      // Don't retry if the semester path is invalid (404)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false; 
      }
      return failureCount < 3;
    },
  });
};