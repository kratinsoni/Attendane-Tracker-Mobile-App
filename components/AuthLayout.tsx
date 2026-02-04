import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { useMe } from "@/hooks/useMe";
import { router } from "expo-router";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, isError } = useMe();

  useEffect(() => {
    if (!isLoading && (isError || !data)) {
      router.replace("/(auth)/login");
    }
  }, [isLoading, isError, data]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return null; // navigation handled in useEffect
  }

  return <View style={{ flex: 1 }}>{children}</View>;
};

export default AuthLayout;
