import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Toast from "react-native-toast-message";
import { api, attendanceApi } from "../utils/api";

export const useCreateAttendance = ({timetableId, date}: {timetableId: string, date: string}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      subjectId: string;
      day: string;
      type: string;
      timeSlot: string;
      date: string;
      semester: number;
    }) => {

        console.log("Creating attendance with data:", data);

      return await attendanceApi.createAttendance(
        api,
        data.subjectId,
        data.day,
        data.type,
        data.timeSlot,
        data.date,
        data.semester,
      );
    },

    onSuccess: () => {
      console.log("Attendance created successfully");
      Toast.show({
        type: "success",
        text1: "Attendance created successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance", timetableId, date],
      });
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
