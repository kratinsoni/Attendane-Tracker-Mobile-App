import { api, timetableApi } from "@/utils/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export const useCreateTimetable = () => {
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
      router.push("/timetable/TimetableHomePage");
    },
    onError: (error) => {
      let message = "Login failed";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message; // 👈 backend message // fallback
      }

      console.error("Login failed:", error);

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: message,
        position: "bottom",
      });
    },
  });
};
