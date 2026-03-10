import { api, recordApi } from '@/utils/api';
import { useQuery } from "@tanstack/react-query";

export const useGetAllRecordsBySubjectAndSemester = (subjectId: string, semester: number) => {
  return useQuery({
    // Include subjectId and semester in the queryKey so TanStack caches them correctly
    queryKey: ['records', subjectId, semester], 
    queryFn: async () => {
      return recordApi.getAllRecordsBySubjectAndSemester(api, subjectId, semester);
    },
    // Only run the query if we have both required parameters
    enabled: !!subjectId && !!semester, 
  });
};