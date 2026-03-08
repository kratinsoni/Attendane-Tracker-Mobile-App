import { api, userApi } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export const useEditProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedData: {
      firstName: string;
      lastName: string;
      rollNo: string;
      graduationYear: number;
      department: string;
    }) => {
      return userApi.updateProfile(api, updatedData);
    },
    onSuccess: async () => {
        console.log("Profile updated successfully!");
        Toast.show({
            type: 'success',
            text1: 'Profile updated successfully!',
        });
        await queryClient.invalidateQueries({
          queryKey: ['me']
        })
        router.replace("/profile/profile");
    },
    onError: (error) => {
        console.error("Failed to update profile", error);
        Toast.show({
            type: 'error',
            text1: 'Failed to update profile. Please try again.',
        });
    }
  });
};
