import { api, recordApi } from '@/utils/api';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { RecordInterface } from "../../types/recordTypes"; 

export const useUpdateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // React Query's mutationFn only accepts a single variable, so we wrap them in an object
    mutationFn: async ({ data, recordId }: { data: Omit<RecordInterface, "_id">; recordId: string }) => {
    },
    onSuccess: async () => {
      // 🔄 Invalidate 'records' cache
      await queryClient.invalidateQueries({ queryKey: ['records'] });

      Toast.show({
        type: "success",
        text1: "Record updated successfully",
        position: "bottom",
      });
    },
    onError: (error) => {
      let message = "Failed to update record";
      
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      }

      console.log("Record update error:", error);

      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: message,
        position: "bottom",
      });
    },
  });
};