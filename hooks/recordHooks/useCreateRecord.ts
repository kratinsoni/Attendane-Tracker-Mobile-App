import { api, recordApi } from '@/utils/api';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { RecordInterface } from "../../types/recordTypes"; 

export const useCreateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<RecordInterface, "_id">) => {
      console.log(data);
      return recordApi.createRecord(api, data);
    },
    onSuccess: async () => {
      // 🔄 Invalidate 'records' cache so the UI updates automatically
      await queryClient.invalidateQueries({ queryKey: ['records'] });

      Toast.show({
        type: "success",
        text1: "Record created successfully",
        position: "bottom",
      });
    },
    onError: (error) => {
      let message = "Failed to create record";
      
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      }

      console.log("Record creation error:", error);

      Toast.show({
        type: "error",
        text1: "Creation Failed",
        text2: message,
        position: "bottom",
      });
    },
  });
};