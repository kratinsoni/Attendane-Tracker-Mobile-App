import { useQuery } from "@tanstack/react-query";
import { api, attendanceApi } from "@/utils/api";

export const useGetAttendanceForDateByTimetable = ({timetableId, date} : {timetableId: string, date: string}) => {
    return useQuery({
        queryKey: ["attendance", timetableId, date],
        queryFn: async () => {
            return attendanceApi.getAttendanceForDateByTimetable(api, timetableId, date);
        }
    });
}