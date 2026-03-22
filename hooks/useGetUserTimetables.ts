import { api, timetableApi } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"
import { useIsFocused } from "@react-navigation/native"


export const useGetUserTimetables = () => {
    return useQuery({
        queryKey: ['userTimetables'],
        queryFn: async () => {
            return timetableApi.getUserTimetables(api);
        },
        enabled: useIsFocused(),
    });
}