import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Toast from "react-native-toast-message";
import { api, userApi } from "../utils/api";
import { router } from "expo-router";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string; 
      confirmNewPassword: string;
    }) => {
      return await userApi.changePassword(
        api,
        data.currentPassword,
        data.newPassword,
        data.confirmNewPassword
      );
    },
    onSuccess: () => {
      router.back();
      Toast.show({
        type: "success",
        text1: "Password changed successfully",
      });
    },
    onError: (error) => {
      let message = "Changing password failed";
      console.log(error);

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message; // 👈 backend message // fallback
      }
      Toast.show({
        type: "error",
        text1: "Changing Password Failed",
        text2: message,
        position: "top",
      });
    }
  });
}

export const useChangeForgotPasswordInit = () => {
  return useMutation({
    mutationFn: async (instituteId: string) => {
      return await userApi.changeForgotPasswordInit(api, instituteId);
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "OTP sent successfully",
      });
    },
    onError: (error) => {
      let message = "Request failed";
      console.log(error);

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message; // 👈 backend message // fallback
      }
      Toast.show({
        type: "error",
        text1: "Request Failed",
        text2: message,
        position: "top",
      });
    }
  })
}

export const useChangeForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: {
      instituteId: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      return await userApi.changeForgotPassword(api, data.instituteId, data.newPassword, data.confirmPassword);
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Password changed successfully",
      });
      router.back();
    },
    onError: (error) => {
      let message = "Changing password failed";
      console.log(error);
      if(axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message; // 👈 backend message // fallback
      }
      Toast.show({
        type: "error",
        text1: "Changing Password Failed",
        text2: message,
        position: "top",
      });
    }
  });
}