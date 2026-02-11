import { api, userApi } from '@/utils/api';
import { useMutation } from "@tanstack/react-query";
import axios from 'axios';
import { router } from 'expo-router';
import Toast from "react-native-toast-message";

export const useRegisterInit = () => {
  return useMutation({
    mutationFn: (instituteId: string) => userApi.registerInit(api, instituteId),
    onSuccess: (data, instituteId) => {
      Toast.show({
        type: "success",
        text1: "OTP Sent",
        text2: "Check your email for the verification code.",
      });
    },
    onError: (error: any) => {
      let message = "Login failed";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message; // 👈 backend message // fallback
      }

      console.error("Register failed:", error);

      Toast.show({
        type: "error",
        text1: "Register Failed",
        text2: message,
        position: "bottom",
      });
    }
  });
};