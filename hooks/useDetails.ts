import { useQuery } from "@tanstack/react-query";
import { api, detailsApi } from "@/utils/api";

export const useGetAttendanceStatBySemester = (semester: number) => {
  return useQuery({
    queryKey: ["attendanceStat", semester],
    queryFn: async () => {
        return detailsApi.getAttendanceStatBySemester(api, semester);
    },
    enabled: !!semester, // Only run if semester is provided
  });
};

export const useGetAttendanceStatOfAllSubjects = () => {
  return useQuery({
    queryKey: ["attendanceStat", "allSubjects"],
    queryFn: async () => detailsApi.getAttendanceStatOfAllSubjects(api),
  });
};

export const useGetAttendanceStatOfAllTimetables = (semester: number) => {
  return useQuery({
    queryKey: ["attendanceStat", "allTimetables", semester],
    queryFn: async () => detailsApi.getAttendanceStatOfAllTimetables(api, semester),
  });
}