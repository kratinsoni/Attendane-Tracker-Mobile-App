import { CreateSubjectPayload } from "@/types/subjectTypes";
import { api , subjectApi} from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

export const useGetAllSubjects = () => {
    return useQuery<CreateSubjectPayload[]>({
        queryKey: ['subjects'],
        queryFn: async () => {
            const response = await subjectApi.getAllSubjects(api);
            return response.data.data as CreateSubjectPayload[];
        },
        // staleTime: 5 * 60 * 1000, // 5 minutes
    });
}