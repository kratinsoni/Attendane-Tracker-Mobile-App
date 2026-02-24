import { api, timetableApi } from "@/utils/api";
import { QueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export const useCreateTimetable = () => {
  const queryClient = new QueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      semester,
    }: {
      name: string;
      semester: string;
    }) => {
      return timetableApi.createTimetable(api, name, semester);
    },
    onSuccess: (data) => {
      console.log("Timetable created successfully:", data);
      Toast.show({
        type: "success",
        text1: "Timetable Created",
        position: "bottom",
      });
      queryClient.invalidateQueries({
        queryKey: ["userTimetables"],
      });
      router.replace("/timetable");
    },
    onError: (error) => {
      let message = "Timetable Creation failed";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message; // 👈 backend message // fallback
      }

      console.error("Timetable Creation failed:", error);

      Toast.show({
        type: "error",
        text1: "Timetable Creation Failed",
        text2: message,
        position: "bottom",
      });
    },
  });
};

export const useCreateTimetableByImage = () => {
  const queryClient = new QueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return timetableApi.createTimetableByImage(api, formData);
    },
    onSuccess: (data) => {
      console.log("Timetable created successfully:", data);
      Toast.show({
        type: "success",
        text1: "Timetable Created",
        position: "bottom",
      });
      queryClient.invalidateQueries({
        queryKey: ["userTimetables"],
      });
      router.replace("/timetable");
    },
    onError: (error) => {
      let message = "Timetable Creation failed";
      
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message; // 👈 backend message // fallback
      }

      console.error("Timetable Creation failed:", error);

      Toast.show({
        type: "error",
        text1: "Timetable Creation Failed",
        text2: message,
        position: "bottom",
      });
    },
  });
}
