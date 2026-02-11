import { useMutation } from "@tanstack/react-query";
import { SubjectFormData, Day } from "../types/subjectFormType"; 
import { api, subjectApi } from "@/utils/api"; 
// // 1. Define the specific API function wrapper
// const createSubjectApi = async (
//   apiInstance: AxiosInstance,
//   formData: SubjectFormData
// ) => {
//   // Convert 'schedules' map to a flat array of strings
//   // NOTE: This sends just the time string (e.g. "8:00 AM - 8:55 AM").
//   // If your backend needs the Day included (e.g. "Monday 8:00..."), modify this map.
//   const flatSlots: string[] = Object.values(formData.schedules).flat();

//   const res = await apiInstance.post("/subjects/", {
//     name: formData.name,
//     code: formData.code,
//     type: formData.type,
//     professor: formData.professor,
//     credits: Number(formData.credits), // Convert to number
//     slots: flatSlots,
//     Grading: formData.Grading, 
//     labLength: formData.labLength ? Number(formData.labLength) : undefined, // Optional
//   });
  
//   return res.data.data;
// };

// 2. The Hook

export const useCreateSubject = () => {

  return useMutation({
    mutationFn: async (formData: SubjectFormData) => {
      
      if (!formData.name || !formData.code || !formData.professor) {
        throw new Error("Name, Code, and Professor are required.");
      }
      
      return subjectApi.createSubject(api, formData);
    },
  });
};