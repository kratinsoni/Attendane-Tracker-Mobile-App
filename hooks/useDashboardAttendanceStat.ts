import { api, dashboardApi } from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export const useGetAttendanceStats = () => {
    return useQuery({
        queryKey: ['attendanceStats'],
        queryFn: async () => {
            return dashboardApi.getAttendanceStats(api);
        },
    });
}

export const useGetUpcomingClasses = () => {
    return useQuery({
        queryKey: ['userUpcomingClasses'],
        queryFn: async () => {
            return dashboardApi.getUpcomingClasses(api);
        },
    });
}