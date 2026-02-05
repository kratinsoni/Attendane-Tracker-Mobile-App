import { useQuery } from "@tanstack/react-query";
import { api, timetableApi } from "@/utils/api";

export const useGetTimetableById = (id: string) => {
    return useQuery({
        queryKey: ['timetable', id],
        queryFn: async () => {
            return timetableApi.getTimetableById(api, id);
        },
    });
}

export const useGetSubjectsByTimetableId = (id: string) => {
    return useQuery({
        queryKey: ['timetable', id, 'subjects'],
        queryFn: async () => {
            const timetable = await timetableApi.getSubjectsByTimetableId(api, id);
            return timetable.subjects;
        },
    });
}