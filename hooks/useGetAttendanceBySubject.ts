import { useQuery } from "@tanstack/react-query";
import { api, attendanceApi } from "../utils/api";

export const useGetAttendanceBySubject = (subjectId: string, semester: number) => {
  return useQuery({
    queryKey: ["attendance", "subject", subjectId, semester],
    queryFn: async () => {
      console.log("Fetching attendance for subject:", subjectId);
      return await attendanceApi.getAttendanceBySubject(api, subjectId, semester);
    },
    enabled: !!subjectId, // Only fetch if subjectId exists
    // staleTime: 1000 * 60 * 5, // Optional: Cache data for 5 minutes
  });
};