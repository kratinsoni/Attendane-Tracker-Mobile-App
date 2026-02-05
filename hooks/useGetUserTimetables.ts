import { api, timetableApi } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export const useGetUserTimetables = () => {
    return useQuery({
        queryKey: ['userTimetables'],
        queryFn: async () => {
            return timetableApi.getUserTimetables(api);
        },
    });
}