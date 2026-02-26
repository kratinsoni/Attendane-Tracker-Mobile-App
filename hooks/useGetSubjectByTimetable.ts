import { api, subjectApi } from '@/utils/api'; 
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetSubjectsByTimetableId = (timetableId: string) => {
  return useQuery({
    // Cache key includes the specific timetable ID
    queryKey: ['subjects', 'timetable', timetableId],
    
    queryFn: async () => {
      return subjectApi.getSubjectsByTimetableId(api, timetableId);
    },
    
    // Only run if an ID string is actually present
    enabled: !!timetableId,

    staleTime: 1000 * 60 * 5,
    
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false; 
      }
      return failureCount < 3;
    },
  });
};