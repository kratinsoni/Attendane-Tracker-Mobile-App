import { api, detailsApi } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useIsFocused } from "@react-navigation/native";

export const useGetAttendanceStatBySemester = (semester: number) => {
  return useQuery({
    queryKey: ["attendanceStat", semester],
    queryFn: async () => {
      return detailsApi.getAttendanceStatBySemester(api, semester);
    },
    enabled: !!semester && useIsFocused(), // Only run if semester is provided
  });
};

export const useGetAttendanceStatOfAllSubjects = (semester: number) => {
  return useQuery({
    queryKey: ["attendanceStat", "allSubjects", semester],
    queryFn: async () => {
      return detailsApi.getAttendanceStatOfAllSubjects(api, semester);
    },
    enabled: !!semester && useIsFocused(),
  });
};

export const useGetAttendanceStatOfAllTimetables = (semester: number) => {
  return useQuery({
    queryKey: ["attendanceStat", "allTimetables", semester],
    queryFn: async () => {
      return detailsApi.getAttendanceStatOfAllTimetables(api, semester);
    },
    enabled: !!semester && useIsFocused(),
  });
};

export const useGetAttendanceStatByTimetable = (timetableId: string) => {
  return useQuery({
    queryKey: ["attendanceStat", "timetable", timetableId],
    queryFn: async () => {
      return detailsApi.getAttendanceStatByTimetable(api, timetableId);
    },
    enabled: !!timetableId && useIsFocused(),
  });
};
