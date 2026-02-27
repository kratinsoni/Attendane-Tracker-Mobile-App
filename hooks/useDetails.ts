import { api, detailsApi } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

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
    queryFn: async () => {
      return detailsApi.getAttendanceStatOfAllSubjects(api);
    },
  });
};

export const useGetAttendanceStatOfAllTimetables = (semester: number) => {
  return useQuery({
    queryKey: ["attendanceStat", "allTimetables", semester],
    queryFn: async () => {
      return detailsApi.getAttendanceStatOfAllTimetables(api, semester);
    },
  });
};

export const useGetAttendanceStatByTimetable = (timetableId: string) => {
  return useQuery({
    queryKey: ["attendanceStat", "timetable", timetableId],
    queryFn: async () => {
      return detailsApi.getAttendanceStatByTimetable(api, timetableId);
    },
    enabled: !!timetableId,
  });
};
