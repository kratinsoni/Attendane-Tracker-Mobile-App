import { useMe } from "@/hooks/useMe";
import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import LoadingScreen from "./Loading";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, isError } = useMe();

  useEffect(() => {
    if (!isLoading && (isError || !data)) {
      router.replace("/(auth)/login");
    }
  }, [isLoading, isError, data]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !data) {
    return null;
  }

  return <View style={{ flex: 1 }}>{children}</View>;
};
