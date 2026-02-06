import { api , subjectApi} from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

export const useGetAllSubjects = () => {
    return useQuery({
        queryKey: ['subjects'],
        queryFn: async () => {
            const response = await subjectApi.getAllSubjects(api);
            console.log("Fetched subjects data:", response.data.data);
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}