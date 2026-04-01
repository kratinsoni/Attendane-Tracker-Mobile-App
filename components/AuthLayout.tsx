// components/AuthLayout.tsx
import { authenticate, isBiometricEnabled } from "@/utils/biometric";
import { useMe } from "@/hooks/useMe";
import { getToken } from "@/utils/token";
import { isAxiosError } from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import LoadingScreen from "./Loading";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [biometricRequired, setBiometricRequired] = useState<boolean | null>(
    null,
  );
  const [biometricPassed, setBiometricPassed] = useState(false);

  const { data, isLoading, isError, error } = useMe();

  useEffect(() => {
    Promise.all([
      getToken().then((token) => setHasToken(!!token)),
      isBiometricEnabled().then(setBiometricRequired),
    ]).catch(() => {
      setHasToken(false);
      setBiometricRequired(false);
    });
  }, []);

  // Trigger biometric prompt as soon as we know it's required
  useEffect(() => {
    if (biometricRequired === true && !biometricPassed) {
      authenticate().then((success) => {
        if (success) {
          setBiometricPassed(true);
        } else {
          router.replace("/(auth)/login");
        }
      });
    }
  }, [biometricRequired]);

  useEffect(() => {
    // Redirect if no token in storage
    if (hasToken === false) {
      router.replace("/(auth)/login");
      return;
    }

    if (!isLoading && isError) {
      const is401 = isAxiosError(error) && error.response?.status === 401;
      const isNetworkError = isAxiosError(error) && !error.response;

      // Keep user logged in on network errors (offline, slow wifi, etc.)
      if (isNetworkError) return;

      // Only redirect on actual auth failures
      if (is401) router.replace("/(auth)/login");
    }
  }, [hasToken, isLoading, isError, error]);

  if (hasToken === null || biometricRequired === null || isLoading) {
    return <LoadingScreen />;
  }

  // Don't kick out on network errors — just render children with stale cache
  if (isError) {
    const isNetworkError = isAxiosError(error) && !error.response;
    if (!isNetworkError) return null;
  }

  // Block rendering until biometric passes
  if (biometricRequired && !biometricPassed) {
    return <LoadingScreen />;
  }

  return <View style={{ flex: 1 }}>{children}</View>;
};
