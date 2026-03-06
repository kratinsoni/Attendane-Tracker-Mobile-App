import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Toast from "react-native-toast-message";
import { api, attendanceApi } from "../utils/api";

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      attendanceId: string;
      type: string; // e.g., "Present", "Absent"
      subjectId: string; // Required to refresh the specific list
    }) => {
      console.log("Updating attendance type:", data);

      // Assuming your API utility has this method. 
      // If not, replace this line with: await api.patch(`/attendance/${data.attendanceId}`, { status: data.status });
      return await attendanceApi.editAttendanceStatus(
        api,
        data.attendanceId,
        data.type
      );
    },

    onSuccess: (_, variables) => {
      console.log("Attendance updated successfully");
      
      Toast.show({
        type: "success",
        text1: "Attendance updated successfully",
      });

      // Invalidate the specific subject list so the UI updates immediately
      queryClient.invalidateQueries({
        queryKey: ["attendance", "subject", variables.subjectId],
      });
    },

    onError: (error) => {
      let message = "Update failed";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      }

      console.error("Attendance update failed:", error);

      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: message,
        position: "bottom",
      });
    },
  });
};