import { useQuery } from "@tanstack/react-query";
import { api, timetableApi } from "@/utils/api";

export const useGetAllTimetablesOfUser = () => {
  return useQuery({
    queryKey: ['timetables', 'user'],
    queryFn: async () => {
      return timetableApi.getAllTimetablesOfUser(api);
    },
  });
}