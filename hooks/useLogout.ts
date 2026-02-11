import { api, userApi } from "@/utils/api";
import { removeToken } from "@/utils/token";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export const useLogout = () => {
  return useMutation({
    mutationFn: () => userApi.logout(api),
    onSuccess: () => {
      removeToken();
      Toast.show({
        type: "success",
        text1: "Logged Out",
        text2: "You have been successfully logged out.",
      });
      router.replace("/login");
    },
    onError: (error: any) => {
      let message = "Logout failed";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message; // 👈 backend message // fallback
      }

      console.error("Logout failed:", error);

      Toast.show({
        type: "error",
        text1: "Logout Failed",
        text2: message,
        position: "bottom",
      });
    },
  });
};
