import { useQuery } from "@tanstack/react-query";
import { api, attendanceApi } from "../utils/api";

export const useGetAttendanceBySubject = (subjectId: string) => {
  return useQuery({
    queryKey: ["attendance", "subject", subjectId],
    queryFn: async () => {
      console.log("Fetching attendance for subject:", subjectId);
      return await attendanceApi.getAttendanceBySubject(api, subjectId);
    },
    enabled: !!subjectId, // Only fetch if subjectId exists
    staleTime: 1000 * 60 * 5, // Optional: Cache data for 5 minutes
  });
};