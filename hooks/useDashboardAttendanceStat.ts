import { api, dashboardApi } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export const useGetTopAttendance = () => {
    return useQuery({
        queryKey: ['userTopAttendance'],
        queryFn: async () => {
            return dashboardApi.getTopAttendance(api);
        },
    });
}

export const useGetLeastAttendance = () => {
    return useQuery({
        queryKey: ['userLeastAttendance'],
        queryFn: async () => {
            return dashboardApi.getLeastAttendance(api);
        },
    });
}