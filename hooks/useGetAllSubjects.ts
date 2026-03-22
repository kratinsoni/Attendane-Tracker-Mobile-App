import { SubjectInterface } from "@/types/subjectTypes";
import { api , subjectApi} from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useIsFocused } from "@react-navigation/native";

export const useGetAllSubjects = () => {
    return useQuery<SubjectInterface[]>({
        queryKey: ['subjects'],
        queryFn: async () => {
            const response = await subjectApi.getAllSubjects(api);
            return response;
        },
        enabled: useIsFocused(),
        // staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
