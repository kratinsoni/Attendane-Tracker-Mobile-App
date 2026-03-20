import { api, userApi } from "@/utils/api";
import { saveToken } from "@/utils/token";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export const useLogin = () => {
  return useMutation({
    mutationFn: async ({
      instituteId,
      password,
    }: {
      instituteId: string;
      password: string;
    }) => {
      return userApi.login(api, instituteId, password);
    },

    onSuccess: async (data) => {
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;

      await saveToken(accessToken, refreshToken);
      console.log("JWT and Refresh Token saved successfully");
      Toast.show({
        type: "success",
        text1: "Login Successful",
        position: "bottom",
      });
      router.replace("/dashboard");
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
