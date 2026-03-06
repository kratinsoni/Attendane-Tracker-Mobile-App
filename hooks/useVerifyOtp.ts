import { api, userApi } from '@/utils/api';
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async ({ instituteId, otp, event }: { instituteId: string; otp: string; event: string }) => {
      return userApi.verifyOtp(api, instituteId, otp);
    },
    onSuccess: (data, variables) => {
      Toast.show({
        type: "success",
        text1: "Verification Successful",
        position: "top",
      });

      if (variables.event === "register")
        router.push({
          pathname: "/register",
          params: { instituteId: variables.instituteId }
        });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Invalid OTP";
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: message,
        position: "top",
      });
    },
  });
};