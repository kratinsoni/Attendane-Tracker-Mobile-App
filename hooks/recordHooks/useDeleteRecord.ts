import { api, recordApi } from '@/utils/api';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export const useDeleteRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      return recordApi.deleteRecord(api, recordId);
    },
    onSuccess: async () => {
      // 🔄 Invalidate 'records' cache
      await queryClient.invalidateQueries({ queryKey: ['records'] });

      Toast.show({
        type: "success",
        text1: "Record deleted successfully",
        position: "bottom",
      });
    },
    onError: (error) => {
      let message = "Failed to delete record";
      
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      }

      console.log("Record deletion error:", error);

      Toast.show({
        type: "error",
        text1: "Deletion Failed",
        text2: message,
        position: "bottom",
      });
    },
  });
};