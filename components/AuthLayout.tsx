import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { useMe } from "@/hooks/useMe";
import { router } from "expo-router";
import LoadingScreen from "./Loading";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, isError } = useMe();

  useEffect(() => {
    if (!isLoading && (isError || !data)) {
      router.replace("/(auth)/login");
    }
  }, [isLoading, isError, data]);

  if (isLoading) {
    return (
      <LoadingScreen />
    );
  }

  if (isError || !data) {
    return null; // navigation handled in useEffect
  }

  return <View style={{ flex: 1 }}>{children}</View>;
};

export default AuthLayout;
