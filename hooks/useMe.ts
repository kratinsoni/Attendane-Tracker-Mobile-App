import { api, userApi } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

export const useMe = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const response = await userApi.me(api);
            console.log("Fetched user data:", response.data); // Debug log
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}